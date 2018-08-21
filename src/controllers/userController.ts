import { KNEX_CONFIG } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as bcrypt from "bcrypt";
import * as uuid from "uuid";
import * as moment from "moment";

const knex = _knex(KNEX_CONFIG);

const bcryptPassword = (password: string) => {
    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
};

const checkUser = (userEmail: string) => {
        return knex("user").where("email", `${userEmail}`)
        .then((res: any) => {
            if (res.length !== 0)
                return true;
            return false;
        })
        .catch((err: any) => {
            return err;
        });
};

export const getUsers = (req: any, res: any) => {
    knex.select().from("user")
    .then((response: any) => {
        res.status(200).json(response);
    })
    .catch((err) => {
        res.status(500).json(err);
    });
};

export const createUser = (req: any, res: any) => {
    const user = req.body.user || req.body;
    checkUser(user.email)
    .then((userExist) => {
        if (!_.isNil(user) && !userExist) {
            user.password = bcryptPassword(user.password);
            user.created_at = moment().format();
            user.last_login = moment().format();
            user.user_id = uuid().replace(/-/g, "");
            user.token = uuid();
            knex.insert(user).into("user").returning(["user_id", "email", "token", "username", "first_name", "last_name", "phone"])
            .then((response: any) => {
                res.status(200).json(response);
            })
            .catch((err) => {
                res.status(500).json(err);
            });
        } else {
            if (_.isNil(user))
                res.status(500).json("Please provide user information");
            else 
                res.status(422).json("User already exists");
        }
    })
    .catch((err) => {
        res.status(500).json("Something went wrong");
    });
};

export const loginUser = (req: any, res: any) => {
    // const user = req.body.user || req.body;
    // if (!_.isNil(user))
    //     knex.insert(user).into("user")
    //     .then((response: any) => {
    //         res.status(200).json(response);
    //     })
    //     .catch((err) => {
    //         res.status(500).json(err);
    //     });
    // else 
    //     res.status(500).json("Please provide user information");
};