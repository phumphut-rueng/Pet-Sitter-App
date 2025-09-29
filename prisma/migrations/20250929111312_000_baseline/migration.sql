-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."pet_type" (
    "id" SERIAL NOT NULL,
    "pet_type_name" VARCHAR(100) NOT NULL,

    CONSTRAINT "pet_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role" (
    "id" SERIAL NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sitter" (
    "id" SERIAL NOT NULL,
    "user_sitter_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "location_description" VARCHAR(255),
    "phone" VARCHAR(20),
    "introduction" TEXT,
    "address_detail" TEXT,
    "address_province" VARCHAR(100),
    "address_district" VARCHAR(100),
    "address_sub_district" VARCHAR(100),
    "address_post_code" VARCHAR(10),
    "base_price" DECIMAL(10,2),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),
    "experience" INTEGER,
    "service_description" VARCHAR(1000),

    CONSTRAINT "sitter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sitter_image" (
    "id" SERIAL NOT NULL,
    "sitter_id" INTEGER NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,

    CONSTRAINT "sitter_image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "profile_image" VARCHAR(255),
    "dob" DATE,
    "bank_name" VARCHAR(100),
    "bank_number" VARCHAR(50),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_role" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "role_id" INTEGER NOT NULL,

    CONSTRAINT "user_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sitter_pet_type" (
    "sitter_id" INTEGER NOT NULL,
    "pet_type_id" INTEGER NOT NULL,

    CONSTRAINT "sitter_pet_type_pkey" PRIMARY KEY ("sitter_id","pet_type_id")
);

-- CreateTable
CREATE TABLE "public"."review" (
    "id" SERIAL NOT NULL,
    "sitter_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pet" (
    "id" SERIAL NOT NULL,
    "owner_id" INTEGER NOT NULL,
    "pet_type_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "breed" VARCHAR(100) NOT NULL,
    "sex" VARCHAR(10) NOT NULL,
    "age_month" INTEGER NOT NULL,
    "color" VARCHAR(100) NOT NULL,
    "weight_kg" DECIMAL(6,2) NOT NULL,
    "about" VARCHAR(1000),
    "image_url" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6),

    CONSTRAINT "pet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pet_type_pet_type_name_key" ON "public"."pet_type"("pet_type_name");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE INDEX "idx_pet_name" ON "public"."pet"("name");

-- CreateIndex
CREATE INDEX "idx_pet_owner_id" ON "public"."pet"("owner_id");

-- CreateIndex
CREATE INDEX "idx_pet_pet_type_id" ON "public"."pet"("pet_type_id");

-- AddForeignKey
ALTER TABLE "public"."sitter" ADD CONSTRAINT "sitter_user_sitter_id_fkey" FOREIGN KEY ("user_sitter_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sitter_image" ADD CONSTRAINT "sitter_image_sitter_id_fkey" FOREIGN KEY ("sitter_id") REFERENCES "public"."sitter"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_role" ADD CONSTRAINT "user_role_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_role" ADD CONSTRAINT "user_role_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."sitter_pet_type" ADD CONSTRAINT "sitter_pet_type_pet_type_id_fkey" FOREIGN KEY ("pet_type_id") REFERENCES "public"."pet_type"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sitter_pet_type" ADD CONSTRAINT "sitter_pet_type_sitter_id_fkey" FOREIGN KEY ("sitter_id") REFERENCES "public"."sitter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review" ADD CONSTRAINT "review_sitter_id_fkey" FOREIGN KEY ("sitter_id") REFERENCES "public"."sitter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."review" ADD CONSTRAINT "review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pet" ADD CONSTRAINT "pet_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."pet" ADD CONSTRAINT "pet_pet_type_id_fkey" FOREIGN KEY ("pet_type_id") REFERENCES "public"."pet_type"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

