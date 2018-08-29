import { KNEX_CONFIG } from "../config";
import * as _ from "lodash";
import * as _knex from "knex";
import * as AppHelper from "./appHelpers";

const knex = _knex(KNEX_CONFIG);