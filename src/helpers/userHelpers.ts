import { KNEX_CONFIG } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as bcrypt from "bcrypt";
import * as moment from "moment";
import * as AppHelper from "./appHelpers";

const knex = _knex(KNEX_CONFIG);

// HELPER METHODS
export const PERMIT_USER_KEYS = ["user_id", "token", "email", "password", "username", "first_name", "last_name", "phone"];
export const USER_RESPONSE_KEYS = ["user_id", "token", "email", "username", "first_name", "last_name", "phone", "is_admin", "is_active"];

export const getAccessToken = (req: any) => {
    return req.headers.authorization.split("token=")[1];
};

export const isUserAdmin = (credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("user").where("token", credentials.token)
        .select("is_admin")
        .then((user: any) => {
            resolve(user[0]["is_admin"]);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const findUserByToken = (credentials: any) => {
    return knex.select("*").from("user").where("token", credentials.token)
    .returning(USER_RESPONSE_KEYS)
    .then((user: any) => {
        if (user.length > 0) {
            return user[0];
        }
        return "Unable to find User. Please try again with a valid token";
    })
    .catch((err: any) => {
        console.error(err);
        return err;
    });
};

export const isTokenActive = (credentials: any) => {
    return knex.select("*").from("user").where("token", credentials.token)
    .then((user: any) => {
        if (!_.isNil(user) && user.length > 0) {
            return true;
        } else {
            return false;
        }
    })
    .catch((err: any) => {
        console.error(err);
        return err;
    });
};

export const bcryptPassword = (password: string) => {
    const saltRounds = 10;
    const hash = bcrypt.hashSync(password, saltRounds);
    return hash;
};

const validateEmail = (email: any) => {
    const regEx = /^\S+@\S+\.\S+$/;
    return regEx.test(email);
};

const validatePassword = (password: any) => {
    return /[A-Z]/       .test(password) &&
            /[a-z]/       .test(password) &&
            /[0-9]/       .test(password) &&
            /[!@#$%&*?]/g.test(password) &&
            password.length >= 8;
};

const validateEmailAndPassword = (email: any, password: any) => {
    if (validateEmail(email) && validatePassword(password)) {
        return true;
    } else if (!validateEmail(email)) {
        return "Invalid Email";
    } else if (!validatePassword(password)) {
        return "Invalid Password";
    }
};

export const formatUserAttributes = (user: any) => {
    const valid = validateEmailAndPassword(user.email, user.password);
    if (valid === true) {
        user.password = bcryptPassword(user.password);
        user.created_at = AppHelper.currentTime();
        user.last_login = AppHelper.currentTime();
        user.user_id = AppHelper.uuidForID();
        user.token = AppHelper.uuidForToken();
        user.is_active = true;
        user.is_admin = user.is_admin || false;
        return user;
    } else {
        return new Error(valid);
    }
};

// HELPER QUERIES

export const findUserByUsername = (username: any) => {
    return new Promise((resolve, reject) => {
         knex.select("*").from("user").where(
              knex.raw(`LOWER(username) = LOWER('${username}')`)
         )
        .returning(USER_RESPONSE_KEYS)
        .then((res: []) => {
            if (res.length > 0) 
                resolve(false);
            resolve(true);
        })
        .catch((err: any) => {
            reject(err);
        });
    });
};

export const updateUserToken = (user: any) => {
    return new Promise((resolve, reject) => {
        const newToken = AppHelper.uuidForToken();
        const newLogin = moment.utc().format();
        knex("user").where("email", `${user.email}`)
        .update({"token": newToken, "last_login": newLogin})
        .returning(USER_RESPONSE_KEYS)
        .then((res: []) => {
            resolve(res[0]);
        })
        .catch((err: any) => {
            reject(err);
        });
    });
};

export const checkUserPassword = (credentials: any) => {
    return new Promise((resolve, reject) => {
        findUserByEmailOrUsername(credentials.email)
        .then((user: any) => {
            const match = bcrypt.compareSync(credentials.password, user.password);
            resolve(match);
        })
        .catch((err) => {
            reject(err);
        });
    });
};

export const findUserByUserID = (user_id: string) => {
    return new Promise((resolve, reject) => {
        knex("user").where("user_id", `${user_id}`)
        .then((res: any) => {
            resolve(res[0]);
        })
        .catch((err: any) => {
            reject(err);
        });
    });
};

export const validUserToken = (credentials: any) => {
    return new Promise((resolve, reject) => {
        findUserByUserID(credentials.user_id)
        .then((user: any) => {
            if (user.token === credentials.token) {
                resolve(true);
            }
            resolve(false);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const findUserByEmailOrUsername = (credential: string) => {
    return new Promise((resolve, reject) => {
        knex("user").where(
            knex.raw(`LOWER(email) = LOWER('${credential}')`)
        ).orWhere(
            knex.raw(`LOWER(username) = LOWER('${credential}')`)
        )
        .then((res: any) => {
            resolve(res[0]);
        })
        .catch((err: any) => {
            reject(err);
        });
    });
};

export const findUserByEmail = (userEmail: string) => {
    return new Promise((resolve, reject) => {
        knex("user").where("email", `${userEmail}`)
        .then((res: any) => {
            resolve(res[0]);
        })
        .catch((err: any) => {
            reject(err);
        });
    });
};

export const checkIfUserExists = (userEmail: string) => {
    return new Promise((resolve, reject) => {
        knex("user").where("email", `${userEmail}`)
        .then((res: []) => {
            if (res.length !== 0)
                resolve(true);
            resolve(false);
        })
        .catch((err: any) => {
            reject(err);
        });
    });
};

export const insertUserData = (user: any) => {
    return new Promise((resolve, reject) => {
        knex("user").insert(user)
        .returning(USER_RESPONSE_KEYS)
        .then((userData: []) => {
            resolve(userData[0]);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const logoutUser = (credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("user").where("user_id", credentials.user_id)
        .update("token", null)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            console.error(err);
            reject();
        });
    });
};

export const updateUserData = (userData: any, credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("user").where("user_id", credentials.user_id)
        .update(userData)
        .returning(USER_RESPONSE_KEYS)
        .then((user: any) => {
            resolve(user);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const updateUserPassword = (newUserPassword: any, credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("user").where("user_id", credentials.user_id)
        .update("password", newUserPassword)
        .then(() => {
           resolve();
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
