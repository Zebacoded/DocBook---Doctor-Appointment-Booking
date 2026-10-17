-- TABLES
create table categories (
  id serial primary key,
  name text not null unique
);

create table doctors (
  id serial primary key,
  name text not null,
  bio text,
  experience text,
  address text,
  image_url text,
  category_id int references categories(id)
);

create table appointments (
  id serial primary key,
  user_id uuid not null references auth.users(id),
  doctor_id int not null references doctors(id),
  date date not null,
  time_slot text not null,
  note text,
  created_at timestamptz default now(),
  unique (doctor_id, date, time_slot)   -- prevents double-booking
);

-- SECURITY (row level security)
alter table categories enable row level security;
alter table doctors enable row level security;
alter table appointments enable row level security;

create policy "anyone reads categories" on categories for select using (true);
create policy "anyone reads doctors" on doctors for select using (true);

create policy "users read own appointments" on appointments
  for select using (auth.uid() = user_id);
create policy "users create own appointments" on appointments
  for insert with check (auth.uid() = user_id);
create policy "users delete own appointments" on appointments
  for delete using (auth.uid() = user_id);

-- Taken slots must be visible to everyone without exposing who booked them
create or replace function taken_slots(p_doctor int, p_date date)
returns table(time_slot text)
language sql security definer as $$
  select time_slot from appointments
  where doctor_id = p_doctor and date = p_date;
$$;

-- SAMPLE DATA
insert into categories (name) values
 ('General'),('Cardiologist'),('Dentist'),
 ('Dermatologist'),('Pediatrician'),('Orthopedic');

insert into doctors (name, bio, experience, address, image_url, category_id) values
 ('Dr. Aarav Mehta','Family physician focused on preventive care.','10 Years','12 Park Street, Kolkata','https://i.pravatar.cc/400?img=12',1),
 ('Dr. Sana Khan','Heart specialist with a focus on hypertension.','14 Years','45 Lake Road, Mumbai','https://i.pravatar.cc/400?img=47',2),
 ('Dr. Rohan Verma','Cardiologist experienced in non-invasive diagnosis.','8 Years','7 MG Road, Pune','https://i.pravatar.cc/400?img=15',2),
 ('Dr. Priya Nair','Dentist for cosmetic and general dentistry.','9 Years','88 Hill View, Kochi','https://i.pravatar.cc/400?img=45',3),
 ('Dr. Kabir Singh','Skin specialist treating acne and allergies.','11 Years','21 Civil Lines, Delhi','https://i.pravatar.cc/400?img=33',4),
 ('Dr. Meera Iyer','Pediatrician caring for newborns to teens.','13 Years','5 Anna Salai, Chennai','https://i.pravatar.cc/400?img=44',5),
 ('Dr. Vikram Rao','Orthopedic surgeon for joint and sports injuries.','16 Years','30 Ring Road, Hyderabad','https://i.pravatar.cc/400?img=59',6),
 ('Dr. Ananya Das','General practitioner with a patient-first approach.','6 Years','9 Salt Lake, Kolkata','https://i.pravatar.cc/400?img=49',1);