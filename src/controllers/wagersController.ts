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
    .then((wagers: any) => {
        if (wagers.length > 0)
            return WagerHelpers.findAllUsersForWagers(wagers);
        return wagers;
    })
    .then((allWagers: any) => {
        res.status(200).json(allWagers);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to find Wagera");
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
        return WagerHelpers.findUsersWhoBetOnWager(wager);
    })
    .then((wager: any) => {
        return UserHelpers.findUserByUserID(wager.owner_id)
                .then((user: any) => {
                    const owner = {
                        username: user.username,
                        email: user.email,
                        user_id: user.user_id
                    };
                    wager.owner = owner;
                    return wager;
                })
                .catch((err: any) => {
                    throw new Error();
                });
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
        if (!_.isNil(user)) {
            if (AppHelpers.validateObjectKeys(wagerData, WagerHelpers.PERMIT_WAGER_KEYS)) {
                wagerData.owner_id = user.user_id;
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
                wagerOptionData.option_id = AppHelpers.uuidForID();
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
        res.status(500).json("Something went wrong. Unable to create Wager Option");
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
            return WagerHelpers.validateUserOwnsWager(user, credentials);
        }
        res.status(422).json("Invalid Wager Data");
    })
    .then((isOwner: boolean) => {
        if (isOwner) {
            return WagerHelpers.updateWagerData(wagerData, credentials);
        }
        res.status(403).json("Unauthorized");
    })
    .then((response: any) => {
        res.status(200).json(response[0]);
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to Update Wager");
    });
};

export const deleteWager = (req: any, res: any) => {
    const credentials: any = {
        token: UserHelpers.getAccessToken(req),
        wager_id: req.params.wagerId
    };
    UserHelpers.findUserByToken(credentials)
    .then((user: any) => {
        return WagerHelpers.validateUserOwnsWager(user, credentials);
    })
    .then((isOwner: boolean) => {
        if (isOwner) {
            return WagerHelpers.deleteWager(credentials);
        }
        res.status(403).json("Unauthorized");
    })
    .then(() => {
        res.status(200).json("Wager Successfully Deleted");
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to delete Wager");
    });
};

export const updateWagerOptionDetails = (req: any, res: any) => {
    const credentials: any = {
        token: UserHelpers.getAccessToken(req),
        option_id: req.params.optionId
    };
    const wagerOptionData = req.body.option || req.body;
    UserHelpers.findUserByToken(credentials)
    .then((user: any) => {
        return WagerHelpers.validateUserOwnsWagerOption(user, credentials);
    })
    .then((isOwner: boolean) => {
        if (isOwner) {
            if (AppHelpers.validateObjectKeys(wagerOptionData, WagerHelpers.PERMIT_WAGER_OPTION_KEYS)) {
                return WagerHelpers.updateWagerOptionData(wagerOptionData, credentials);
            }
            res.status(422).json("Invalid Wager Option Data");
        }
        res.status(403).json("Unauthorized");
    })
    .then((updatedOption: any) => {
        res.status(200).json(updatedOption);
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to Update Wager Option");
    });
};

export const deleteWagerOption = (req: any, res: any) => {
    const credentials: any = {
        token: UserHelpers.getAccessToken(req),
        option_id: req.params.optionId
    };
    UserHelpers.findUserByToken(credentials)
    .then((user: any) => {
        return WagerHelpers.validateUserOwnsWagerOption(user, credentials);
    })
    .then((isOwner: boolean) => {
        if (isOwner) {
            return WagerHelpers.deleteWagerOption(credentials);
        }
        res.status(403).json("Unauthorized");
    })
    .then(() => {
        res.status(200).json("Wager Option Successfully Deleted");
    })
    .catch((err: any) => {
        console.error(err);
        res.status(500).json("Something went wrong. Unable to create Wager");
    });
};

// Invite Users to Private Wager
