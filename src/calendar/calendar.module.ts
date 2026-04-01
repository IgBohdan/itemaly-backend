import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CategoriesModule } from 'src/categories/categories.module';
import { Category } from 'src/categories/category.entity';
import { UsersModule } from 'src/users/users.module';
import { Event, Recurrence, Reminder, Tag } from './entities';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';
import { CalendarNotificationsModule } from './notifications/notifications.module';
import { RecurrenceController } from './recurrence/recurrence.controller';
import { RecurrenceService } from './recurrence/recurrence.service';
import { RemindersController } from './reminders/reminders.controller';
import { RemindersService } from './reminders/reminders.service';
import { TagsController } from './tags/tags.controller';
import { TagsService } from './tags/tags.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Event,
      Tag,
      Category, // ← ДОДАЙ СЮДИ!
      Recurrence,
      Reminder,
    ]),
    UsersModule,
    CategoriesModule,
    CalendarNotificationsModule,
  ],
  providers: [EventsService, TagsService, RemindersService, RecurrenceService],
  controllers: [
    EventsController,
    TagsController,
    RemindersController,
    RecurrenceController,
  ],
})
export class CalendarModule {}
