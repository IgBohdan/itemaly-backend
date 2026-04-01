import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import { CreateRecurrenceDto, UpdateRecurrenceDto } from '../dto/event.dto';
import { Event } from '../entities/event.entity';
import { Recurrence } from '../entities/recurrence.entity';

@Injectable()
export class RecurrenceService {
  constructor(
    @InjectRepository(Recurrence)
    private recurrenceRepository: Repository<Recurrence>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    private usersService: UsersService,
  ) {}

  async getUserById(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async create(
    eventId: number,
    createRecurrenceDto: CreateRecurrenceDto,
    user: User,
  ): Promise<Recurrence> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId, user: { id: user.id } },
      relations: ['recurrence'],
    });
    if (!event) {
      throw new NotFoundException(`Event with ID ${eventId} not found`);
    }
    if (event.recurrence) {
      throw new ConflictException(
        `Event with ID ${eventId} already has a recurrence rule`,
      );
    }

    const recurrence = this.recurrenceRepository.create({
      ...createRecurrenceDto,
      event,
    });
    return this.recurrenceRepository.save(recurrence);
  }

  async findOne(eventId: number, userId: number): Promise<Recurrence> {
    const recurrence = await this.recurrenceRepository.findOne({
      where: { event: { id: eventId, user: { id: userId } } },
      relations: ['event'],
    });
    if (!recurrence) {
      throw new NotFoundException(
        `Recurrence for event ID ${eventId} not found`,
      );
    }
    return recurrence;
  }

  async update(
    eventId: number,
    updateRecurrenceDto: UpdateRecurrenceDto,
    userId: number,
  ): Promise<Recurrence> {
    const recurrence = await this.findOne(eventId, userId);

    // Filter out undefined values
    const updateData: Partial<Recurrence> = {};
    if (updateRecurrenceDto.frequency !== undefined)
      updateData.frequency = updateRecurrenceDto.frequency;
    if (updateRecurrenceDto.interval !== undefined)
      updateData.interval = updateRecurrenceDto.interval;
    if (updateRecurrenceDto.daysOfWeek !== undefined)
      updateData.daysOfWeek = updateRecurrenceDto.daysOfWeek;
    if (updateRecurrenceDto.dayOfMonth !== undefined)
      updateData.dayOfMonth = updateRecurrenceDto.dayOfMonth;
    if (updateRecurrenceDto.monthOfYear !== undefined)
      updateData.monthOfYear = updateRecurrenceDto.monthOfYear;
    if (updateRecurrenceDto.startDate !== undefined)
      updateData.startDate = new Date(updateRecurrenceDto.startDate);

    if (updateRecurrenceDto.endDate !== undefined)
      updateData.endDate = updateRecurrenceDto.endDate
        ? new Date(updateRecurrenceDto.endDate)
        : undefined;

    Object.assign(recurrence, updateData);
    return this.recurrenceRepository.save(recurrence);
  }

  async remove(eventId: number, userId: number): Promise<void> {
    const result = await this.recurrenceRepository.delete({
      event: { id: eventId, user: { id: userId } },
    });
    if (result.affected === 0) {
      throw new NotFoundException(
        `Recurrence for event ID ${eventId} not found`,
      );
    }
  }
}
