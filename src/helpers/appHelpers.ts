import * as _ from "lodash";
import * as _knex from "knex";
import * as uuid from "uuid";
import * as moment from "moment";

export const uuidForID = () => {
    return uuid().replace(/-/g, "");
};

export const uuidForToken = () => {
    return uuid();
};

export const currentTime = () => {
    return moment.utc().format();
};

export const validateObjectKeys = (obj: any, base: any) => {
    const objKeys = Object.keys(obj);
    let valid = true;
    _.each(objKeys, (key) => {
        if (!base.includes(key)) {
            valid = false;
            return;
        }
    });
    return valid;
};