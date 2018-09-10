import * as _ from "lodash";
import * as moment from "moment";
import * as ActivityHelpers from "../helpers/activityHelpers";

export const createUserActivity = (activity: any) => {
    const data = {
        owner_id: activity.user_id,
        activity_text: activity.activity_text,
        timestamp: moment().format()
    };
    ActivityHelpers.createActivity(data)
    .catch((err: any) => {
        console.error(err);
    });
};

export const getUserActivity = (userId: any) => {
    return ActivityHelpers.getUserActivity(userId)
    .then((activities: any) => {
        return activities;
    })
    .catch((err: any) => {
        console.error(err);
    });
};