import * as dotenv from "dotenv";
// import {allowedOrigins} from "./origins";

dotenv.config();

export const PORT = process.env.PORT;
export const HOST = process.env.HOST;
export const DBHOST = process.env.DBHOST;
export const DBUSER = process.env.DBUSER;
export const DBPASSWORD = process.env.DBPASSWORD;
export const DATABASE = process.env.DATABASE;
export const APP_SECRET_KEY = process.env.APP_SECRET_KEY;
export const STATUSUPDATEINTERVAL = process.env.STATUSUPDATEINTERVAL;
// export const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || allowedOrigins;

export const KNEX_CONFIG = {
    client: "pg",
    port: PORT,
    connection: {
        host: DBHOST,
        user: DBUSER,
        password: DBPASSWORD,
        database: DATABASE
    }
};
