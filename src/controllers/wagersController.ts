import * as _ from "lodash";
import * as _knex from "knex";
import * as UserHelpers from "../helpers/userHelpers";
import * as WagerHelpers from "../helpers/wagerHelpers";
import * as AppHelpers from "../helpers/appHelpers";

export const getAllWagers = (req: any, res: any) => {
    const credentials: any = {
        token: UserHelpers.getAccessToken(req),
    };
    UserHelpers.isTokenActive(credentials)
    .then((validToken: boolean) => {
        if (validToken) {
            return WagerHelpers.getAllWagers();
        } else {
            res.status(422).json("Unauthorized or not a valid Token");
        }
    })
    .then((allWagers: any) => {
        res.status(200).json(allWagers);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to find Wager");
    });
};

export const getWager = (req: any, res: any) => {
    const credentials: any = {
        token: UserHelpers.getAccessToken(req),
        wager_id: req.params.wagerId
    };
    UserHelpers.isTokenActive(credentials)
    .then((validToken: boolean) => {
        if (validToken) {
            return WagerHelpers.findWagerByID(credentials);
        } else {
            res.status(422).json("Unauthorized or not a valid Token");
        }
    })
    .then((wager: any) => {
        return WagerHelpers.findWagerOptionsByWagerId(wager);
    })
    .then((wager: any) => {
        if (!_.isNil(wager)) {
            res.status(200).json(wager);
        } else {
            res.status(404).json("Something went wrong");
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to find Wager");
    });
};
// Create Wager

export const createWager = (req: any, res: any) => {
    const credentials: any = {
        token: UserHelpers.getAccessToken(req),
    };
    const wagerData = req.body.wager || req.body;
    UserHelpers.findUserByToken(credentials)
    .then((user: any) => {
        if (wagerData.owner_id === user.user_id) {
            if (AppHelpers.validateObjectKeys(wagerData, WagerHelpers.PERMIT_WAGER_KEYS)) {
                return WagerHelpers.validateNewWagerData(wagerData);
            }
            res.status(422).json("Invalid Wager Data");
        } else {
            res.status(403).json("Unauthorized or not a valid token");
        }
    })
    .then((validatedWager: any) => {
        return WagerHelpers.insertWagerData(validatedWager);
    })
    .then((createdWager: any) => {
        res.status(200).json(createdWager[0]);
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to create Wager");
    });
};

export const createWagerOption = (req: any, res: any) => {
    const credentials: any = {
        token: UserHelpers.getAccessToken(req),
        wager_id: req.params.wagerId
    };
    const wagerOptionData = req.body.option || req.body;
    UserHelpers.findUserByToken(credentials)
    .then((user: any) => {
        if (wagerOptionData.owner_id === user.user_id) {
            if (AppHelpers.validateObjectKeys(wagerOptionData, WagerHelpers.PERMIT_WAGER_OPTION_KEYS)) {
                wagerOptionData.wager_id = credentials.wager_id;
                return WagerHelpers.insertWagerOptionData(wagerOptionData);
            }
            res.status(422).json("Invalid Wager Option Data");
        } else {
            res.status(403).json("Unauthorized or not a valid token");
        }
    })
    .then((createdWagerOption: any) => {
        res.status(200).json(createdWagerOption);
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to create Wager");
    });
};

export const updateWagerDetails = (req: any, res: any) => {
    const credentials: any = {
        token: UserHelpers.getAccessToken(req),
        wager_id: req.params.wagerId
    };
    const wagerData = req.body.option || req.body;
    UserHelpers.findUserByToken(credentials)
    .then((user: any) => {
        if (AppHelpers.validateObjectKeys(wagerData, WagerHelpers.PERMIT_WAGER_KEYS)) {
            wagerData.last_modified = AppHelpers.currentTime();
            return WagerHelpers.validateUserOwnsWager(user, credentials, wagerData);
        }
        res.status(422).json("Invalid Wager Data");
    })
    .then((response: any) => {
        res.status(200).json(response[0]);
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to Update Wager");
    });
};

// export const removeAllUserRelatedItems = (req: any, res: any) => {
//     const credentials = {
//         token: UserHelpers.getAccessToken(req),
//         user_id: req.params.userId,
//     };
//     WagerHelpers.deleteUserWagers(credentials)
//     .then(() => { return WagerHelpers.deleteUserOptions(credentials); })
//     // .then(() => { return WagerHelpers.deleteUserBets(credentials); })
//     .then(() => {
//         res.status(200).json("All User Data Removed Successfully");
//     })
//     .catch((err: any) => {
//         console.error(err);
//         res.status(500).json(err);
//     });
// };

// Invite Users to Private Wager

// Update Wager
