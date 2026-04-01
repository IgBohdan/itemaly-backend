import { Tag } from 'src/calendar/entities';
import { Category } from 'src/categories/category.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp', { nullable: true })
  endTime: Date;

  @Column({ default: false })
  isAllDay: boolean;

  @Column({ nullable: true })
  location: string;

  // Зв'язок "багато подій — один користувач"
  @ManyToOne(() => User, (user) => user.events, {
    onDelete: 'CASCADE',
    nullable: false, // користувач обов'язковий
  })
  user: User;

  @ManyToOne(() => Category, (category) => category.events, { nullable: true })
  category: Category | null;

  @ManyToMany(() => Tag, (tag) => tag.events)
  @JoinTable() // створює таблицю event_tags (eventId, tagId)
  tags: Tag[];

  @CreateDateColumn()
  createdAt: Date;
}
