-- 1. Enable PostGIS for location features ("The Algorithm")
create extension if not exists postgis;

-- 2. Create the alerts table
create table public.alerts (
  id uuid default gen_random_uuid() primary key,
  type text not null,
  location geography(point) not null, -- Stores lat/lng efficiently
  timestamp bigint not null,
  description text,
  upvotes int default 0,
  downvotes int default 0,
  evidence text, -- URL or base64
  resolved boolean default false,
  location_name text -- Reverse-geocoded location name
);

-- MIGRATION NOTE: If table already exists, run this to add the location_name column:
-- ALTER TABLE public.alerts ADD COLUMN IF NOT EXISTS location_name text;

-- 3. Enable Security (Row Level Security)
alter table public.alerts enable row level security;

-- 4. Create Policies (The "No Auth" / Public Access Rules)

-- Allow ANYONE to read alerts
create policy "Public read access"
on public.alerts for select
to anon
using (true);

-- Allow ANYONE to create alerts
create policy "Public insert access"
on public.alerts for insert
to anon
with check (true);

-- Allow ANYONE to update (needed for voting)
-- Note: In a real production app, you'd want stricter controls here,
-- but for this MVP, this allows the voting functions to work.
create policy "Public update access"
on public.alerts for update
to anon
using (true);

-- 5. "The Algorithm": Function to find alerts near a user
-- This runs on the database, so it's very fast.
create or replace function get_nearby_alerts(
  lat float,
  lng float,
  radius_meters float default 5000 -- Default 5km
)
returns setof public.alerts
language sql
as $$
  select *
  from public.alerts
  where st_dwithin(
    location,
    st_point(lng, lat)::geography,
    radius_meters
  )
  order by timestamp desc; -- Newest first
$$;

-- 6. Voting Function (Atomic Updates)
-- Prevents race conditions when multiple people vote at once
create or replace function vote_alert(
  row_id uuid,
  vote_type text -- 'up' or 'down'
)
returns void
language plpgsql
as $$
begin
  if vote_type = 'up' then
    update public.alerts
    set upvotes = upvotes + 1
    where id = row_id;
  elsif vote_type = 'down' then
    update public.alerts
    set downvotes = downvotes + 1
    where id = row_id;
  end if;
end;
$$;
