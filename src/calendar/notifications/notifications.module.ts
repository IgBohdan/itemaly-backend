import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { NotificationProcessor } from './notifications.processor';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reminder-queue',
    }),
  ],
  providers: [NotificationProcessor, NotificationsService],
  exports: [NotificationsService],
})
export class CalendarNotificationsModule {}
