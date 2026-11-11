import { pgSchema, pgTable, text, uuid, jsonb, date, integer, boolean, timestamp } from "drizzle-orm/pg-core"
import type { ContentKind, ContentStatus, RichTextDocument } from "@/lib/content/types"

const neonAuthSchema = pgSchema("neon_auth")

export const neonAuthUser = neonAuthSchema.table("user", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
})

export const portfolioEntries = pgTable("portfolio_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull(),
  kind: text("kind").$type<ContentKind>().notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: jsonb("body").$type<RichTextDocument>().notNull(),
  coverUrl: text("coverUrl"),
  coverAlt: text("coverAlt").notNull().default(""),
  videoUrl: text("videoUrl"),
  location: text("location"),
  occurredAt: date("occurredAt", { mode: "string" }),
  sortOrder: integer("sortOrder").notNull().default(0),
  status: text("status").$type<ContentStatus>().notNull().default("draft"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
  publishedAt: timestamp("publishedAt", { withTimezone: true }),
})

export const portfolioTasks = pgTable("portfolio_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sortOrder").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).notNull().defaultNow(),
})

export const portfolioMedia = pgTable("portfolio_media", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("userId").notNull(),
  pathname: text("pathname").notNull(),
  url: text("url").notNull(),
  filename: text("filename").notNull(),
  contentType: text("contentType").notNull(),
  byteSize: integer("byteSize").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).notNull().defaultNow(),
})
