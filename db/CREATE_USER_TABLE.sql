DROP TABLE public.user;

CREATE TABLE public.user (
   id SERIAL PRIMARY KEY,
   email VARCHAR(255) NOT NULL,
   password VARCHAR(255) NOT NULL, 
   username VARCHAR(50),
   user_id VARCHAR(255) NOT NULL,
   token VARCHAR(255), 
   first_name VARCHAR(50), 
   last_name VARCHAR(50), 
   phone VARCHAR(10),
   created_at VARCHAR(50) NOT NULL,
   last_login VARCHAR(50) NOT NULL,
   is_admin BOOLEAN NOT NULL,
   is_active BOOLEAN NOT NULL
);
