import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from './event.entity';

export enum RecurrenceFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

@Entity('calendar_recurrence')
export class Recurrence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: RecurrenceFrequency })
  frequency: RecurrenceFrequency;

  @Column({ default: 1 })
  interval: number;

  @Column('simple-array', { nullable: true })
  daysOfWeek?: number[]; // 0-6 for Sunday-Saturday

  @Column({ nullable: true })
  dayOfMonth?: number;

  @Column({ nullable: true })
  monthOfYear?: number;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate?: Date;

  @OneToOne(() => Event, (event) => event.recurrence)
  event: Event;
}
