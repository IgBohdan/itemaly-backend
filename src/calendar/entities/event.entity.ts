import { Category } from 'src/categories/category.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Recurrence } from './recurrence.entity';
import { Reminder } from './reminder.entity';
import { Tag } from './tag.entity';

@Entity('calendar_event')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'timestamp' })
  startDateTime: Date;

  @Column({ type: 'timestamp' })
  endDateTime: Date;

  @Column({ default: false })
  isAllDay: boolean;

  @Column({ nullable: true })
  location?: string;

  @ManyToOne(() => User, (user) => user.events)
  user: User;

  @ManyToMany(() => Tag, (tag) => tag.events)
  @JoinTable()
  tags: Tag[];

  @OneToOne(() => Recurrence, (recurrence) => recurrence.event, {
    cascade: false, // Disable cascade to avoid update issues when saving recurrence separately
  })
  @JoinColumn()
  recurrence?: Recurrence;

  @OneToMany(() => Reminder, (reminder) => reminder.event, { cascade: false }) // Disable cascade to avoid update issues when saving reminders separately
  reminders?: Reminder[];

  @ManyToOne(() => Category, (category) => category.events, { nullable: true })
  category?: Category;
}
