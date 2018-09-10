import { KNEX_CONFIG } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as AppHelper from "./appHelpers";

const knex = _knex(KNEX_CONFIG);

export const createActivity = (activity: any) => {
    activity.activity_id = AppHelper.uuidForID();
    return new Promise((resolve, reject) => {
        knex("activity").insert(activity)
        .then(() => {
            resolve();
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const getUserActivity = (userId: any) => {
    return new Promise((resolve, reject) => {
        knex("activity").where("owner_id", userId)
        .returning(["timestamp", "activity_text", "activity_id"])
        .orderBy("timestamp", "desc")
        .then((activities: any) => {
            resolve(activities);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};