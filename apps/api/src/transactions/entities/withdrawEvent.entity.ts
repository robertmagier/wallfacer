import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Unique } from 'typeorm';

@Entity('withdrawals')
@Unique(['block', 'index'])
export class WithdrawEvent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 42 })
  sender: string;

  @Column({ type: 'varchar', length: 42 })
  owner: string;

  @Column({ type: 'varchar', length: 42 })
  receiver: string;

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
