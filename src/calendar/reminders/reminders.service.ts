import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { CreateReminderDto, UpdateReminderDto } from '../dto/event.dto';
import { Event } from '../entities/event.entity';
import {
  Reminder,
  ReminderMethod,
  ReminderUnit,
} from '../entities/reminder.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private remindersRepository: Repository<Reminder>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async getUserById(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  private calculateReminderProcessTime(
    eventStartDateTime: Date,
    time: number,
    unit: ReminderUnit,
  ): Date {
    const processTime = new Date(eventStartDateTime);
    switch (unit) {
      case ReminderUnit.MINUTES:
        processTime.setMinutes(processTime.getMinutes() - time);
        break;
      case ReminderUnit.HOURS:
        processTime.setHours(processTime.getHours() - time);
        break;
      case ReminderUnit.DAYS:
        processTime.setDate(processTime.getDate() - time);
        break;
    }
    return processTime;
  }

  async create(
    eventId: number,
    createReminderDto: CreateReminderDto,
    user: User,
  ): Promise<Reminder> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId, user: { id: user.id } },
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }

    const reminder = this.remindersRepository.create({
      time: createReminderDto.time || user.defaultReminderTime || 15,
      unit:
        createReminderDto.unit ||
        user.defaultReminderUnit ||
        ReminderUnit.MINUTES,
      method:
        createReminderDto.method ||
        user.defaultReminderMethod ||
        ReminderMethod.POPUP,
      event,
      user,
    });
    const savedReminder = await this.remindersRepository.save(reminder);

    const processAt = this.calculateReminderProcessTime(
      event.startDateTime,
      savedReminder.time,
      savedReminder.unit,
    );

    await this.notificationsService.addReminderJob(
      savedReminder.id,
      user.id,
      event.id,
      savedReminder.method,
      savedReminder.time,
      savedReminder.unit,
      processAt,
    );

    return savedReminder;
  }

  async findAll(eventId: number, userId: number): Promise<Reminder[]> {
    return this.remindersRepository.find({
      where: { event: { id: eventId, user: { id: userId } } },
      relations: ['event'],
    });
  }

  async findOne(
    id: number,
    eventId: number,
    userId: number,
  ): Promise<Reminder> {
    const reminder = await this.remindersRepository.findOne({
      where: { id, event: { id: eventId, user: { id: userId } } },
      relations: ['event'],
    });
    if (!reminder) {
      throw new NotFoundException(
        `Reminder with ID ${id} not found for event ${eventId}`,
      );
    }
    return reminder;
  }

  async update(
    id: number,
    eventId: number,
    updateReminderDto: UpdateReminderDto,
    userId: number,
  ): Promise<Reminder> {
    const reminder = await this.findOne(id, eventId, userId);

    // Filter out undefined values
    const updateData: Partial<Reminder> = {};
    if (updateReminderDto.time !== undefined)
      updateData.time = updateReminderDto.time;
    if (updateReminderDto.unit !== undefined)
      updateData.unit = updateReminderDto.unit;
    if (updateReminderDto.method !== undefined)
      updateData.method = updateReminderDto.method;

    Object.assign(reminder, updateData);
    return this.remindersRepository.save(reminder);
  }

  async remove(id: number, eventId: number, userId: number): Promise<void> {
    const result = await this.remindersRepository.delete({
      id,
      event: { id: eventId, user: { id: userId } },
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Reminder with ID ${id} not found for event ${eventId}`,
      );
    }
    // TODO: Consider removing the job from the queue if it hasn't been processed yet
  }
}
