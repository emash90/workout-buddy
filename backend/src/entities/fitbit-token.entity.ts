import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('fitbit_tokens')
export class FitbitToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column()
  fitbitUserId: string;

  @Column({ type: 'int' })
  expiresIn: number;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: 'bearer' })
  tokenType: string;

  @Column({ nullable: true })
  scope: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}