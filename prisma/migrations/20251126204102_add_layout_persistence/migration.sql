-- CreateTable
CREATE TABLE "Layout" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "tabs" JSONB NOT NULL DEFAULT '[]',
    "widgets" JSONB NOT NULL DEFAULT '[]',
    "positions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Layout_pkey" PRIMARY KEY ("id")
);
