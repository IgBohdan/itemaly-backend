import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { ReminderJobData } from './notifications.processor';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('reminder-queue') private readonly reminderQueue: Queue,
  ) {}

  async addReminderJob(
    reminderId: number,
    userId: number,
    eventId: number,
    method: string,
    time: number,
    unit: string,
    processAt: Date,
  ) {
    const jobData: ReminderJobData = {
      reminderId,
      userId,
      eventId,
      method,
      time,
      unit,
    };
    await this.reminderQueue.add(
      `reminder-${reminderId}-${Date.now()}`,
      jobData,
      {
        delay: processAt.getTime() - Date.now(), // Delay in milliseconds
      },
    );
  }
}
