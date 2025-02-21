import { DataSource } from 'typeorm';
import { DepositEvent } from './transactions/entities/depositEvent.entity'; // Adjust paths to your entities
import { Aggregates } from './transactions/entities/aggregates.entity'; // Adjust paths to your entities
import { WithdrawEvent } from './transactions/entities/withdrawEvent.entity'; // Adjust paths to your entities
// load .env file
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [DepositEvent, WithdrawEvent, Aggregates],
  synchronize: true,
  logging: true,
  migrations: [__dirname + '/migrations/*.ts'],
});
