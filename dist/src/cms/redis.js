"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_json_1 = __importDefault(require("./../../config.json"));
class RedisClient {
    constructor() {
        this.username = config_json_1.default.redis.username;
        this.password = config_json_1.default.redis.password;
        this.database = config_json_1.default.redis.databaseName;
    }
}
module.exports = new RedisClient();
