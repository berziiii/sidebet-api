import { KNEX_CONFIG, APP_SECRET_KEY } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as UserHelpers from "../helpers/userHelpers";

const knex = _knex(KNEX_CONFIG);

const insertGroup = (group: any) => {
    return new Promise((resolve, reject) => {
        knex("group")
        .insert(group)
        .returning("*")
        .then((res: any) => {
            resolve(res);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

const findUserByToken = (credentials: any) => {
    return new Promise((resolve, reject) => {
        knex.select()
        .from("user")
        .where("token", credentials.token)
        .returning(["id"])
        .then((user: any) => {
            resolve(user);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

// Create Group
export const createGroup = (req: any, res: any) => {
    const credentials = {
        "token": UserHelpers.getAccessToken(req)
    };
    const group = req.body.group || req.body;
    if (!_.isNil(group)) {
        findUserByToken(credentials)
        .then((user: any) => {
            if (user) {

            } else {
                res.status(500).json("Not a valid Token. Please try again");
            }
        })
        .then((response: any) => {
            // return addUserMembershipToGroup()
        })
        .catch((err: any) => {
            console.error(err);
            res.status(500).json("Something went wrong. Unable to create Group.");
        });
    } else {
        res.status(422).json("No Group Information. Please try again");
    }
};

// Edit Group

// RemoveGroup

// Invite Members

// Remove Members

// Manage Members 