import { Router } from "express";
import { roleValidation } from "../utils/role-validation";
import { ResInterface } from "../interfaces/res";
import { verToken } from "../utils/token";
import { getUserList,createUser,deleteUser } from "../db/api/user";

export const routerUser = Router();

routerUser.get("/is-admin", async (req, res, next) => {
	const token = req.headers.authorization;
	if (!token) {
		const resContent: ResInterface = {
			status: 401,
			msg: "没有携带token",
		};
		res.status(401).json(resContent);
		return;
	}
	const tokenInfo = await verToken(token);
	if (!tokenInfo) {
		const resContent: ResInterface = {
			status: 401,
			msg: "token解析失败",
		};
		res.status(401).json(resContent);
		return;
	}
	const isAdmin = tokenInfo.isAdmin;
	if (isAdmin) {
		const resContent: ResInterface = {
			status: 200,
			data: { isAdmin: true },
		};
		res.status(200).json(resContent);
	} else {
		const resContent: ResInterface = {
			status: 403,
			msg: "你不是管理员喔",
		};
		res.status(403).json(resContent);
	}
});

// 獲取用戶列表
routerUser.get("/list", async (req, res) => {
    const { page = 1, size = 8 } = req.query;
    try {
        const { userList, total } = await getUserList(parseInt(page.toString()), parseInt(size.toString()));
        const resMsg: ResInterface = {
            status: 200,
            data: { total, current: parseInt(page.toString()), userList },
        };
        res.status(200).json(resMsg);
    } catch (error) {
        const resMsg: ResInterface = {
            status: 500,
            msg: "获取用户列表失败",
        };
        res.status(500).json(resMsg);
    }
});

//刪除用戶
routerUser.delete("/delete", async (req, res) => {
    // 從 query 或 body 中取得用戶 ID
    const { id } = req.query;
    if (!id) {
        const resContent: ResInterface = {
            status: 400,
            msg: "缺少用戶 ID",
        };
        return res.status(400).json(resContent);
    }
    try {
        // 呼叫刪除用戶函式
        const result = await deleteUser(id.toString());
        const resContent: ResInterface = {
            status: 200,
            msg: "用戶刪除成功",
            data: result,
        };
        res.status(200).json(resContent);
    } catch (error: any) {
        const resContent: ResInterface = {
            status: 500,
            msg: error.message || "資料庫請求錯誤",
        };
        res.status(500).json(resContent);
    }
});

//創建用戶資訊
// routerUser.post("/create", roleValidation, async (req, res) => {
// 	const { useraccount, username, password, avatar, color } = req.body;
// 	try {
// 		const user = await createUser(useraccount, username, password, avatar, color);
// 		const resMsg: ResInterface = {
// 			status: 200,
// 			data: user,
// 		};
// 		res.status(200).json(resMsg);
// 	} catch (error) {
// 		const resMsg: ResInterface = {
// 			status: 500,
// 			msg: "創建用戶失敗",
// 		};
// 		res.status(500).json(resMsg);
// 	}
// });

//註冊
