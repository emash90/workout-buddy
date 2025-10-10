import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('sleep_data')
@Index(['userId', 'dateOfSleep'], { unique: true })
export class SleepData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'date' })
  dateOfSleep: Date;

  @Column({ type: 'bigint' })
  duration: number;

  @Column({ type: 'int', nullable: true })
  efficiency: number;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ type: 'int' })
  minutesAsleep: number;

  @Column({ type: 'int' })
  minutesAwake: number;

  @Column({ type: 'int' })
  minutesToFallAsleep: number;

  @Column({ type: 'int' })
  minutesAfterWakeup: number;

  @Column({ type: 'int' })
  timeInBed: number;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'int', nullable: true })
  deepSleepMinutes: number;

  @Column({ type: 'int', nullable: true })
  lightSleepMinutes: number;

  @Column({ type: 'int', nullable: true })
  remSleepMinutes: number;

  @Column({ type: 'int', nullable: true })
  wakeSleepMinutes: number;

  @Column({ type: 'jsonb', nullable: true })
  sleepStages: {
    deep: number;
    light: number;
    rem: number;
    wake: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  levels: {
    summary: any;
    data: {
      dateTime: string;
      level: string;
      seconds: number;
    }[];
  };

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
