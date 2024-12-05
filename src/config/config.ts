interface RedisConfig {
    username: string;
    password: string;
    databaseName: string;
    publicEndpoint: string;
}

interface Config {
    redis: RedisConfig
}

const config: Config = require("./config.json")

export default config;