import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/user.entity';
import { Event } from './event.entity';

export enum ReminderUnit {
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
  DAYS = 'DAYS',
}

export enum ReminderMethod {
  EMAIL = 'EMAIL',
  POPUP = 'POPUP',
  SMS = 'SMS',
}

@Entity('calendar_reminder')
export class Reminder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  time: number; // e.g., 15 (minutes, hours, or days before event)

  @Column({ type: 'enum', enum: ReminderUnit })
  unit: ReminderUnit;

  @Column({ type: 'enum', enum: ReminderMethod })
  method: ReminderMethod;

  @ManyToOne(() => Event, (event) => event.reminders)
  event: Event;

  @ManyToOne(() => User)
  user: User;
}
