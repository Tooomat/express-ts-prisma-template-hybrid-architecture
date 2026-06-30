import { winstonLogger } from "../logging/index.logging";
import { RedisService } from "./redis";

export const redisService = new RedisService(winstonLogger)