-- Migration: Admin UX Improvements (P2)
-- Description: Adds status tracking to Contacts and Bookings for better admin workflow.

-- 1. Contacts Status
-- Enum for contact lifecycle
do $$ begin
    create type public.contact_status as enum ('new', 'read', 'processed', 'spam');
exception
    when duplicate_object then null;
end $$;

alter table public.contacts
add column if not exists status public.contact_status default 'new';

-- 2. Bookings Status
-- Enum for booking lifecycle
do $$ begin
    create type public.booking_status as enum ('active', 'cancelled', 'completed', 'no_show');
exception
    when duplicate_object then null;
end $$;

alter table public.bookings
add column if not exists status public.booking_status default 'active';

-- Add indexes for filtering by status
create index if not exists idx_contacts_status on public.contacts(status);
create index if not exists idx_bookings_status on public.bookings(status);
