-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'moderate', 'hard', 'expert');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "regions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameDe" TEXT,
    "description" TEXT,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mountains" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameDe" TEXT,
    "altitude" INTEGER NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "regionId" TEXT NOT NULL,
    "difficulty" "Difficulty",
    "description" TEXT,
    "imageUrl" TEXT,
    "externalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mountains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hikes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mountainId" TEXT NOT NULL,
    "hikedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hikes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "mountains_externalId_key" ON "mountains"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "hikes_userId_mountainId_key" ON "hikes"("userId", "mountainId");

-- AddForeignKey
ALTER TABLE "mountains" ADD CONSTRAINT "mountains_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hikes" ADD CONSTRAINT "hikes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hikes" ADD CONSTRAINT "hikes_mountainId_fkey" FOREIGN KEY ("mountainId") REFERENCES "mountains"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
