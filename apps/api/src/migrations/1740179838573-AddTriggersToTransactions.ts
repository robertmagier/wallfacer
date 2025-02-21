import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTriggersToTransactions1740179838573 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE OR REPLACE FUNCTION update_aggregates_on_deposit() RETURNS TRIGGER AS $$
          BEGIN
            INSERT INTO aggregates (owner, totalAssets, totalShares, type)
            VALUES (NEW.owner, NEW.assets, NEW.shares, 'deposit')
            ON CONFLICT (owner, type) 
            DO UPDATE SET 
              total_assets = aggregates.total_assets + EXCLUDED.total_assets,
              total_shares = aggregates.total_shares + EXCLUDED.total_shares;
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
    
          CREATE TRIGGER trigger_update_aggregates_on_deposit
          AFTER INSERT ON deposits
          FOR EACH ROW
          EXECUTE FUNCTION update_aggregates_on_deposit();
    
          CREATE OR REPLACE FUNCTION update_aggregates_on_withdrawal() RETURNS TRIGGER AS $$
          BEGIN
            INSERT INTO aggregates (owner, totalAssets, totalShares, type)
            VALUES (NEW.owner, NEW.assets, NEW.shares, 'withdraw')
            ON CONFLICT (owner, type) 
            DO UPDATE SET 
              total_assets = aggregates.total_assets + EXCLUDED.total_assets,
              total_shares = aggregates.total_shares + EXCLUDED.total_shares;
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
    
          CREATE TRIGGER trigger_update_aggregates_on_withdrawal
          AFTER INSERT ON withdrawals
          FOR EACH ROW
          EXECUTE FUNCTION update_aggregates_on_withdrawal();
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          DROP TRIGGER IF EXISTS trigger_update_aggregates_on_deposit ON deposits;
          DROP FUNCTION IF EXISTS update_aggregates_on_deposit;
    
          DROP TRIGGER IF EXISTS trigger_update_aggregates_on_withdrawal ON withdrawals;
          DROP FUNCTION IF EXISTS update_aggregates_on_withdrawal;
        `);
  }
}
