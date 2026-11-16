import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261115224154 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "promo_banner" add column if not exists "image_only" boolean not null default false;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "promo_banner" drop column if exists "image_only";`);
  }

}
