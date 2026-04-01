import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateEventDto } from 'src/calendar/dto/event.dto';
import { Recurrence, Reminder, Tag } from 'src/calendar/entities';
import { CategoriesService } from 'src/categories/categories.service';
import { Category } from 'src/categories/category.entity';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
import { In, Repository } from 'typeorm';
import { Event } from './event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Recurrence)
    private recurrenceRepository: Repository<Recurrence>,
    @InjectRepository(Reminder)
    private remindersRepository: Repository<Reminder>,
    @Inject(CACHE_MANAGER)
    // private cacheManager: Cache,
    private usersService: UsersService, // ← тільки сервіс

    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
    // @Inject(CACHE_MANAGER)
    // private cacheManager: Cache,
    private categoriesService: CategoriesService,
  ) {}
  async getUserById(userId: number): Promise<User> {
    const user = await this.usersService.findById(userId); // вже є
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(
    userId: number,
    title: string,
    startTime: Date,
    endTime: Date,
    categoryId: number,
    description?: string,
  ) {
    console.log(userId, title, startTime, endTime, categoryId, description);
    // const user = await this.usersService.findOneBy({
    //   id: userId,
    // });
    const category = await this.categoriesService.findById(categoryId);

    const event = this.eventsRepository.create({
      title,
      startTime,
      endTime,
      description,
      // user,
      category,
    });
    return this.eventsRepository.save(event);
  }

  async findAll(userId: number) {
    return this.eventsRepository.find({
      where: { user: { id: userId } },
      relations: ['category'],
    });
  }

  async findById(userId: number, eventId: number) {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId, user: { id: userId } },
      relations: ['category'],
    });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
    userId: number,
  ): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['tags'], // завантажуємо поточні теги
    });

    if (!event) throw new NotFoundException('Event not found');

    // Оновлюємо прості поля
    Object.assign(event, {
      title: updateEventDto.title ?? event.title,
      description: updateEventDto.description ?? event.description,
      startTime: updateEventDto.startDateTime ?? event.startTime,
      endTime: updateEventDto.endDateTime ?? event.endTime,
      isAllDay: updateEventDto.isAllDay ?? event.isAllDay,
      location: updateEventDto.location ?? event.location,
    });

    // === ОДНА КАТЕГОРІЯ ===
    if (updateEventDto.categoryId !== undefined) {
      if (updateEventDto.categoryId === null) {
        event.category = null;
      } else {
        const category = await this.categoriesRepository.findOne({
          where: {
            id: Number(updateEventDto.categoryId),
            user: { id: userId },
          },
        });
        if (!category) throw new NotFoundException('Category not found');
        event.category = category;
      }
    }

    // === БАГАТО ТЕГІВ ===
    if (updateEventDto.tagIds !== undefined) {
      const newTags = await this.tagsRepository.findBy({
        id: In(updateEventDto.tagIds),
        user: { id: userId },
      });
      event.tags = newTags;
    }

    const updatedEvent = await this.eventsRepository.save(event);

    // Оновлюємо кеш
    // await this.cacheManager.del(`all_events_user_${userId}`);
    // await this.cacheManager.del(`event_${id}_user_${userId}`);

    return updatedEvent;
  }

  async remove(userId: number, eventId: number) {
    const event = await this.findById(userId, eventId);
    await this.eventsRepository.remove(event);
    return { deleted: true };
  }

  async findAllRemindable(now: Date) {
    // події, що починаються через 10 хвилин
    const in10min = new Date(now.getTime() + 10 * 60000);
    return this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.user', 'user')
      .where('event.startTime BETWEEN :now AND :in10min', { now, in10min })
      .getMany();
  }
}
