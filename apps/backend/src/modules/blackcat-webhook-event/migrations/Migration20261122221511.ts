import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261122221511 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "blackcat_webhook_event" drop constraint if exists "blackcat_webhook_event_idempotency_key_unique";`);
    this.addSql(`create table if not exists "blackcat_webhook_event" ("id" text not null, "idempotency_key" text not null, "event_type" text not null, "entity_id" text null, "body_hash" text not null, "status" text check ("status" in ('processing', 'processed', 'ignored', 'failed')) not null, "outcome" text null, "error" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "blackcat_webhook_event_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_blackcat_webhook_event_idempotency_key_unique" ON "blackcat_webhook_event" ("idempotency_key") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blackcat_webhook_event_deleted_at" ON "blackcat_webhook_event" ("deleted_at") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_blackcat_webhook_event_event_type" ON "blackcat_webhook_event" ("event_type") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "blackcat_webhook_event" cascade;`);
  }

}
