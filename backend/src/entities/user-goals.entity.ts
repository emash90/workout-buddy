import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum FitnessGoal {
  LOSE_WEIGHT = 'lose_weight',
  GAIN_MUSCLE = 'gain_muscle',
  MAINTAIN_WEIGHT = 'maintain_weight',
  IMPROVE_ENDURANCE = 'improve_endurance',
  GENERAL_FITNESS = 'general_fitness',
}

export enum ActivityLevel {
  SEDENTARY = 'sedentary',
  LIGHTLY_ACTIVE = 'lightly_active',
  MODERATELY_ACTIVE = 'moderately_active',
  VERY_ACTIVE = 'very_active',
  EXTRA_ACTIVE = 'extra_active',
}

@Entity('user_goals')
export class UserGoals {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'uuid', unique: true })
  userId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // Fitness Goal Information
  @Column({
    type: 'enum',
    enum: FitnessGoal,
    default: FitnessGoal.GENERAL_FITNESS,
  })
  fitnessGoal: FitnessGoal;

  // Physical Measurements
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  currentWeight: number; // in kg

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  targetWeight: number; // in kg

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  height: number; // in cm

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  currentBMI: number;

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  idealBMI: number;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender: string; // male, female, other

  @Column({
    type: 'enum',
    enum: ActivityLevel,
    default: ActivityLevel.MODERATELY_ACTIVE,
  })
  activityLevel: ActivityLevel;

  // Daily Goals
  @Column({ type: 'int', default: 10000 })
  dailyStepsGoal: number;

  @Column({ type: 'int', default: 2000 })
  dailyCaloriesBurnGoal: number;

  @Column({ type: 'int', default: 30 })
  dailyActiveMinutesGoal: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 8.0 })
  dailySleepHoursGoal: number;

  // Weekly Goals
  @Column({ type: 'int', default: 5 })
  weeklyWorkoutsGoal: number;

  // AI Recommendations
  @Column({ type: 'boolean', default: false })
  aiRecommendationsEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  aiRecommendations: {
    dailySteps?: number;
    dailyCaloriesBurn?: number;
    dailyActiveMinutes?: number;
    dailySleepHours?: number;
    weeklyWorkouts?: number;
    generatedAt?: Date;
    reasoning?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
