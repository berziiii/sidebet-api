DROP TABLE public.activity;

CREATE TABLE public.activity (
    id SERIAL PRIMARY KEY,
    activity_id VARCHAR(255) NOT NULL UNIQUE,
    owner_id VARCHAR(255) REFERENCES public.user(user_id) ON DELETE CASCADE,
    activity_text TEXT NOT NULL,
    timestamp VARCHAR(255) NOT NULL
);