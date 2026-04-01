import { Injectable, Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import * as nodemailer from 'nodemailer';
import { EventsService } from 'src/events/events.service';
import Twilio from 'twilio';

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  private transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  private twilioClient = Twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_AUTH_TOKEN,
  );

  constructor(private eventsService: EventsService) {
    // cron job: перевіряти кожну хвилину події з нагадуванням
    cron.schedule('* * * * *', async () => {
      await this.checkReminders();
    });
  }

  async sendEmail(to: string, subject: string, text: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_USER,
        to,
        subject,
        text,
      });
      this.logger.log(`Email sent to ${to}`);
    } catch (err) {
      this.logger.error(`Email send failed: ${err}`);
    }
  }

  async sendSMS(to: string, body: string) {
    try {
      await this.twilioClient.messages.create({
        body,
        from: process.env.TWILIO_PHONE,
        to,
      });
      this.logger.log(`SMS sent to ${to}`);
    } catch (err) {
      this.logger.error(`SMS send failed: ${err}`);
    }
  }

  private async checkReminders() {
    const now = new Date();
    const events = await this.eventsService.findAllRemindable(now);
    for (const event of events) {
      const msg = `Reminder: ${event.title} at ${event.startTime.toLocaleString()}`;
      if (event.user.email)
        await this.sendEmail(event.user.email, 'Event Reminder', msg);
      if ((event.user as any).phone)
        await this.sendSMS((event.user as any).phone, msg);
    }
  }
}
