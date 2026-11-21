import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261118050507 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "support_ticket" ("id" text not null, "name" text not null, "whatsapp" text not null, "question" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "support_ticket_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_support_ticket_deleted_at" ON "support_ticket" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "support_ticket" cascade;`);
  }

}
