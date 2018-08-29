DROP TABLE public.membership;

CREATE TABLE public.membership (
   id SERIAL PRIMARY KEY,
   user_id VARCHAR(255) references public.user(user_id),
   group_id INT references public.group(id),
   is_owner BOOLEAN NOT NULL,
   is_admin BOOLEAN NOT NULL,
   is_member BOOLEAN NOT NULL
);

