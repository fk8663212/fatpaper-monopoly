import "reflect-metadata";
import AppDataSource from "./src/utils/db/dbConnecter";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routerUser from "./src/routers/user";
import {serverLog} from "./src/utils/logger";
import chalk from "chalk";
import {APIPORT} from "./src/static";
import session from "express-session";
import passport from "passport";
import {roomRouter} from "../monopoly-server/src/routers/room-router";
import authRouter from "./src/routers/auth";


async function bootstrap() {
    try {
        await AppDataSource.initialize().then(() => {
            serverLog(`${chalk.bold.bgGreen(" 資料庫連接成功")}`);
        });

        // await redisClientInit().then(() => {
        // 	serverLog(`${chalk.bold.bgGreen(" Redis连接成功 ")}`);
        // });

        const app = express();

        app.use(session({
            secret: "your_secret_key", // 请使用一个安全的字符串
            resave: false,
            saveUninitialized: false,
            cookie: { secure: false }  // 如果是在 HTTP 开发环境，secure 设为 false；生产环境建议使用 HTTPS 并设置为 true
          }));
          
        //初始化 passport 中间件
        app.use(passport.initialize());
        app.use(passport.session());

        

        app.use(cors());

        app.use("/static", express.static("public"));

        app.use("/auth", authRouter);
        
        //app.use("/room-router", roomRouter);
        // app.use(roleValidation);

        app.use(bodyParser.json());

        app.use("/user", routerUser);

        app.get('/health', (req, res) => {
            // 在这里进行服务的健康检查，返回适当的响应
            // 为了配合docker-compose按顺序启动
            res.status(200).send('OK');
        });

        app.listen(APIPORT, () => {
            serverLog(`${chalk.bold.bgGreen(` APIserver啟動成功 ${APIPORT}port `)} `);
        });
    } catch (e: any) {
        serverLog(`${chalk.bold.bgRed(` server錯誤: `)}`, "error");
        serverLog(`${chalk.bold.bgRed(e.message)}`, "error");
    }
}

bootstrap();
