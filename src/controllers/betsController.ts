import * as _ from "lodash";
import * as _knex from "knex";
import * as UserHelpers from "../helpers/userHelpers";
import * as BetHelpers from "../helpers/betHelpers";
import * as AppHelpers from "../helpers/appHelpers";

export const enterBet = (req: any, res: any) => {
    const credentials = {
        token: UserHelpers.getAccessToken(req),
        wager_id: req.params.wagerId
    };
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
                        return BetHelpers.insertBet(betData);
                    } else {
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
    UserHelpers.findUserByToken(credentials)
    .then((user: any) => {
        return BetHelpers.getBetByOwner(user, credentials);
    })
    .then((bet: any) => {
        return BetHelpers.deleteBet(bet[0]["bet_id"]);
    })
    .then(() => {
        res.status(200).json("Bet Successfully Deleted");
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json(err);
    });

};