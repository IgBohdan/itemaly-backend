import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Event } from './event.entity';

@Entity('calendar_tag')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  color?: string;

  @ManyToOne(() => User)
  user: User;

  @ManyToMany(() => Event, (event) => event.tags)
  events: Event[];
}
