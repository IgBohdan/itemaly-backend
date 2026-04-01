// src/calendar/dto/event.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { RecurrenceFrequency } from '../entities/recurrence.entity';
import { ReminderMethod, ReminderUnit } from '../entities/reminder.entity';

export class CreateRecurrenceDto {
  @ApiProperty({ enum: RecurrenceFrequency, description: 'Частота повторення' })
  @IsString()
  frequency: RecurrenceFrequency;

  @ApiPropertyOptional({
    default: 1,
    description: 'Інтервал повторення (наприклад, кожні 2 тижні)',
  })
  @IsOptional()
  @IsNumber()
  interval?: number;

  @ApiPropertyOptional({
    type: [Number],
    description: 'Дні тижня для тижневого повторення (0 = неділя, 6 = субота)',
    example: [1, 3, 5],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  daysOfWeek?: number[];

  @ApiPropertyOptional({
    description: 'День місяця для місячного повторення (1-31)',
  })
  @IsOptional()
  @IsNumber()
  dayOfMonth?: number;

  @ApiPropertyOptional({
    description: 'Місяць року для річного повторення (1-12)',
  })
  @IsOptional()
  @IsNumber()
  monthOfYear?: number;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Дата початку повторення',
  })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Дата закінчення повторення',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateRecurrenceDto extends CreateRecurrenceDto {}

export class CreateReminderDto {
  @ApiProperty({
    description: 'Кількість одиниць до події (наприклад, 30 хвилин)',
  })
  @IsNumber()
  time: number;

  @ApiProperty({ enum: ReminderUnit, description: 'Одиниця виміру часу' })
  @IsString()
  unit: ReminderUnit;

  @ApiProperty({ enum: ReminderMethod, description: 'Спосіб нагадування' })
  @IsString()
  method: ReminderMethod;
}

export class UpdateReminderDto extends CreateReminderDto {}

export class CreateEventDto {
  @ApiProperty({ description: 'Назва події' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Опис події' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Дата та час початку',
  })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Дата та час закінчення',
  })
  @IsDateString()
  endDateTime: string;

  @ApiPropertyOptional({ default: false, description: 'Подія на весь день' })
  @IsOptional()
  @IsBoolean()
  isAllDay?: boolean;

  @ApiPropertyOptional({ description: 'Місце проведення' })
  @IsOptional()
  @IsString()
  location?: string;

  // === НОВА КАТЕГОРІЯ (одна) ===
  @ApiPropertyOptional({
    type: String,
    description: 'ID категорії події (визначає основний колір)',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  categoryId?: string;

  // === ТЕГИ (багато) ===
  @ApiPropertyOptional({
    type: [Number],
    description: 'ID тегів події (додаткові мітки)',
    example: [1, 3, 7],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  tagIds?: number[];

  // === ПОВТОРЕННЯ ===
  @ApiPropertyOptional({
    type: () => CreateRecurrenceDto,
    description: 'Налаштування повторення події',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRecurrenceDto)
  recurrence?: CreateRecurrenceDto;

  // === НАГАДУВАННЯ ===
  @ApiPropertyOptional({
    type: [CreateReminderDto],
    description: 'Список нагадувань',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateReminderDto)
  reminders?: CreateReminderDto[];
}

// UpdateEventDto — часткове оновлення
export class UpdateEventDto extends CreateEventDto {}
