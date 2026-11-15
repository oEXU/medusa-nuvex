import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261115015703 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "featured_product" ("id" text not null, "category_key" text not null, "product_id" text not null, "sort_order" integer not null default 0, "is_active" boolean not null default true, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "featured_product_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_featured_product_deleted_at" ON "featured_product" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "featured_product" cascade;`);
  }

}
