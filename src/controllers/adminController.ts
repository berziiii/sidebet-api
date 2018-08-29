import * as _ from "lodash";
import * as _knex from "knex";
import * as UserHelpers from "../helpers/userHelpers";
import * as AppHelpers from "../helpers/appHelpers";
import * as AdminHelpers from "../helpers/adminHelpers";
import * as WagerController from "./wagersController";

// ADMIN ENDPOINTS
export const adminGetUsers = (req: any, res: any) => {
    const credentials = {
        token: UserHelpers.getAccessToken(req),
    };
    UserHelpers.isUserAdmin(credentials)
    .then((isAdmin: any) => {
        if (isAdmin) {
           return AdminHelpers.getUsers();
        } else {
            res.status(422).json("Unauthorized. Admin Priviledges required");
        }
    })
    .then((users: any) => {
        res.status(200).json(users);
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500);
    });
};

export const adminUpdateUser = (req: any, res: any) => {
    const userInfo = req.body.user || req.body;
    const credentials = {
        token: UserHelpers.getAccessToken(req),
        user_id: req.params.userId
    };
    if (!_.isNil(userInfo.password)) {
        userInfo.password = UserHelpers.bcryptPassword(userInfo.password);
    }
    UserHelpers.isUserAdmin(credentials)
    .then((isAdmin: boolean) => {
        if (isAdmin) {
            if (AppHelpers.validateObjectKeys(userInfo, AdminHelpers.PERMIT_ADMIN_USER_KEYS)) {
                return AdminHelpers.updateUser(userInfo, credentials);
            } else {
                res.status(422).json("Invalid User Data");
            }
        } else {
            res.status(422).json("Unauthorized or not a valid Token");
        }
    })
    .then((updatedUser: any) => {
        res.status(200).json(updatedUser[0]);
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json(err);
    });
};

export const adminDeleteUser = (req: any, res: any) => {
    const credentials = {
        token: UserHelpers.getAccessToken(req),
        user_id: req.params.userId,
    };
    UserHelpers.isUserAdmin(credentials)
    .then((isAdmin: boolean) => {
        if (isAdmin) {
            return AdminHelpers.deleteUser(credentials);
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

export const adminDeleteWager = (req: any, res: any) => {
    const credentials = {
        token: UserHelpers.getAccessToken(req),
        wager_id: req.params.wagerId,
    };
    UserHelpers.isUserAdmin(credentials)
    .then((isAdmin: boolean) => {
        if (isAdmin) {
            return AdminHelpers.deleteWager(credentials);
        } else {
            res.status(422).json("Unauthorized or not a valid Token");
        }
    })
    .then(() => {
        res.status(200).json("Wager and Wager Options Successfully Deleted");
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to Delete user");
    });
};