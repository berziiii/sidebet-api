import { KNEX_CONFIG } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";
import * as moment from "moment";

const knex = _knex(KNEX_CONFIG);

const bcryptPassword = (password: string) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
};

const formatUserAttributes = (user: any) => {
    user.password = bcryptPassword(user.password);
    user.created_at = moment().format();
    user.last_login = moment().format();
    user.user_id = uuid().replace(/-/g, "");
    user.token = uuid();
    return user;
};

const checkUserPassword = (credentials: any) => {
    return new Promise((resolve, reject) => {
        findUserByEmail(credentials.email)
        .then((user) => {
            return bcrypt.compare(credentials.password, user[0]["password"], (err, res) => {
                if (err)
                    reject(err);
                resolve(res);
            });
        })
        .catch((err) => {
            reject(err);
        });
    });
};

const findUserByEmail = (userEmail: string) => {
    return knex("user").where("email", `${userEmail}`)
    .then((res: any) => {
        return res;
    })
    .catch((err: any) => {
        return err;
    });
};

const updateUserToken = (user: any) => {
    const newToken = uuid();
    return knex("user").where("email", `${user.email}`).update("token", newToken).returning(["user_id", "email", "token", "username", "first_name", "last_name", "phone"])
    .then((res: any) => {
        return res;
    })
    .catch((err: any) => {
        return err;
    });
};

const checkUser = (userEmail: string) => {
    return knex("user").where("email", `${userEmail}`)
    .then((res: any) => {
        if (res.length !== 0)
            return true;
        return false;
    })
    .catch((err: any) => {
        return err;
    });
};

export const getUsers = (req: any, res: any) => {
    knex.select().from("user")
    .then((response: any) => {
        res.status(200).json(response);
    })
    .catch((err) => {
        res.status(500).json(err);
    });
};

export const createUser = (req: any, res: any) => {
    let user = req.body.user || req.body;
    checkUser(user.email)
    .then((userExist) => {
        if (!_.isNil(user) && !userExist) {
            user = formatUserAttributes(user);
            knex.insert(user).into("user").returning(["user_id", "email", "token", "username", "first_name", "last_name", "phone"])
            .then((response: any) => {
                res.status(200).json(response);
            })
            .catch((err) => {
                res.status(500).json(err);
            });
        } else {
            if (_.isNil(user))
                res.status(500).json("Please provide user information");
            else 
                res.status(422).json("User already exists");
        }
    })
    .catch((err) => {
        res.status(500).json("Something went wrong");
    });
};

export const userLogin = (req: any, res: any) => {
    const credentials = req.body.credentials || req.body;
    if (!_.isNil(credentials)) {
        checkUserPassword(credentials)
        .then((userPasswordMatch) => {
            if (userPasswordMatch) {
                findUserByEmail(credentials.email)
                .then((user) => {
                    return updateUserToken(user[0]);
                })
                .then((user) => {
                    res.status(200).json(user);
                })
                .catch((err) => {
                    res.status(500).json("Something went wrong, unable to Sign In");
                })
            }
            else
                res.status(422).json("Username or Password does not match. Please try again.");
        })
        .catch((err) => {
            res.status(500).json("Something went wrong. Unable to validate Password");
        });
    } else {
        res.status(500).json("Please provide user information");
    }
};