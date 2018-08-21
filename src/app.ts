import {HOST, PORT} from "./config";
import {appRouter} from "./router";
import * as _ from "lodash";
import * as express from "express";
import * as cors from "cors";
import * as bodyParser from "body-parser";
import * as helmet from "helmet";

const app = express();
const ROUTER = express.Router();
// adding for Strict-Transport-Security
app.use(helmet.hsts({
    maxAge: 7776000000,
    includeSubdomains: true
}));

// disable powered by header
app.disable("x-powered-by");

app.use(cors({
    // origin: (requestOrigin: string, callback: (err: Error | null, allow?: boolean) => void) => {
    //     const allowedOrigins = !_.isArray(ALLOWED_ORIGINS) ? ALLOWED_ORIGINS.split(",") : ALLOWED_ORIGINS;
    //     if (!requestOrigin)
    //         return callback(null, true);

    //     if (allowedOrigins.indexOf(requestOrigin) === -1) {
    //         const msg = `The CORS policy for this site does not allow access from the specified Origin ${requestOrigin}.`;
    //         return callback(new Error(msg), false);
    //     }

    //     return callback(null, true);
    // },
    origin: true,
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(ROUTER);

appRouter(ROUTER);

app.listen(PORT, () => console.log(`SIDEBET API is now listening on ${HOST}:${PORT}`));