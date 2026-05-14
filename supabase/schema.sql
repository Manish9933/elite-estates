-- Enable PostGIS for location data
create extension if not exists postgis;

-- Create Roles Enum
create type user_role as enum ('buyer', 'agent', 'admin');
create type property_status as enum ('available', 'sold', 'pending', 'under_review');

-- Profiles Table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  role user_role default 'buyer',
  bio text,
  phone text,
  constraint username_length check (char_length(username) >= 3)
);

-- Properties Table
create table properties (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  price numeric not null,
  address text not null,
  city text,
  state text,
  zip_code text,
  location geography(POINT),
  property_type text, -- 'Apartment', 'Villa', 'Penthouse', etc.
  bhk integer,
  bathrooms integer,
  area_sqft numeric,
  amenities text[],
  images text[],
  virtual_tour_url text,
  agent_id uuid references profiles(id) on delete cascade not null,
  status property_status default 'under_review',
  is_featured boolean default false
);

-- Bookings / Tours Table
create table bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  property_id uuid references properties(id) on delete cascade not null,
  buyer_id uuid references profiles(id) on delete cascade not null,
  agent_id uuid references profiles(id) on delete cascade not null,
  booking_date timestamp with time zone not null,
  status text default 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  notes text
);

-- Messages Table for Real-time Chat
create table messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  property_id uuid references properties(id) on delete set null,
  content text not null,
  is_read boolean default false
);

-- Favorites Table
create table favorites (
  user_id uuid references profiles(id) on delete cascade not null,
  property_id uuid references properties(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, property_id)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table properties enable row level security;
alter table bookings enable row level security;
alter table messages enable row level security;
alter table favorites enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Properties Policies
create policy "Properties are viewable by everyone." on properties for select using (status = 'available' or auth.uid() = agent_id);
create policy "Agents can insert properties." on properties for insert with check (
  exists (select 1 from profiles where id = auth.uid() and role = 'agent')
);
create policy "Agents can update own properties." on properties for update using (auth.uid() = agent_id);

-- Messages Policies
create policy "Users can view their own messages." on messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
create policy "Users can send messages." on messages for insert with check (auth.uid() = sender_id);

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Triggers
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
