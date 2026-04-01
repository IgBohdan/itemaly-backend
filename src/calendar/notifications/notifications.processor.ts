import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';

export interface ReminderJobData {
  reminderId: number;
  userId: number;
  eventId: number;
  method: string;
  time: number;
  unit: string;
}

@Injectable()
@Processor('reminder-queue')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  async process(job: Job<ReminderJobData, any, string>): Promise<any> {
    this.logger.log(
      `Processing reminder job ${job.id} for user ${job.data.userId} event ${job.data.eventId} with method ${job.data.method}`,
    );
    // Here you would implement the actual notification logic
    // e.g., send email, push notification, SMS based on job.data.method
    console.log(
      `Sending ${job.data.method} reminder for event ${job.data.eventId} to user ${job.data.userId}`,
    );
  }
}
