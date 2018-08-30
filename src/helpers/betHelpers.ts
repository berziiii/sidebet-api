import { KNEX_CONFIG } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as AppHelper from "./appHelpers";
import * as UserHelper from "./userHelpers";

const knex = _knex(KNEX_CONFIG);

export const PERMIT_BET_KEYS = ["option_id", "owner_id", "wager_id", "bet_amount"];
export const BET_RESPONSE_KEYS = ["option_id", "owner_id", "wager_id", "bet_amount"];

export const checkIfUsersBetExists = (betData: any, credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("bet").where({"owner_id": betData.owner_id, "wager_id": credentials.wager_id})
        .returning(BET_RESPONSE_KEYS)
        .then((bet: any) => {
            if (bet.length > 0) {
                resolve(true);
            }
            resolve(false);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const checkUserOwnsBet = (user: any, credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("bet").where("bet_id", credentials.bet_id)
        .returning(BET_RESPONSE_KEYS)
        .then((bet: any) => {
            if (user.user_id === bet[0]["owner_id"]) {
                resolve(true);
            }
            resolve(false);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const updateBet = (betData: any, credentials: any) => {
    return new Promise((resolve, reject) => {
        knex("bet").where({"wager_id": credentials.wager_id, "owner_id": betData.owner_id})
        .update({"option_id": betData.option_id, "bet_amount": betData.bet_amount})
        .returning(BET_RESPONSE_KEYS)
        .then((updatedBet: any) => {
            resolve(updatedBet);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const insertBet = (betData: any) => {
    return new Promise((resolve, reject) => {
        knex("bet").insert(betData)
        .returning(BET_RESPONSE_KEYS)
        .then((newBet: any) => {
            resolve(newBet[0]);
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const deleteBet = (betId: any) => {
    return new Promise((resolve, reject) => {
        knex("bet").where("bet_id", betId)
        .del()
        .then(() => {
            resolve();
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};

export const findUsersBetsByWagerID = (optionId: any) => {
    return new Promise((resolve, reject) => {
        knex("bet").where("option_id", optionId)
        .returning(BET_RESPONSE_KEYS)
        .then((bets: any) => {
            const PromiseChain: any = [];
            const formattedBets: any = [];
            _.each(bets, (bet) => {
                PromiseChain.push(UserHelper.findUserByUserID(bet.owner_id));
            });
            Promise.all(PromiseChain)
            .then((users: any) => {
                if (users.length > 0) {
                    _.each(users, (user) => {
                        const temp: any = {
                            username: user.username,
                            first_name: user.first_name,
                            last_name: user.last_name,
                            user_id: user.user_id
                        };
                        _.each(bets, (bet) => {
                            if (bet.owner_id === user.user_id) {
                                temp.bet_amount = bet.bet_amount;
                                temp.option_id = bet.option_id;
                                temp.wager_id = bet.wager_id;
                                temp.bet_id = bet.bet_id;
                            }
                        });
                        formattedBets.push(temp);
                    });
                    resolve(formattedBets);
                } else {
                    resolve();
                }
            })
            .catch((err) => { 
                console.error(err);
                reject(err);
            });
        })
        .catch((err: any) => {
            console.error(err);
            reject(err);
        });
    });
};