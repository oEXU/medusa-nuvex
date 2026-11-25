import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261122224738 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "blackcat_webhook_event" add column if not exists "payload" jsonb null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "blackcat_webhook_event" drop column if exists "payload";`);
  }

}
