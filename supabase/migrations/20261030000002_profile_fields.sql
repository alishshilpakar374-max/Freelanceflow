alter table public.profiles
  add column if not exists phone text not null default '' check (char_length(phone) <= 40),
  add column if not exists business_name text not null default '' check (char_length(business_name) <= 120),
  add column if not exists website text not null default '' check (char_length(website) <= 200),
  add column if not exists location text not null default '' check (char_length(location) <= 120);