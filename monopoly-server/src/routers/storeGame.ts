import { Router } from "express";
import path from "path";
import fs from "fs/promises";
import { ResInterface } from "../interfaces/res";

export const routerStoreGame = Router();

// Define the folder where game data files are stored
const gameDataDir = path.join(__dirname, "../../public/gameData");

// Ensure the game data directory exists
fs.mkdir(gameDataDir, { recursive: true }).catch(console.error);

// Route to store game results
routerStoreGame.post("/store", async (req, res, next) => {
    console.log(req.query);
    //將該資料轉換為JSON檔案
    const data = req.query;
    const fileName = `${data.gameId}.json`;
    const filePath = path.join(gameDataDir, fileName);
    try {
        await fs.writeFile(filePath, JSON.stringify(data));
        console.log(`Saved: ${filePath}`);
        const resMsg: ResInterface = {
            status: 200,
            msg: "遊戲結果儲存成功",
        };
        res.status(resMsg.status).json(resMsg);
    }
    catch (err: any) {
        const resMsg: ResInterface = {
            status: 500,
            msg: "遊戲結果儲存失敗",
        };
        res.status(resMsg.status).json(resMsg);
    }
});

