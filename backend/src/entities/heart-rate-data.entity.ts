import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('heart_rate_data')
@Index(['userId', 'date'], { unique: true })
export class HeartRateData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'int', nullable: true })
  restingHeartRate: number;

  @Column({ type: 'jsonb', nullable: true })
  heartRateZones: {
    name: string;
    min: number;
    max: number;
    minutes: number;
    caloriesOut: number;
  }[];

  @Column({ type: 'int', nullable: true })
  outOfRangeMinutes: number;

  @Column({ type: 'int', nullable: true })
  fatBurnMinutes: number;

  @Column({ type: 'int', nullable: true })
  cardioMinutes: number;

  @Column({ type: 'int', nullable: true })
  peakMinutes: number;

  @Column({ type: 'jsonb', nullable: true })
  intradayData: {
    time: string;
    value: number;
  }[];

  @Column({ type: 'jsonb', nullable: true })
  rawData: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
