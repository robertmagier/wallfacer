import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Unique, Index } from 'typeorm';

@Entity('deposits')
@Unique(['block', 'index'])
export class DepositEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 42 })
  sender: string;

  @Column({ type: 'varchar', length: 42 })
  @Index()
  owner: string;

  @Column({ type: 'numeric', precision: 78, scale: 0 })
  assets: string;

  @Column({ type: 'numeric', precision: 78, scale: 0 })
  shares: string;

  @Column({ type: 'varchar' })
  block: string;

  @Column({ type: 'int' })
  index: number;

  @CreateDateColumn()
  timestamp: Date;
}
