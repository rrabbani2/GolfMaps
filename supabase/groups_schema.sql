-- Create groups table for Group Play feature
create table if not exists course_groups (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  created_at timestamp with time zone not null default now(),
  status text not null default 'open' check (status in ('open', 'full', 'closed')),
  tee_time timestamp with time zone,
  note text
);

create index if not exists course_groups_course_id_idx on course_groups (course_id);
create index if not exists course_groups_status_idx on course_groups (status);

-- Create group_members table
create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references course_groups(id) on delete cascade,
  name text not null,
  contact text,
  created_at timestamp with time zone not null default now()
);

create index if not exists group_members_group_id_idx on group_members (group_id);

-- Enable Row Level Security (RLS)
alter table course_groups enable row level security;
alter table group_members enable row level security;

-- Groups policies: everyone can read open groups, anyone can create groups
create policy "Groups are viewable by everyone" on course_groups
  for select using (true);

create policy "Anyone can create groups" on course_groups
  for insert with check (true);

create policy "Anyone can update groups" on course_groups
  for update using (true);

-- Group members policies: everyone can read members, anyone can join
create policy "Group members are viewable by everyone" on group_members
  for select using (true);

create policy "Anyone can join groups" on group_members
  for insert with check (true);

-- Function to check and update group status when members are added
create or replace function check_group_capacity()
returns trigger as $$
declare
  member_count integer;
begin
  -- Count current members in the group
  select count(*) into member_count
  from group_members
  where group_id = new.group_id;
  
  -- If group is now full (4 members), update status
  if member_count >= 4 then
    update course_groups
    set status = 'full'
    where id = new.group_id and status = 'open';
  end if;
  
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update group status when a member is added
create trigger update_group_status_on_member_add
  after insert on group_members
  for each row
  execute function check_group_capacity();

