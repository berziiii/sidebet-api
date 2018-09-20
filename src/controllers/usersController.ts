import { APP_SECRET_KEY } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as UserHelpers from "../helpers/userHelpers";
import * as AppHelpers from "../helpers/appHelpers";
import * as ActivityController from "./activityController";
import { resolve } from "dns";

// USER ENDPOINTS

export const checkIfUsernameExists = (req: any, res: any) => {
    UserHelpers.findUserByUsername(req.body.username)
    .then((validUsername: string) => {
        res.status(200).json(validUsername);
    })
    .catch((err: any) => {
        console.error(err);
    });
};

export const validateUserToken = (req: any, res: any) => {
    const credentials = {
        token: UserHelpers.getAccessToken(req),
    };
    UserHelpers.findUserByToken(credentials)
    .then((user: any) => {
        if (!_.isNil(user)) {
            res.status(200).json(user);
        } else {
            res.status(422).json("Unauthorized or Invalid Token");
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to validate Password");
    });
};

export  const checkIfUserExists = (req: any, res: any) => {
    const user = req.body.user || req.body;
    if (user.app_secret_key === APP_SECRET_KEY) {
        delete user.app_secret_key;
        UserHelpers.checkIfUserExists(user.email)
        .then((userExist: boolean) => {
            res.status(200).json(userExist);
        })
        .catch((err: any) => {
            console.error(err);
            res.status(500).json("Something went wrong");
        });
    } else {
        res.status(422).json("Application Secret Key not valid or missing. Please try again.");
    }
};

export const createUser = (req: any, res: any) => {
    let user = req.body.user || req.body;
    if (user.app_secret_key === APP_SECRET_KEY) {
        delete user.app_secret_key;
        UserHelpers.checkIfUserExists(user.email)
        .then((userExist: boolean) => {
            let error;
            if (!_.isNil(user) && !userExist && AppHelpers.validateObjectKeys(user, UserHelpers.PERMIT_USER_KEYS)) {
                user = UserHelpers.formatUserAttributes(user);
                return UserHelpers.insertUserData(user);
            } else if (!AppHelpers.validateObjectKeys(user, UserHelpers.PERMIT_USER_KEYS)) {
                return error = "Invalid User Data";
            } else if (_.isNil(user)) {
                return error = "Please provide user information";
            } else {
                return error = "User already exists";
            }
        })
        .then((createdUser: any) => {
            if (_.isObject(createdUser)) {
                ActivityController.createUserActivity({
                    user_id: createdUser.user_id,
                    activity_text: "User created account"
                });
                res.status(200).json(createdUser);
            } else {
                res.status(422).json(createdUser);
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
        UserHelpers.findUserByEmailOrUsername(credentials.email)
        .then((account: any) => {
            let error;
            if (!_.isNil(account) && account.is_active) {
                return UserHelpers.checkUserPassword(credentials);
            } else if (!_.isNil(account) && !account.is_active) {
                return error = "Account is locked or not active. Please contact an Administrator";
            } else {
                return error = "Account does not exist. Please Sign Up!";
            }
        })
        .then((userPasswordMatch: boolean) => {
            if (userPasswordMatch === true) {
                UserHelpers.findUserByEmailOrUsername(credentials.email)
                .then((user: {}) => {
                    return UserHelpers.updateUserToken(user);
                })
                .then((user: {}) => {
                    res.status(200).json(user);
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).json("Something went wrong, unable to Sign In.");
                });
            } else if (userPasswordMatch === false) {
                res.status(422).json("Username or Password does not match. Please try again.");
            } else {
                res.status(422).json(userPasswordMatch);
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json(err);
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
            ActivityController.createUserActivity({
                user_id: credentials.user_id,
                activity_text: "User updated Account Information"
            });
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
            ActivityController.createUserActivity({
                user_id: credentials.user_id,
                activity_text: "User Updated Password"
            });
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