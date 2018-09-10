import * as _ from "lodash";
import * as _knex from "knex";
import * as UserHelpers from "../helpers/userHelpers";
import * as AppHelpers from "../helpers/appHelpers";
import * as AdminHelpers from "../helpers/adminHelpers";
import * as ActivityController from "./activityController";
// import * as WagerController from "./wagersController";

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

export const adminGetUser = (req: any, res: any) => {
    const credentials = {
        token: UserHelpers.getAccessToken(req),
        user_id: req.params.userId
    };
    UserHelpers.isUserAdmin(credentials)
    .then((isAdmin: any) => {
        if (isAdmin) {
           return AdminHelpers.getUserById(credentials);
        } else {
            res.status(422).json("Unauthorized. Admin Priviledges required");
        }
    })
    .then((user: any) => {
        res.status(200).json(user);
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
        if (!_.isNil(userInfo.password))
            ActivityController.createUserActivity({
                user_id: credentials.user_id,
                activity_text: "Admin Reset User Password"
            });
        else if (!_.isNil(userInfo.is_admin) && userInfo.is_admin)
            ActivityController.createUserActivity({
                user_id: credentials.user_id,
                activity_text: "Admin Status added to User"
            });
        else if (!_.isNil(userInfo.is_admin) && !userInfo.is_admin)
            ActivityController.createUserActivity({
                user_id: credentials.user_id,
                activity_text: "Admin Status removed from User"
            });
        else if (!_.isNil(userInfo.is_active) && userInfo.is_active)
            ActivityController.createUserActivity({
                user_id: credentials.user_id,
                activity_text: "Active Status added to User"
            });
        else if (!_.isNil(userInfo.is_active) && !userInfo.is_active)
            ActivityController.createUserActivity({
                user_id: credentials.user_id,
                activity_text: "Active Status removed to User"
            });
        else 
            ActivityController.createUserActivity({
                user_id: credentials.user_id,
                activity_text: "Admin updated User Information"
            });
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

export const adminGetUserActivity = (req: any, res: any) => {
    const credentials = {
        token: UserHelpers.getAccessToken(req),
        user_id: req.params.userId,
    };
    UserHelpers.isUserAdmin(credentials)
    .then((isAdmin: boolean) => {
        if (isAdmin) {
            return ActivityController.getUserActivity(credentials.user_id);
        } else {
            res.status(422).json("Unauthorized or not a valid Token");
        }
    })
    .then((activities: any) => {
        res.status(200).json(activities);
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to get User Activity");
    });
};