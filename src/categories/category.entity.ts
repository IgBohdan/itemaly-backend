import { Event } from 'src/events/event.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  color: string;

  // Зв'язок "одна категорія — багато подій"
  @OneToMany(() => Event, (event) => event.category)
  events: Event[];

  // Зв'язок "багато категорій — один користувач"
  @ManyToOne(() => User, (user) => user.categories, { onDelete: 'CASCADE' })
  user: User;
}
