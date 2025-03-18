import { Router } from "express";
import path from "path";
import fs from "fs/promises";
import fs_s from "fs";
import { ResInterface } from "../interfaces/res";
import xlsx from "xlsx";
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import schedule from 'node-schedule';
const credentials = JSON.parse(fs_s.readFileSync(path.join(__dirname, '/certificate/fatpaper-9e0e53bdafee.json'), 'utf8'));

// filepath: /home/fatpaper-monopoly/monopoly-server/src/routers/question.ts

export const routerQuestion = Router();

// Define the folder where question files are stored
const questionsDir = path.join(__dirname, "../../public/question");
const serviceAccountAuth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

//抓取google sheet資料
export async function getData(docID: string, sheetID: string, credentialsPath = '../certificate/fatpaper-9e0e53bdafee.json') {
    try {
        const doc = new GoogleSpreadsheet('13hQI18B4o1PBT-6ChlpHqUnP_O-ulkiga_DKhXECKg8', serviceAccountAuth);
        await doc.loadInfo(); // 讀取 Google Sheet 資訊

        for (const sheet of doc.sheetsByIndex) {
            const rows = await sheet.getRows();
            if (rows.length === 0) continue; // 若無資料則跳過
            
            const header = sheet.headerValues;
            const rowsData = rows.map(row => {
                const obj: Record<string, any> = {};
                header.forEach(col => {
                    obj[col] = row.get(col);
                });
                return obj;
            });
            
            console.log(`Processing sheet: ${sheet.title}`);
            const ws = xlsx.utils.json_to_sheet(rowsData);
            const wb = xlsx.utils.book_new();
            xlsx.utils.book_append_sheet(wb, ws, sheet.title);
            
            const filePath = path.join(__dirname, `../../public/question/${sheet.title}.xlsx`);
            try {
                await fs.access(filePath);
            } catch (err) {
                // If the file doesn't exist, ensure the directory exists and create an empty file first
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, '');
            }
            xlsx.writeFile(wb, filePath);
            console.log(`Saved: ${filePath}`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
  };

//定時更新資料
const updateDataAtMidnight = () => {
    schedule.scheduleJob('0 0 * * *', async () => {
        try {
            console.log("Updating data at midnight...");
            await getData("13hQI18B4o1PBT-6ChlpHqUnP_O-ulkiga_DKhXECKg8", "0");
            console.log("Data updated successfully.");
        } catch (error) {
            console.error("Error updating data at midnight:", error);
        }
    });
};

updateDataAtMidnight();
getData("13hQI18B4o1PBT-6ChlpHqUnP_O-ulkiga_DKhXECKg8", "0");

// Route to list all question files in the public/questions folder
routerQuestion.get("/list", async (req, res, next) => {
    console.log("list");
    try {
        const files = (await fs.readdir(questionsDir)).filter(file => file.endsWith('.xlsx')).map(file => file.replace('.xlsx', ''));
        const resMsg: ResInterface = {
            status: 200,
            data: files,
        };
        res.status(resMsg.status).json(resMsg);
    } catch (err: any) {
        const resMsg: ResInterface = {
            status: 500,
            msg: "讀取題目檔案列表失敗",
        };
        res.status(resMsg.status).json(resMsg);
    }
});

// Route to retrieve a specific question file by filename (via query parameter)
routerQuestion.get("/detail", async (req, res, next) => {
    const { filename } = req.query;
    if (!filename || typeof filename !== "string") {
        const resMsg: ResInterface = {
            status: 400,
            msg: "缺少或錯誤的檔案名稱參數",
        };
        res.status(resMsg.status).json(resMsg);
        return;
    }

    // Prevent directory traversal attacks
    if (filename.includes("..")) {
        const resMsg: ResInterface = {
            status: 400,
            msg: "非法檔案名稱",
        };
        res.status(resMsg.status).json(resMsg);
        return;
    }

    const filePath = path.join(questionsDir, `${filename}.xlsx`);
    try {
        const fileBuffer = await fs.readFile(filePath);
        const workbook = xlsx.read(fileBuffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const fileContent = xlsx.utils.sheet_to_json(sheet);
        const resMsg: ResInterface = {
            status: 200,
            data: fileContent,
        };
        res.status(resMsg.status).json(resMsg);
    } catch (err: any) {
        const resMsg: ResInterface = {
            status: 500,
            msg: "讀取題目檔案失敗",
        };
        res.status(resMsg.status).json(resMsg);
    }
});