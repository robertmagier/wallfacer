import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Unique } from 'typeorm';

@Entity('aggregates')
@Unique(['owner', 'transaction_type'])
export class Aggregates {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 42 })
  owner: string;

  @Column({ type: 'numeric', precision: 78, scale: 0 })
  total_assets: string;

  @Column({ type: 'numeric', precision: 78, scale: 0 })
  total_shares: string;

  @Column({ type: 'varchar' })
  transaction_type: 'deposit' | 'withdrawal';
}
