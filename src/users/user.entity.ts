import { ActivityLog } from 'src/activity-log/activity-log.entity';
import { Event as CalendarEvent } from 'src/calendar/entities/event.entity';
import { Reminder } from 'src/calendar/entities/reminder.entity';
import { Tag } from 'src/calendar/entities/tag.entity';
import { Category } from 'src/categories/category.entity';
import { Event } from 'src/events/event.entity';
import { Notification } from 'src/notifications/notification.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import {
  ReminderMethod,
  ReminderUnit,
} from '../calendar/entities/reminder.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  defaultReminderTime?: number;

  @Column({ type: 'enum', enum: ReminderUnit, nullable: true })
  defaultReminderUnit?: ReminderUnit;

  @Column({ type: 'enum', enum: ReminderMethod, nullable: true })
  defaultReminderMethod?: ReminderMethod;

  // зв'язки з іншими сутностями
  @OneToMany(() => Event, (event) => event.user)
  events: Event[];

  // Calendar events
  @OneToMany(() => CalendarEvent, (event) => event.user)
  calendarEvents: CalendarEvent[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  // 🔹 Notifications
  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Reminder, (reminder) => reminder.user)
  reminders: Reminder[];

  @OneToMany(() => Tag, (tag) => tag.user)
  tags: Tag[];

  // 🔹 Activity Logs
  @OneToMany(() => ActivityLog, (activity) => activity.user)
  activities: ActivityLog[];
}
