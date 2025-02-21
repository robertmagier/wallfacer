import { MigrationInterface, QueryRunner } from 'typeorm';

export class PopulateAggregates1740180133254 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure aggregates table exists
    await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS aggregates (
                id SERIAL PRIMARY KEY,
                owner VARCHAR PRIMARY KEY,
                total_assets NUMERIC DEFAULT 0,
                total_shares NUMERIC DEFAULT 0,
                transaction_type VARCHAR,
                CONSTRAINT unique_owner_transaction_type UNIQUE (owner, transaction_type)
            );
        `);

    // Populate the aggregates table from deposits
    await queryRunner.query(`
            INSERT INTO aggregates (owner, total_assets, total_shares, transaction_type)
            SELECT owner, SUM(assets) AS total_assets, SUM(shares) AS total_shares,'deposit' as transaction_type
            FROM deposits
            GROUP BY owner
            ON CONFLICT (owner,transaction_type) DO UPDATE
            SET total_assets = aggregates.total_assets + EXCLUDED.total_assets,
                total_shares = aggregates.total_shares + EXCLUDED.total_shares;
        `);

    // Populate the aggregates table from withdrawals
    await queryRunner.query(`
            INSERT INTO aggregates (owner, total_assets, total_shares, transaction_type)
            SELECT owner, -SUM(assets) AS total_assets, -SUM(shares) AS total_shares, 'withdrawal' as transaction_type
            FROM withdrawals
            GROUP BY owner
            ON CONFLICT (owner, transaction_type) DO UPDATE
            SET total_assets = aggregates.total_assets + EXCLUDED.total_assets,
                total_shares = aggregates.total_shares + EXCLUDED.total_shares;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove all records from aggregates (but keep the table structure)
    await queryRunner.query(`DELETE FROM aggregates;`);
  }
}
