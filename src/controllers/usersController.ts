import { KNEX_CONFIG, APP_SECRET_KEY } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as UserHelpers from "../helpers/userHelpers";
import * as AppHelpers from "../helpers/appHelpers";
import * as WagerController from "./wagersController";

const knex = _knex(KNEX_CONFIG);

// USER ENDPOINTS

export const createUser = (req: any, res: any) => {
    let user = req.body.user || req.body;
    if (user.app_secret_key === APP_SECRET_KEY) {
        delete user.app_secret_key;
        UserHelpers.checkIfUserExists(user.email)
        .then((userExist: boolean) => {
            if (!_.isNil(user) && !userExist && AppHelpers.validateObjectKeys(user, UserHelpers.PERMIT_USER_KEYS)) {
                user = UserHelpers.formatUserAttributes(user);
                return UserHelpers.insertUserData(user);
            } else if (!AppHelpers.validateObjectKeys(user, UserHelpers.PERMIT_USER_KEYS)) {
                res.status(422).json("Invalid User Data");
            } else {
                if (_.isNil(user)) {
                    res.status(500).json("Please provide user information");
                } else {
                    res.status(422).json("User already exists");
                }
            }
        })
        .then((createdUser: any) => {
            res.status(200).json(createdUser);
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
        token: UserHelpers.getAccessToken(req),
        user_id: req.params.userId,
    };
    UserHelpers.validUserToken(credentials)
    .then((validToken: any) => {
        if (validToken) {
            return UserHelpers.logoutUser(credentials);
        } else {
            res.status(422).json("Not a valid User Token");
        }
    })
    .then(() => {
        res.status(200).json("Successfully Logged Out");
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json(err);
    });
};

export const updateUserInformation = (req: any, res: any) => {
    const userData = req.body.user || req.body;
    const credentials = {
        token: UserHelpers.getAccessToken(req),
        user_id: req.params.userId,
    };
    if (!_.isNil(userData)) {
        UserHelpers.validUserToken(credentials)
        .then((validToken: boolean) => {
            if (validToken) {
                if (AppHelpers.validateObjectKeys(userData, UserHelpers.PERMIT_USER_KEYS)) {
                    return UserHelpers.updateUserData(userData, credentials);
                } else {
                    res.status(422).json("Invalid User Data");
                }
            } else {
                res.status(403).json("Unauthorized Action");
            }
        })
        .then((updateUser: any) => {
            res.status(200).json(updateUser[0]);
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
        token: UserHelpers.getAccessToken(req),
        user_id: req.params.userId,
    };
    if (!_.isNil(userData)) {
        UserHelpers.validUserToken(credentials)
        .then((validToken: boolean) => {
            if (validToken) {
                if (AppHelpers.validateObjectKeys(userData, UserHelpers.PERMIT_USER_KEYS)) {
                    const newUserPassword = UserHelpers.bcryptPassword(userData.password);
                    return UserHelpers.updateUserPassword(newUserPassword, credentials);
                } else {
                    res.status(422).json("Invalid User Data");
                }
            } else {
                res.status(403).json("Unauthorized Action");
            }
        })
        .then(() => {
            res.status(200).json("Password Successfully Updated");
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
        token: UserHelpers.getAccessToken(req),
        user_id: req.params.userId,
    };
    UserHelpers.validUserToken(credentials)
    .then((validToken: boolean) => {
        if (validToken) {
           return UserHelpers.deleteUser(credentials);
        } else {
            res.status(422).json("Unauthorized or not a valid Token");
        }
    })
    .then(() => {
        res.status(200).json("User Account Successfully Deleted");
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to Delete user");
    });
};