import { KNEX_CONFIG } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";
import * as moment from "moment";

const knex = _knex(KNEX_CONFIG);

// HELPER METHODS

export const getAccessToken = (req: any) => {
    return req.headers.authorization.split("token=")[1];
};

export const isUserAdmin = (credentials: any) => {
    return knex("user").where(credentials)
    .select("is_admin")
    .then((user: any) => {
        return user[0]["is_admin"];
    })
    .catch((err: any) => {
        console.assert(err);
        return err;
    });
};

export const bcryptPassword = (password: string) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
};

export const formatUserAttributes = (user: any) => {
    user.password = bcryptPassword(user.password);
    user.created_at = moment().format();
    user.last_login = moment().format();
    user.user_id = uuid().replace(/-/g, "");
    user.token = uuid();
    user.is_active = true;
    user.is_admin = user.is_admin || false;
    return user;
};

// HELPER QUERIES

export const updateUserToken = (user: any) => {
    return new Promise((resolve, reject) => {
        if (!_.isNil(user)) {
            const newToken = uuid();
            const newLogin = moment().format();
            knex("user").where("email", `${user.email}`)
            .update({"token": newToken, "last_login": newLogin})
            .returning(["user_id", "email", "token", "username", "first_name", "last_name", "phone"])
            .then((res: []) => {
                resolve(res[0]);
            })
            .catch((err: any) => {
                reject(err);
            });
        } else {
            reject("No User Found");
        }
    });
};

export const checkUserPassword = (credentials: any) => {
    return new Promise((resolve, reject) => {
        if (!_.isNil(credentials)) {
            findUserByEmail(credentials.email)
            .then((user: any) => {
                return bcrypt.compare(credentials.password, user.password, (err, res) => {
                    if (err)
                        reject(err);
                    resolve(res);
                });
            })
            .catch((err) => {
                reject(err);
            });
        } else {
            reject("No User Credentials Prodived");
        }
    });
};

export const findUserByUserID = (user_id: string) => {
    return new Promise((resolve, reject) => {
        if (!_.isNil(user_id)) {
            knex("user").where("user_id", `${user_id}`)
            .then((res: any) => {
                resolve(res[0]);
            })
            .catch((err: any) => {
                reject(err);
            });
        } else {
            reject("No User ID");
        }
    });
};

export const validUserToken = (credentials: any) => {
    return new Promise((resolve, reject) => {
        if (!_.isNil(credentials)) {
            findUserByUserID(credentials.user_id)
            .then((user: any) => {
                if (user.token === credentials.token) {
                    resolve(true);
                }
                resolve(false);
            })
            .catch((err: any) => {
                console.assert(err);
                reject(err);
            });
        } else {
            reject("No User Credentials");
        }
    });
};

export const findUserByEmail = (userEmail: string) => {
    return new Promise((resolve, reject) => {
        if (!_.isNil(userEmail)) {
            knex("user").where("email", `${userEmail}`)
            .then((res: any) => {
                resolve(res[0]);
            })
            .catch((err: any) => {
                reject(err);
            });
        } else {
            reject("No User Email");
        }
    });
};

export const checkIfUserExists = (userEmail: string) => {
    return new Promise((resolve, reject) => {
        if (!_.isNil(userEmail)) {
            knex("user").where("email", `${userEmail}`)
            .then((res: []) => {
                if (res.length !== 0)
                    resolve(true);
                resolve(false);
            })
            .catch((err: any) => {
                reject(err);
            });
        } else {
            reject("No User Email Provided");
        }
    });
};