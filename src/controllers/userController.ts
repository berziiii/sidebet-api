import { KNEX_CONFIG } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";
import * as moment from "moment";

const knex = _knex(KNEX_CONFIG);

const getAccessToken = (req: any) => {
    return req.headers.authorization.split("token=")[1];
};

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

const findUserByEmail = (userEmail: string) => {
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

const updateUserToken = (user: any) => {
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

const checkIfUserExists = (userEmail: string) => {
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

export const getUsers = (req: any, res: any) => {
    knex.select().from("user")
    .then((users: []) => {
        res.status(200).json(users);
    })
    .catch((err: any) => {
        console.assert(err);
        res.status(500).json(err);
    });
};

export const logoutUser = (req: any, res: any) => {
    const credentials = req.body.user || req.body;
    validUserToken(credentials)
    .then((validToken: any) => {
        if (validToken) {
            knex("user").where("user_id", credentials.user_id)
            .update("token", null)
            .then(() => {
                res.status(200).json("Successfully Logged Out");
            })
            .catch((err) => {
                console.assert(err);
                res.status(500).json(err);
            });
        } else {
            res.status(422).json("Not a valid User Token");
        }
    })
    .catch((err: any) => {
        console.assert(err);
        res.status(500).json(err);
    });
};

export const createUser = (req: any, res: any) => {
    let user = req.body.user || req.body;
    checkIfUserExists(user.email)
    .then((userExist: boolean) => {
        if (!_.isNil(user) && !userExist) {
            user = formatUserAttributes(user);
            knex.insert(user).into("user")
            .returning(["user_id", "email", "token", "username", "first_name", "last_name", "phone"])
            .then((response: {}) => {
                res.status(200).json(response);
            })
            .catch((err: any) => {
                console.assert(err);
                res.status(500).json(err);
            });
        } else {
            if (_.isNil(user)) {
                res.status(500).json("Please provide user information");
            } else {
                res.status(422).json("User already exists");
            }
        }
    })
    .catch((err: any) => {
        console.assert(err);
        res.status(500).json("Something went wrong");
    });
};

export const updateUserDetails = (req: any, res: any) => {
    const userData = req.body.user || req.body;
    const credentials = {
        "token": getAccessToken(req),
        "user_id": req.params.userId,
    };
    if (!_.isNil(userData)) {
        validUserToken(credentials)
        .then((validToken: boolean) => {
            if (validToken) {
                knex("user").where("user_id", credentials.user_id)
                .update(userData)
                .returning(["user_id", "email", "token", "username", "first_name", "last_name", "phone"])
                .then((user: any) => {
                    res.status(200).json(user[0]);
                })
                .catch((err: any) => {
                    console.assert(err);
                    res.status(500).json("Something went wrong. Unable to update User data");
                });
            } else {
                res.status(403).json("Unauthorized Action");
            }
        })
        .catch((err: any) => {
            console.assert(err);
        });
    } else {
        res.status(422).json("No User Data");
    }
};

export const loginUser = (req: any, res: any) => {
    const credentials = req.body.credentials || req.body;
    if (!_.isNil(credentials)) {
        checkUserPassword(credentials)
        .then((userPasswordMatch: boolean) => {
            if (userPasswordMatch) {
                findUserByEmail(credentials.email)
                .then((user: {}) => {
                    return updateUserToken(user);
                })
                .then((user: {}) => {
                    res.status(200).json(user);
                })
                .catch((err) => {
                    console.assert(err);
                    res.status(500).json("Something went wrong, unable to Sign In");
                });
            } else {
                res.status(422).json("Username or Password does not match. Please try again.");
            }
        })
        .catch((err) => {
            console.assert(err);
            res.status(500).json("Something went wrong. Unable to validate Password");
        });
    } else {
        res.status(500).json("Please provide user information");
    }
};