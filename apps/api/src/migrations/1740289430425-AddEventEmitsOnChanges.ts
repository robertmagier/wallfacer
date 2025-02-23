import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEventEmitsOnChanges1740289430425 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE OR REPLACE FUNCTION notify_deposit_changes() RETURNS TRIGGER AS $$
        BEGIN
            PERFORM pg_notify('deposit_changes', row_to_json(NEW)::text);
            RETURN NEW;
        END;
      $$ LANGUAGE plpgsql;

    CREATE TRIGGER deposit_trigger
    AFTER INSERT OR UPDATE ON deposits
    FOR EACH ROW EXECUTE FUNCTION notify_deposit_changes();
`);

    await queryRunner.query(`CREATE OR REPLACE FUNCTION notify_withdrawal_changes() RETURNS TRIGGER AS $$
        BEGIN
            PERFORM pg_notify('withdrawal_changes', row_to_json(NEW)::text);
            RETURN NEW;
        END;
      $$ LANGUAGE plpgsql;

    CREATE TRIGGER withdrawal_trigger
    AFTER INSERT OR UPDATE ON withdrawals
    FOR EACH ROW EXECUTE FUNCTION notify_withdrawal_changes();
`);

    await queryRunner.query(`CREATE OR REPLACE FUNCTION notify_aggregate_changes() RETURNS TRIGGER AS $$
        BEGIN
            PERFORM pg_notify('aggregate_changes', row_to_json(NEW)::text);
            RETURN NEW;
        END;
      $$ LANGUAGE plpgsql;

    CREATE TRIGGER aggregate_trigger
    AFTER INSERT OR UPDATE ON aggregates
    FOR EACH ROW EXECUTE FUNCTION notify_aggregate_changes();
`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TRIGGER IF EXISTS deposit_trigger ON deposits;
     DROP FUNCTION IF EXISTS notify_deposit_changes;
`);

    await queryRunner.query(`DROP TRIGGER IF EXISTS withdrawal_trigger ON withdrawals;
     DROP FUNCTION IF EXISTS notify_withdrawal_changes;
`);

    await queryRunner.query(`DROP TRIGGER IF EXISTS aggregate_trigger ON aggregates;
     DROP FUNCTION IF EXISTS notify_aggregate_changes;
`);
  }
}
