import { KNEX_CONFIG } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as AppHelper from "./appHelpers";
import * as BetHelper from "./betHelpers";
import * as moment from "moment";

const knex = _knex(KNEX_CONFIG);

export const PERMIT_WAGER_KEYS = ["owner_id", "wager_id", "wager_type", "wager_status", "share_type", "closes_at", "expires_at", "wager_title", "wager_description", "special_instruction", "wager_prize_type", "wager_prize", "wager_buy_in", "winning_option", "last_modified", "created_at"];
export const RESPONSE_WAGER_KEYS = ["owner_id", "wager_id", "wager_type", "wager_status", "share_type", "closes_at", "expires_at", "wager_title", "wager_description", "special_instruction", "wager_prize_type", "wager_prize", "wager_buy_in", "winning_option", "last_modified", "created_at"];
export const PERMIT_WAGER_OPTION_KEYS = ["owner_id", "wager_id", "option_text"];
export const RESPONSE_WAGER_OPTION_KEYS = ["option_id", "owner_id", "wager_id", "option_text"];

export const updateStatuses = (status: any) => {
    const currentTime = moment.utc().format();
    return new Promise((resolve, reject) => {
        let query; 
        if (status === "Open") {
            query = `UPDATE public.wager SET wager_status = 'In Progress' WHERE (closes_at <= '${currentTime}' AND wager_status = 'Open')`;
            knex.raw(query)
            .then(() => {
                resolve();
            })
            .catch((err: any) => {
                console.error(err);
                reject(err);
            });
        }
        if (status === "In Progress") {
            query = `UPDATE public.wager SET wager_status = 'Pending Review' WHERE (expires_at <= '${currentTime}' AND wager_status = 'In Progress')`;
            knex.raw(query)
            .then(() => {
                resolve();
            })
            .catch((err: any) => {
                console.error(err);
                reject(err);
            });
        }
    });
};

export const validateNewWagerData = (wager: any) => {
    if (!_.isNil(wager)) {
        wager.wager_status = "Open";
        wager.wager_id = AppHelper.uuidForID();
        wager.created_at =  AppHelper.currentTime();
        wager.last_modified = AppHelper.currentTime();
        return wager;
    }
    return "No Wager Data or Invalid Data";
};

export const insertWagerOptionData = (wagerOption: any) => {
    return new Promise((resolve, reject) => {
            knex("option")
            .insert(wagerOption)
            .returning(RESPONSE_WAGER_OPTION_KEYS)
            .then((response: any) => {
                resolve(response);
            })
            .catch((err: any) => {
                console.error(err);
                reject(err);
            });
    });
};

export const insertWagerData = (wager: any) => {
    return new Promise((resolve, reject) => {
        knex("wager")
        .insert(wager)
        .returning(RESPONSE_WAGER_KEYS)
        .then((response: any) => {
            resolve(response);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const getAllWagers = () => {
    return new Promise((resolve, reject) => {
        knex("wager")
        .orderBy("closes_at", "desc")
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
        knex("wager").where("wager_id", credentials.wager_id)
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
        knex("option").where("wager_id", wager.wager_id)
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
        .returning(RESPONSE_WAGER_KEYS)
        .then((res) => {
            resolve(res);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const validateUserOwnsWager = (user: any, credentials: any) => {    
    return new Promise((resolve, reject) => {
        knex("wager").where("wager_id", credentials.wager_id)
        .then((wager: any) => {
            wager = wager[0];
            if (wager.owner_id === user.user_id) {
                resolve(true);
            }
            resolve(false);
        })
        .catch((err) => {
            console.error(err);
            reject(err);
        });
    });
};

export const validateUserOwnsWagerOption = (user: any, credentials: any) => {    
    return new Promise((resolve, reject) => {
        knex("option").where("option_id", credentials.option_id)
        .then((option: any) => {
            option = option[0];
            if (option.owner_id === user.user_id) {
                resolve(true);
            }
            resolve(false);
        })
        .catch((err) => {
            console.error(err);
            reject(err);
        });
    });
};

export const deleteWager = (credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("wager").where("wager_id", credentials.wager_id)
        .del()
        .then(() => {
            resolve();
        })
        .catch((err) => {
            console.error(err);
            reject(err);
        });
    });
};

export const deleteWagerOption = (credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("option").where("option_id", credentials.option_id)
        .del()
        .then(() => {
            resolve();
        })
        .catch((err) => {
            console.error(err);
            reject(err);
        });
    });
};

export const updateWagerOptionData = (wagerOption: any, credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("option").where("option_id", credentials.option_id)
        .update(wagerOption)
        .returning(RESPONSE_WAGER_OPTION_KEYS)
        .then((response: any) => {
            resolve(response);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const findUsersWhoBetOnWager = (wager: any) => {
    return new Promise((resolve, reject) => {
        if (wager.options.length > 0) {
            const promiseChain: any = [];
            _.each(wager.options, (option: any) => {
                promiseChain.push(BetHelper.findUsersBetsByWagerID(option.option_id));
            });
            Promise.all(promiseChain)
            .then((res) => {
                const temp: any = [];
                _.each(_.flattenDeep(res), (a) => {
                    if (!_.isNil(a))
                        temp.push(a);
                });
                wager.bets = temp;
                resolve(wager);
            })
            .catch((err) => {
                console.error(err);
                reject(err);
            });
        } else {
            wager.bets = [];
            resolve(wager);
        }
    });
};

export const findAllUsersForWagers = (wagers: any) => {
    return new Promise((resolve, reject) => {
        const promiseChain: any = [];
        _.each(wagers, (wager: any) => {
            promiseChain.push(findUsersWhoBetOnWager(wager));
        });
        Promise.all(promiseChain)
        .then((allWagers: any) => {
            resolve(allWagers);
        })
        .catch((err) => {
            console.error(err);
            reject(err);
        });
    });
};