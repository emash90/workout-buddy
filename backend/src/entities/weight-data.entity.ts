import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

@Entity('weight_data')
@Index(['userId', 'date'], { unique: true })
export class WeightData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  weight: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  bmi: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fat: number;

  @Column({ type: 'varchar', length: 10, default: 'kg' })
  unit: string;

  @Column({ type: 'timestamp', nullable: true })
  loggedAt: Date;

  @Column({ type: 'varchar', length: 50, default: 'manual' })
  source: string;

  @Column({ type: 'jsonb', nullable: true })
  rawData: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
