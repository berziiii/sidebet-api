DROP TABLE public.wager CASCADE;
DROP TABLE public.wager_option CASCADE;
DROP TABLE public.pool CASCADE;

CREATE TABLE public.wager (
    id SERIAL PRIMARY KEY,
    wager_id VARCHAR(255) NOT NULL UNIQUE,
    owner_id VARCHAR(255) REFERENCES public.user(user_id) ON DELETE CASCADE,
    wager_type VARCHAR(50) NOT NULL,
    wager_status VARCHAR(50) NOT NULL,
    share_type VARCHAR(50) NOT NULL,
    closes_at VARCHAR(50) NOT NULL,
    created_at VARCHAR(50) NOT NULL,
    last_modified VARCHAR(50) NOT NULL,
    wager_description TEXT NOT NULL,
    wager_prize_type VARCHAR(255) NOT NULL,
    wager_prize VARCHAR(255),
    wager_buy_in VARCHAR(255)
);

CREATE TABLE public.wager_option (
    id SERIAL PRIMARY KEY,
    owner_id VARCHAR(255) REFERENCES public.user(user_id) ON DELETE CASCADE,
    wager_id VARCHAR(255) REFERENCES public.wager(wager_id) ON DELETE CASCADE,
    wager_text TEXT NOT NULL,
    is_winner BOOLEAN
);

CREATE TABLE public.pool (
    id SERIAL PRIMARY KEY,
    owner_id VARCHAR(255) REFERENCES public.user(user_id) ON DELETE CASCADE,
    wager_id  VARCHAR(255) REFERENCES public.wager(wager_id) ON DELETE CASCADE,
    option_id INT REFERENCES public.wager_option(id) ON DELETE CASCADE,
    wager_amount TEXT NOT NULL
);
