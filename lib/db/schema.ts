import { pgTable, serial, text, integer, boolean, json } from 'drizzle-orm/pg-core';

export const identity = pgTable('identity', {
  id:        integer('id').primaryKey(),
  name:      text('name').notNull(),
  handle:    text('handle').notNull(),
  role:      text('role').notNull(),
  loc:       text('loc').notNull(),
  open:      text('open').notNull(),
  email:     text('email').notNull(),
  github:    text('github').notNull(),
  linkedin:  text('linkedin').notNull(),
  readcv:    text('readcv').notNull(),
  pgp:       text('pgp').notNull(),
  resumeUrl: text('resume_url'),
  bio:       text('bio').notNull().default(''),
});

export const projects = pgTable('projects', {
  slug:      text('slug').primaryKey(),
  title:     text('title').notNull(),
  year:      integer('year').notNull(),
  kind:      text('kind').notNull(),
  stack:     json('stack').$type<string[]>().notNull().default([]),
  stars:     integer('stars').notNull().default(0),
  tagline:   text('tagline').notNull(),
  desc:      text('desc').notNull().default(''),
  body:      text('body').notNull().default(''),
  published: boolean('published').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const experience = pgTable('experience', {
  id:        serial('id').primaryKey(),
  whenLabel: text('when_label').notNull(),
  role:      text('role').notNull(),
  co:        text('co').notNull(),
  loc:       text('loc').notNull(),
  bullets:   json('bullets').$type<string[]>().notNull().default([]),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const skills = pgTable('skills', {
  id:        serial('id').primaryKey(),
  proc:      text('proc').notNull(),
  cpu:       integer('cpu').notNull(),
  cmd:       text('cmd').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const nowItems = pgTable('now_items', {
  id:        serial('id').primaryKey(),
  tag:       text('tag').notNull(),
  text:      text('text').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const adminUsers = pgTable('admin_users', {
  id:           serial('id').primaryKey(),
  email:        text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
});
