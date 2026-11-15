import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261115003944 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "promo_banner" add column if not exists "type" text not null default 'promotion';`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "promo_banner" drop column if exists "type";`);
  }

}
