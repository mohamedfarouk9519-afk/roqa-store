create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  image_url text,
  created_at timestamp with time zone default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(10,2) not null default 0,
  image_url text not null,
  category_id uuid references categories(id) on delete cascade,
  created_at timestamp with time zone default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text,
  backup_phone text,
  address text,
  total numeric(10,2) not null default 0,
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

drop policy if exists "public read categories" on categories;
drop policy if exists "public read products" on products;
drop policy if exists "public read orders" on orders;
drop policy if exists "public write categories" on categories;
drop policy if exists "public write products" on products;
drop policy if exists "public write orders" on orders;

create policy "public read categories" on categories for select using (true);
create policy "public read products" on products for select using (true);
create policy "public read orders" on orders for select using (true);

create policy "public write categories" on categories for all using (true) with check (true);
create policy "public write products" on products for all using (true) with check (true);
create policy "public write orders" on orders for all using (true) with check (true);

insert into categories (name, image_url)
values
('مرايات خطوبة', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200'),
('الورد', 'https://images.unsplash.com/photo-1468327768560-75b778cbb551?w=1200'),
('ورد الستان', 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?w=1200'),
('الكاسات', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=1200'),
('مناديل كتب كتاب', 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200')
on conflict (name) do nothing;

insert into products (name, price, image_url, category_id)
select 'مراية خطوبة وردي', 350, 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200', c.id from categories c where c.name='مرايات خطوبة'
union all
select 'بوكيه ورد أبيض', 220, 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200', c.id from categories c where c.name='الورد'
union all
select 'ورد ستان أحمر', 180, 'https://images.unsplash.com/photo-1455656678494-4d1b5f3e7ad1?w=1200', c.id from categories c where c.name='ورد الستان'
union all
select 'كاسات كتب كتاب ذهبية', 260, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200', c.id from categories c where c.name='الكاسات'
union all
select 'مناديل كتب كتاب مطرزة', 140, 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200', c.id from categories c where c.name='مناديل كتب كتاب';
