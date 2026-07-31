-- Prisma's schema DSL has no native CREATE SEQUENCE support, so this runs as a
-- manual follow-up after the initial `prisma migrate dev` (which creates the
-- tables from schema.prisma). Apply this once against the same database:
--
--   psql "$DIRECT_URL" -f prisma/sql/001_staff_number_sequence.sql
--
-- or paste it into the Supabase SQL editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- gen_random_uuid(), used by rate_limit inserts

CREATE SEQUENCE IF NOT EXISTS staff_number_seq
  START WITH 1
  INCREMENT BY 1
  NO CYCLE;

-- Uniqueness on rate_limit.key is declared in schema.prisma (@@unique via @id +
-- @unique on `key`) — no extra DDL needed here beyond the sequence + extension.
