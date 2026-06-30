import { winstonLogger } from "../logging/index.logging";
// import { PrismaMysqlService } from "./prisma-mysql.service";
import { PrismaPgService } from "./prisma-pg.service";

// export const databaseService = new PrismaMysqlService(winstonLogger)
export const databaseService = new PrismaPgService(winstonLogger)