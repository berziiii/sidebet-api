import { KNEX_CONFIG } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as AppHelper from "./appHelpers";

const knex = _knex(KNEX_CONFIG);

export const PERMIT_WAGER_KEYS = ["owner_id", "wager_id", "wager_type", "wager_status", "share_type", "closes_at", "wager_description", "wager_prize_type", "wager_prize", "wager_buy_in", "last_modified"];
export const PERMIT_WAGER_OPTION_KEYS = ["owner_id", "wager_id", "wager_text", "is_winner"];

export const insertWagerOptionData = (wagerOption: any) => {
    return new Promise((resolve, reject) => {
        if (!_.isNil(wagerOption)) {
            knex("wager_option")
            .insert(wagerOption)
            .returning(PERMIT_WAGER_OPTION_KEYS)
            .then((response: any) => {
                resolve(response);
            })
            .catch((err: any) => {
                console.error(err);
                reject(err);
            });
        } else {
            reject("Something went wrong. Unable to insert Wager Option");
        }
    });
};

export const insertWagerData = (wager: any) => {
    return new Promise((resolve, reject) => {
        if (!_.isNil(wager)) {
            knex("wager")
            .insert(wager)
            .returning(PERMIT_WAGER_KEYS)
            .then((response: any) => {
                resolve(response);
            })
            .catch((err: any) => {
                console.error(err);
                reject(err);
            });
        } else {
            reject("Something went wrong. Unable to insert Wager");
        }
    });
};

export const validateNewWagerData = (wager: any) => {
    if (!_.isNil(wager)) {
        wager.wager_status = "Open";
        wager.wager_id = AppHelper.uuidForID();
        wager.created_at =  AppHelper.currentTime();
        wager.last_modified = wager.created_at;
        return wager;
    }
    return "No Wager Data or Invalid Data";
};

export const getAllWagers = () => {
    return new Promise((resolve, reject) => {
        knex.select().from("wager")
        .then((wagers: any) => {
            if (!_.isNil(wagers) && wagers.length > 0) {
                const promiseChain: any = [];
                wagers.forEach((wager: any) => {
                    promiseChain.push(findWagerOptionsByWagerId(wager));
                });
                Promise.all(promiseChain)
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    console.error(err);
                    reject(err);
                });
            } else {
                resolve("No Wagers Found");
            }
        })
        .catch((err) => {
            console.error(err);
            reject(err);
        });
    });
};

export const findWagerByID = (credentials: any) => {
    return new Promise((resolve, reject) => {
        knex.select("").from("wager").where("wager_id", credentials.wager_id)
        .then((wager: any) => {
            if (wager.length > 0) {
                resolve(wager[0]);
            } else {
                resolve("No Wager Found");
            }
        })
        .catch((err) => {
            console.error(err);
            reject(err);
        });
    });
};

export const findWagerOptionsByWagerId = (wager: any) => {
    return new Promise((resolve, reject) => {
        knex.select().from("wager_option").where("wager_id", wager.wager_id)
        .then((options: any) => {
            wager.options = options;
            resolve(wager);
        })
        .catch((err) => {
            console.error(err);
            reject(err);
        });
    });
};

export const updateWagerData = (wagerData: any, credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("wager").where("wager_id", credentials.wager_id)
        .update(wagerData)
        .returning(PERMIT_WAGER_KEYS)
        .then((res) => {
            resolve(res);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const validateUserOwnsWager = (user: any, credentials: any, wagerData: any) => {    
    return new Promise((resolve, reject) => {
        knex("wager").where("wager_id", credentials.wager_id)
        .then((wager: any) => {
            wager = wager[0];
            if (wager.owner_id === user.user_id) {
                return updateWagerData(wagerData, credentials);
            }
        })
        .then((res: any) => {
            resolve(res);
        })
        .catch((err) => {
            console.error(err);
            reject(err);
        });
    });
};