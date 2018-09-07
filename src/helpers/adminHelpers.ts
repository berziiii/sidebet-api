import { KNEX_CONFIG } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";

const knex = _knex(KNEX_CONFIG);

export const PERMIT_ADMIN_USER_KEYS = ["user_id", "token", "email", "password", "username", "first_name", "last_name", "phone", "is_admin", "is_active"];
export const ADMIN_USER_RESPONSE_KEYS = ["user_id", "token", "email", "password", "username", "first_name", "last_name", "phone", "is_admin", "is_active", "created_at", "last_login"];

export const getUserById = (credentials: any) => {
    return new Promise((resolve, reject) => {
        knex.select("*").from("user").where("user_id", credentials.user_id)
        .returning(ADMIN_USER_RESPONSE_KEYS)
        .then((user: any) => {
            resolve(user[0]);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const getUsers = () => {
    return new Promise((resolve, reject) => {
        knex.select("*").from("user")
        .returning(ADMIN_USER_RESPONSE_KEYS)
        .orderBy("created_at", "desc")
        .then((users: any) => {
            resolve(users);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const updateUser = (userData: any, credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("user")
        .where("user_id", credentials.user_id)
        .update(userData)
        .returning(ADMIN_USER_RESPONSE_KEYS)
        .then((user: any) => {
            resolve(user);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
 };

export const deleteUser = (credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("user")
        .where("user_id", credentials.user_id)
        .del()
        .then(() => {
            resolve();
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const deleteWager = (credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("wager")
        .where("wager_id", credentials.wager_id)
        .del()
        .then(() => {
            resolve();
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};