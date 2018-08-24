import { KNEX_CONFIG, APP_SECRET_KEY } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as UserHelpers from "../helpers/userHelpers";

const knex = _knex(KNEX_CONFIG);

// USER ENDPOINTS

export const createUser = (req: any, res: any) => {
    let user = req.body.user || req.body;
    if (user.app_secret_key === APP_SECRET_KEY) {
        delete user.app_secret_key;
        UserHelpers.checkIfUserExists(user.email)
        .then((userExist: boolean) => {
            if (!_.isNil(user) && !userExist) {
                user = UserHelpers.formatUserAttributes(user);
                knex.insert(user).into("user")
                .returning(["user_id", "email", "token", "username", "first_name", "last_name", "phone"])
                .then((userData: []) => {
                    res.status(200).json(userData[0]);
                })
                .catch((err: any) => {
                    console.error(err);
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
            console.error(err);
            res.status(500).json("Something went wrong");
        });
    } else {
        res.status(422).json("Application Secret Key not valid or missing. Please try again.");
    }
};

export const loginUser = (req: any, res: any) => {
    const credentials = req.body.credentials || req.body;
    if (!_.isNil(credentials)) {
        UserHelpers.checkUserPassword(credentials)
        .then((userPasswordMatch: boolean) => {
            if (userPasswordMatch) {
                UserHelpers.findUserByEmail(credentials.email)
                .then((user: {}) => {
                    return UserHelpers.updateUserToken(user);
                })
                .then((user: {}) => {
                    res.status(200).json(user);
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).json("Something went wrong, unable to Sign In");
                });
            } else {
                res.status(422).json("Username or Password does not match. Please try again.");
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json("Something went wrong. Unable to validate Password");
        });
    } else {
        res.status(500).json("Please provide user information");
    }
};

export const logoutUser = (req: any, res: any) => {
    const credentials = {
        "token": UserHelpers.getAccessToken(req),
        "user_id": req.params.userId,
    };
    UserHelpers.validUserToken(credentials)
    .then((validToken: any) => {
        if (validToken) {
            knex("user").where("user_id", credentials.user_id)
            .update("token", null)
            .then(() => {
                res.status(200).json("Successfully Logged Out");
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json(err);
            });
        } else {
            res.status(422).json("Not a valid User Token");
        }
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json(err);
    });
};

export const updateUserInformation = (req: any, res: any) => {
    const userData = req.body.user || req.body;
    const credentials = {
        "token": UserHelpers.getAccessToken(req),
        "user_id": req.params.userId,
    };
    if (!_.isNil(userData)) {
        UserHelpers.validUserToken(credentials)
        .then((validToken: boolean) => {
            if (validToken) {
                knex("user").where("user_id", credentials.user_id)
                .update(userData)
                .returning(["user_id", "email", "token", "username", "first_name", "last_name", "phone"])
                .then((user: any) => {
                    res.status(200).json(user[0]);
                })
                .catch((err: any) => {
                    console.error(err);
                    res.status(500).json("Something went wrong. Unable to update User Details");
                });
            } else {
                res.status(403).json("Unauthorized Action");
            }
        })
        .catch((err: any) => {
            console.error(err);
            res.status(500).json("Something went wrong. Unable to update User Details");
        });
    } else {
        res.status(422).json("No User Data");
    }
};

export const updateUserPassword = (req: any, res: any) => {
    const userData = req.body.user || req.body;
    const credentials = {
        "token": UserHelpers.getAccessToken(req),
        "user_id": req.params.userId,
    };
    if (!_.isNil(userData)) {
        UserHelpers.validUserToken(credentials)
        .then((validToken: boolean) => {
            if (validToken) {
                const newUserPassword = UserHelpers.bcryptPassword(userData.password);
                knex("user").where("user_id", credentials.user_id)
                .update("password", newUserPassword)
                .then(() => {
                    res.status(200).json("Password Successfull Updated");
                })
                .catch((err: any) => {
                    console.error(err);
                    res.status(500).json("Something went wrong. Unable to update User password");
                });
            } else {
                res.status(403).json("Unauthorized Action");
            }
        })
        .catch((err: any) => {
            console.error(err);
            res.status(500).json("Something went wrong. Unable to update User password");
        });
    } else {
        res.status(422).json("No User Data");
    }
};

export const deleteUser = (req: any, res: any) => {
    const credentials = {
        "token": UserHelpers.getAccessToken(req),
        "user_id": req.params.userId,
    };
    UserHelpers.validUserToken(credentials)
    .then((validToken: boolean) => {
        if (validToken) {
            knex("user")
            .where("user_id", credentials.user_id)
            .del()
            .then(() => {
                res.status(200).json("User Successfully Deleted");
            })
            .catch((err: any) => {
                console.error(err);
                res.status(500).json(err);
            });
        } else {
            res.status(422).json("Unauthorized or not a valid Token");
        }
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to Delete user");
    });
};

// ADMIN ENDPOINTS

export const adminGetUsers = (req: any, res: any) => {
    const credentials = {
        "token": UserHelpers.getAccessToken(req),
    };
    UserHelpers.isUserAdmin(credentials)
    .then((isAdmin: any) => {
        if (isAdmin) {
            knex.select(["user_id", "email", "username", "first_name", "last_name", "phone", "last_login", "created_at", "is_admin", "is_active"])
            .from("user")
            .orderBy("created_at", "desc")
            .then((users: []) => {
                res.status(200).json(users);
            })
            .catch((err: any) => {
                console.error(err);
                res.status(500).json(err);
            });
        } else {
            res.status(422).json("Unauthorized User. Admin Priviledges required");
        }
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500);
    });
};

export const adminUpdateUser = (req: any, res: any) => {
    const userInfo = req.body.user || req.body;
    const userId = req.params.userId;
    const credentials = {
        "token": UserHelpers.getAccessToken(req)
    };
    if (!_.isNil(userInfo.password)) {
        userInfo.password = UserHelpers.bcryptPassword(userInfo.password);
    }
    UserHelpers.isUserAdmin(credentials)
    .then((isAdmin: boolean) => {
        if (isAdmin) {
            knex("user")
            .where("user_id", userId)
            .update(userInfo)
            .returning(["user_id", "email", "username", "first_name", "last_name", "phone", "last_login", "created_at", "is_admin", "is_active"])
            .then((user: any) => {
                res.status(200).json(user[0]);
            })
            .catch((err: any) => {
                console.error(err);
                res.status(500).json(err);
            });
        } else {
            res.status(422).json("Unauthorized or not a valid Token");
        }
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to update user");
    });
};

export const adminDeleteUser = (req: any, res: any) => {
    const credentials = {
        "token": UserHelpers.getAccessToken(req),
        "user_id": req.params.userId,
    };
    UserHelpers.isUserAdmin(credentials)
    .then((isAdmin: boolean) => {
        if (isAdmin) {
            knex("user")
            .where("user_id", credentials.user_id)
            .del()
            .then(() => {
                res.status(200).json("User Successfully Deleted");
            })
            .catch((err: any) => {
                console.error(err);
                res.status(500).json(err);
            });
        } else {
            res.status(422).json("Unauthorized or not a valid Token");
        }
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to Delete user");
    });
};