DROP TABLE public.group;

CREATE TABLE public.group (
   id SERIAL PRIMARY KEY,
   user_id FOREIGN KEY references public.user(user_id) ON DELETE CASCADE,
   group_name VARCHAR(255) NOT NULL,
   group_description TEXT,
)