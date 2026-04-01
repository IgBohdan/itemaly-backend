import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class ActivityLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.activities, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  action: string; // наприклад "created_event", "deleted_category", "login"

  @Column({ nullable: true, type: 'json' })
  metadata: any; // можна зберігати JSON із деталями

  @CreateDateColumn()
  createdAt: Date;
}
