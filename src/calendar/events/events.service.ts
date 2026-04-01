// src/calendar/events/events.service.ts

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Cache } from 'cache-manager';
import { Category } from 'src/categories/category.entity';
import { UsersService } from 'src/users/users.service';
import { In, Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { CreateEventDto, UpdateEventDto } from '../dto/event.dto';
import { Event } from '../entities/event.entity';
import { Recurrence } from '../entities/recurrence.entity';
import {
  Reminder,
  ReminderMethod,
  ReminderUnit,
} from '../entities/reminder.entity';
import { Tag } from '../entities/tag.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    @InjectRepository(Recurrence)
    private recurrenceRepository: Repository<Recurrence>,
    @InjectRepository(Reminder)
    private remindersRepository: Repository<Reminder>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private usersService: UsersService,
  ) {}

  async getUserById(userId: number): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  private async checkEventConflicts(
    startDateTime: Date,
    endDateTime: Date,
    userId: number,
    eventId?: number,
  ): Promise<void> {
    const query = this.eventsRepository
      .createQueryBuilder('event')
      .where('event.user.id = :userId', { userId })
      .andWhere('event.startDateTime < :endDateTime', { endDateTime })
      .andWhere('event.endDateTime > :startDateTime', { startDateTime });

    if (eventId) {
      query.andWhere('event.id != :eventId', { eventId });
    }

    // const conflictingEvents = await query.getMany();

    // if (conflictingEvents.length > 0) {
    //   throw new ConflictException('Event conflicts with an existing event.');
    // }
  }

  async create(createEventDto: CreateEventDto, user: User): Promise<Event> {
    await this.checkEventConflicts(
      new Date(createEventDto.startDateTime),
      new Date(createEventDto.endDateTime),
      user.id,
    );

    const { tagIds, recurrence, reminders, categoryId, ...eventData } =
      createEventDto;

    const event = this.eventsRepository.create({
      ...eventData,
      startDateTime: new Date(eventData.startDateTime),
      endDateTime: new Date(eventData.endDateTime),
      user,
    });

    const savedEvent = await this.eventsRepository.save(event);

    // Категорія
    if (categoryId !== undefined) {
      if (categoryId === null) {
        savedEvent.category = undefined;
      } else {
        const category = await this.categoriesRepository.findOne({
          where: { id: Number(categoryId), user: { id: user.id } },
        });
        if (!category) throw new NotFoundException('Category not found');
        savedEvent.category = category;
      }
    }

    // Теги
    if (tagIds && tagIds.length > 0) {
      const tags = await this.tagsRepository.findBy({
        id: In(tagIds),
        user: { id: user.id },
      });
      savedEvent.tags = tags;
    }

    // Повторення
    if (recurrence) {
      const recurrenceEntity = this.recurrenceRepository.create({
        ...recurrence,
        startDate: new Date(recurrence.startDate),
        endDate: recurrence.endDate ? new Date(recurrence.endDate) : undefined,
        event: savedEvent,
      });
      await this.recurrenceRepository.save(recurrenceEntity);
    }

    // Нагадування
    if (reminders && reminders.length > 0) {
      const reminderEntities = this.remindersRepository.create(
        reminders.map((r) => ({
          time: r.time,
          unit: r.unit || ReminderUnit.MINUTES,
          method: r.method || ReminderMethod.POPUP,
          event: savedEvent,
          user,
        })),
      );
      await this.remindersRepository.save(reminderEntities);
    }

    const finalEvent = await this.eventsRepository.save(savedEvent);

    // Кеш
    await this.cacheManager.del(`all_events_user_${user.id}`);
    await this.cacheManager.del(`event_${finalEvent.id}_user_${user.id}`);

    const completeEvent = await this.eventsRepository.findOne({
      where: { id: finalEvent.id },
      relations: ['recurrence', 'reminders', 'tags', 'category'],
    });
    if (!completeEvent) {
      throw new NotFoundException('Event not found after creation');
    }
    return completeEvent;
  }

  async findAll(userId: number): Promise<Event[]> {
    const cacheKey = `all_events_user_${userId}`;
    const cached = await this.cacheManager.get<Event[]>(cacheKey);
    if (cached) return cached;

    const events = await this.eventsRepository.find({
      where: { user: { id: userId } },
      relations: ['recurrence', 'reminders', 'tags', 'category'],
    });

    await this.cacheManager.set(cacheKey, events, 300);
    return events;
  }

  async findOne(id: number, userId: number): Promise<Event> {
    const cacheKey = `event_${id}_user_${userId}`;
    const cached = await this.cacheManager.get<Event>(cacheKey);
    if (cached) return cached;

    const event = await this.eventsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['recurrence', 'reminders', 'tags', 'category'],
    });

    if (!event) throw new NotFoundException('Event not found');

    await this.cacheManager.set(cacheKey, event, 300);
    return event;
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
    userId: number,
  ): Promise<Event> {
    const event = await this.findOne(id, userId);

    if (updateEventDto.title !== undefined) event.title = updateEventDto.title;
    if (updateEventDto.description !== undefined)
      event.description = updateEventDto.description;
    if (updateEventDto.startDateTime !== undefined)
      event.startDateTime = new Date(updateEventDto.startDateTime);
    if (updateEventDto.endDateTime !== undefined)
      event.endDateTime = new Date(updateEventDto.endDateTime);
    if (updateEventDto.isAllDay !== undefined)
      event.isAllDay = updateEventDto.isAllDay;
    if (updateEventDto.location !== undefined)
      event.location = updateEventDto.location;

    // Перевірка конфліктів
    await this.checkEventConflicts(
      event.startDateTime,
      event.endDateTime,
      userId,
      id,
    );

    // Категорія
    console.log('category id =', updateEventDto.categoryId);
    if (updateEventDto.categoryId !== undefined) {
      if (updateEventDto.categoryId === null) {
        event.category = undefined;
      } else {
        const category = await this.categoriesRepository.findOne({
          where: {
            id: Number(updateEventDto.categoryId),
            user: { id: userId },
          },
        });
        console.log(category);
        if (!category) throw new NotFoundException('Category not found');
        event.category = category;
      }
    }

    // Теги
    if (updateEventDto.tagIds !== undefined) {
      const newTags =
        updateEventDto.tagIds && updateEventDto.tagIds.length > 0
          ? await this.tagsRepository.findBy({
              id: In(updateEventDto.tagIds),
              user: { id: userId },
            })
          : [];
      event.tags = newTags;
    }

    const updatedEvent = await this.eventsRepository.save(event);

    await this.cacheManager.del(`all_events_user_${userId}`);
    await this.cacheManager.del(`event_${id}_user_${userId}`);

    return updatedEvent;
  }

  async remove(id: number, userId: number): Promise<void> {
    const result = await this.eventsRepository.delete({
      id,
      user: { id: userId },
    });
    if (result.affected === 0) {
      throw new NotFoundException('Event not found');
    }

    await this.cacheManager.del(`all_events_user_${userId}`);
    await this.cacheManager.del(`event_${id}_user_${userId}`);
  }
}
