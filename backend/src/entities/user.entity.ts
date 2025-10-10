import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column({
    name: 'connected_provider',
    type: 'varchar',
    length: 10,
    nullable: true
  })
  connectedProvider: 'fitbit' | 'whoop' | null;

  @Column({
    name: 'provider_connected_at',
    type: 'timestamp',
    nullable: true
  })
  providerConnectedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}