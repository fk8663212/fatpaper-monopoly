/// <reference path="../types/express-session.d.ts" />
import { Router } from "express";
import { createUser, deleteUser, getUserById, getUserList, isAdmin, userLogin } from "../utils/db/api/user";
import { setToken, verToken } from "../utils/token";
import { ResInterface } from "../interfaces/res";
import multer from "multer";
import path from "path";
import fs from "fs";
import { getImageMainColor } from "../utils";
import { privateKey, publicKey } from "../utils/rsakey";
import { deleteFiles, uploadFile } from "../utils/file-uploader";
import passport from "../config/passport";


// import { setRedis } from "../utils/redis";

const avatarMulter = multer({ dest: "public/avatars" });
const routerUser = Router();

routerUser.get("/list", async (req, res, next) => {
	const { page = 1, size = 8 } = req.query;
	try {
		const { userList, total } = await getUserList(parseInt(page.toString()), parseInt(size.toString()));
		const resMsg: ResInterface = {
			status: 200,
			data: { total, current: parseInt(page.toString()), userList },
		};
		res.status(200).json(resMsg);
	} catch {
		const resMsg: ResInterface = {
			status: 500,
			msg: "獲取使用者列表失敗",
		};
		res.status(500).json(resMsg);
	}
});

routerUser.get("/infogoogle", async (req, res, next) => {
	if (req.session && req.session.user && req.session.token) {
		const resContent: ResInterface = {
		  status: 200,
		  msg: "登录成功",
		  data: {
			user: req.session.user,
			token: req.session.token,
		  },
		};
		res.status(200).json(resContent);
	  } else {
		res.status(401).json({ status: 401, msg: "未登录" });
	  }
	});


routerUser.get("/info", async (req, res, next) => {
	const token = req.body.token || req.header("authorization") || req.query.token;
	if (token) {
		try {
			//@ts-ignore
			const { userId } = verToken(token);
			const user = await getUserById(userId);
			if (user) {
				const resMsg: ResInterface = {
					status: 200,
					data: user,
				};
				res.status(200).json(resMsg);
			} else {
				const resMsg: ResInterface = {
					status: 401,
					msg: "获取用户信息异常",
				};
				res.status(401).json(resMsg);
			}
		} catch (err: any) {
			const resMsg: ResInterface = {
				status: 401,
				msg: "Token过期或失效，请重新登录",
			};
			res.status(401).json(resMsg);
		}
	} else {
		const resMsg: ResInterface = {
			status: 401,
			msg: "身份验证失败：没有附带token",
			data: {},
		};
		res.status(401).json(resMsg);
	}
});


routerUser.get("/public-key", async (req, res, next) => {
	const resMsg: ResInterface = {
		status: 200,
		data: publicKey,
	};
	res.status(200).json(resMsg);
});

routerUser.delete("/delete", async (req, res, next) => {
	const { id } = req.query;
	if (id) {
		try {
			const resMsg: ResInterface = {
				status: 200,
				msg: "删除成功",
				data: await deleteUser(id.toString()),
			};
			res.status(200).json(resMsg);
		} catch (e) {
			const resMsg: ResInterface = {
				status: 500,
				msg: "数据库请求错误",
			};
			res.status(500).json(resMsg);
		}
	}
});

routerUser.post("/login", async (req, res) => {
	const { useraccount, password } = req.body;
	if (useraccount && password) {
		try {
			const user = await userLogin(useraccount, password, privateKey);
			const tokenExpireTimeMs = 60 * 1000;
			const token = await setToken(user.id, user.isAdmin, tokenExpireTimeMs);
			// setRedis(user.id, token, tokenExpireTimeMs);

			const resContent: ResInterface = {
				status: 200,
				msg: "登录成功",
				data: token,
			};
			res.status(200).json(resContent);
		} catch (e: any) {
			const resContent: ResInterface = {
				status: 400,
				msg: e.message,
			};
			res.status(400).json(resContent);
		}
	} else {
		const resContent: ResInterface = {
			status: 400,
			msg: "请求参数错误",
		};
		res.status(400).json(resContent);
	}
});

routerUser.post("/register", avatarMulter.single("avatar"), async (req, res) => {
	if (!req.file) {
		const resContent: ResInterface = {
			status: 400,
			msg: "頭貼上傳異常",
		};
		res.status(400).json(resContent);
		return;
	}

	const { originalname, filename, path: _path } = req.file;

	const fileType = path.parse(originalname).ext;
	if (!fileType || ![".png", ".jpg", ".jpeg"].includes(fileType)) {
		const resMsg: ResInterface = {
			status: 500,
			msg: "檔案不支持",
		};
		res.status(500).json(resMsg);
		return;
	}

	const oldName = _path;
	const avatarFilePath = oldName + fileType;

	fs.renameSync(oldName, avatarFilePath);

	const { useraccount, username, password, color } = req.body;

	if (useraccount && username && password && color) {
		const avatarFileName = filename + fileType;
		try {
			const avatarFileUrl = await uploadFile({
				filePath: avatarFilePath,
				name: avatarFileName,
				targetPath: `fatpaper/user/avatar/`,
			});
			const user = await createUser(useraccount, username, password, avatarFileUrl, color || undefined);
			const resContent: ResInterface = {
				status: 200,
				msg: "註冊成功",
				data: user,
			};
			res.status(200).json(resContent);
		} catch (e: any) {
			const resContent: ResInterface = {
				status: 500,
				msg: e.message || "資料庫處理錯誤",
			};
			res.status(500).json(resContent);
		}
	} else {
		const resContent: ResInterface = {
			status: 400,
			msg: "請求參數錯誤",
		};
		res.status(400).json(resContent);
	}
});

// //google login

// // 發起 Google 認證
// routerUser.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// // Google 認證回調
// routerUser.get("/auth/google/callback", 
//     passport.authenticate("google", { failureRedirect: "/login" }),
//     (req, res) => {
//         // 認證成功後，根據需求重定向或返回 token
//         res.redirect("/user/login");  // 或返回 token 給前端
//     }
// );


export default routerUser;
