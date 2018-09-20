import * as _ from "lodash";
import * as _knex from "knex";
import * as UserHelpers from "../helpers/userHelpers";
import * as BetHelpers from "../helpers/betHelpers";
import * as WagerHelper from "../helpers/wagerHelpers";
import * as AppHelpers from "../helpers/appHelpers";
import * as ActivityController from "./activityController";

export const enterBet = (req: any, res: any) => {
    const credentials = {
        token: UserHelpers.getAccessToken(req),
        wager_id: req.params.wagerId
    };
    let activityType: any = undefined;
    const betData = req.body.bet || req.body;
    UserHelpers.findUserByToken(credentials)
    .then((user: any) => {
        if (user.user_id === betData.owner_id) {
            return true;
        }
        return false;
    })
    .then((isValid: any) => {
        if (isValid) {
            if (AppHelpers.validateObjectKeys(betData, BetHelpers.PERMIT_BET_KEYS)) {
                return BetHelpers.checkIfUsersBetExists(betData, credentials)
                .then((betExists: boolean) => {
                    if (!betExists) {
                        betData.wager_id = credentials.wager_id;
                        betData.bet_id = AppHelpers.uuidForID();
                        activityType = "Create";
                        return BetHelpers.insertBet(betData);
                    } else {
                        activityType = "Update";
                        return updateBet(betData, credentials);
                    }
                })
                .catch((err) => {
                    throw new Error(err);
                });
            } else {
                res.status(422).json("Invalid Bet Data");
            }
        } else {
            res.status(403).json("Unauthorized or Invalid Token");
        }
    })
    .then((createdBet: any) => {
        if (activityType === "Create")
            ActivityController.createUserActivity({
                user_id: createdBet.owner_id,
                activity_text: `User Created Bet on Option ${createdBet.option_id} on Wager ${createdBet.wager_id}`
            });
        else if (activityType === "Update")
            ActivityController.createUserActivity({
                user_id: createdBet.owner_id,
                activity_text: `User Update Bet to Option ${createdBet.option_id} on Wager ${createdBet.wager_id}`
            });
        res.status(200).json(createdBet);
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json(err);
    });
};

export const updateBet = (betData: any, credentials: any) => {
     return BetHelpers.updateBet(betData, credentials)
    .then((updatedBet: any) => {
        return updatedBet[0];
    })
    .catch((err) => {
        console.error(err);
        return err;
    });
};

export const deleteBet = (req: any, res: any) => {
    const credentials = {
        token: UserHelpers.getAccessToken(req),
        wager_id: req.params.wagerId
    };
    let userData: any = undefined;
    UserHelpers.findUserByToken(credentials)
    .then((user: any) => {
        userData = user;
        return BetHelpers.getBetByOwner(user, credentials);
    })
    .then((bet: any) => {
        return BetHelpers.deleteBet(bet[0]["bet_id"]);
    })
    .then(() => {
        ActivityController.createUserActivity({
            user_id: userData.owner_id,
            activity_text: `User Remove Bet on Wager ${credentials.wager_id}`
        });
        res.status(200).json("Bet Successfully Deleted");
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json(err);
    });
};

export const ownerDeleteBet = (req: any, res: any) => {
    const credentials = {
        token: UserHelpers.getAccessToken(req),
        wager_id: req.params.wagerId,
        bet_id: req.params.betId,
    };
    let userData: any = undefined;
    let wagerData: any = undefined;
    UserHelpers.findUserByToken(credentials)
    .then((user: any) => {
        userData = user;
        return WagerHelper.findWagerByID(credentials);
    })
    .then((wager: any) => {
        wagerData = wager;
        if (userData.user_id === wager.owner_id)
            return BetHelpers.deleteBet(credentials.bet_id);
        else 
            return "Not Owner";
    })
    .then(() => {
        if (wagerData.owner_id === userData.user_id) {
            ActivityController.createUserActivity({
                user_id: userData.owner_id,
                activity_text: `Owner ${userData.username} Removed Bet ${credentials.bet_id} on Wager ${credentials.wager_id}`
            });
            res.status(200).json("Bet Successfully Deleted");
        } else {
            res.status(422).json("Unauthorized to Remove User Bet");
        }
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json(err);
    });
};