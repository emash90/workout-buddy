import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('activity_data')
@Index(['userId', 'date'], { unique: true })
export class ActivityData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int', default: 0 })
  steps: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  distance: number;

  @Column({ type: 'int', default: 0 })
  floors: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  elevation: number;

  @Column({ type: 'int', default: 0 })
  calories: number;

  @Column({ type: 'int', default: 0 })
  activeMinutes: number;

  @Column({ type: 'int', default: 0 })
  sedentaryMinutes: number;

  @Column({ type: 'int', default: 0 })
  lightlyActiveMinutes: number;

  @Column({ type: 'int', default: 0 })
  fairlyActiveMinutes: number;

  @Column({ type: 'int', default: 0 })
  veryActiveMinutes: number;

  @Column({ type: 'jsonb', nullable: true })
  distances: {
    activity: string;
    distance: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  rawData: any;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'fitbit'
  })
  dataSource: 'fitbit' | 'whoop';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
