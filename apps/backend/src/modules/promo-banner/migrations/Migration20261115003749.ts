import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261115003749 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "promo_banner" ("id" text not null, "title" text not null, "subtitle" text null, "image_url" text not null, "mobile_image_url" text null, "alt_text" text not null, "link_url" text null, "cta_label" text null, "sort_order" integer not null default 0, "is_active" boolean not null default true, "starts_at" timestamptz null, "ends_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "promo_banner_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_promo_banner_deleted_at" ON "promo_banner" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "promo_banner" cascade;`);
  }

}
