import { MigrationInterface, QueryRunner } from 'typeorm';

export class PopulateAggregates1740180133254 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure aggregates table exists
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS aggregates (
        id SERIAL PRIMARY KEY,
        owner VARCHAR NOT NULL,
        total_assets NUMERIC DEFAULT 0,
        total_shares NUMERIC DEFAULT 0,
        transaction_type VARCHAR NOT NULL,
        transaction_count INT DEFAULT 0,
        CONSTRAINT unique_owner_transaction_type UNIQUE (owner, transaction_type)
      );
    `);

    // Populate the aggregates table from deposits
    await queryRunner.query(`
      INSERT INTO aggregates (owner, total_assets, total_shares, transaction_type, transaction_count)
      SELECT owner, SUM(assets) AS total_assets, SUM(shares) AS total_shares, 'deposit' as transaction_type, COUNT(*) as transaction_count
      FROM deposits
      GROUP BY owner
      ON CONFLICT (owner, transaction_type) DO UPDATE
      SET total_assets = aggregates.total_assets + EXCLUDED.total_assets,
          total_shares = aggregates.total_shares + EXCLUDED.total_shares,
          transaction_count = aggregates.transaction_count + EXCLUDED.transaction_count;
    `);

    // Populate the aggregates table from withdrawals
    await queryRunner.query(`
      INSERT INTO aggregates (owner, total_assets, total_shares, transaction_type, transaction_count)
      SELECT owner, SUM(assets) AS total_assets, SUM(shares) AS total_shares, 'withdrawal' as transaction_type, COUNT(*) as transaction_count
      FROM withdrawals
      GROUP BY owner
      ON CONFLICT (owner, transaction_type) DO UPDATE
      SET total_assets = aggregates.total_assets + EXCLUDED.total_assets,
          total_shares = aggregates.total_shares + EXCLUDED.total_shares,
          transaction_count = aggregates.transaction_count + EXCLUDED.transaction_count;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove all records from aggregates (but keep the table structure)
    await queryRunner.query(`DELETE FROM aggregates;`);
  }
}