import { Router } from "express";
import passport from "../config/passport";
import { setToken } from "../utils/token";
import { ResInterface } from "../interfaces/res";


const routerAuth = Router();

// 发起 Google OAuth 认证
routerAuth.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google 回调处理
routerAuth.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
        // 认证成功后，生成 token 并返回
        const user = req.user as any;
        // 生成 token，有效期例如 1 小时
        const tokenExpireTimeMs = 60 * 60 * 1000;
        const token = await setToken(user.id, user.isAdmin, tokenExpireTimeMs);

        const resContent: ResInterface = {
                        status: 200,
                        msg: "登录成功",
                        data: token,
                    };
        
        res.redirect(`/info`);
        //res.status(200).json(resContent);
        
        // 你可以选择通过重定向返回 token，例如附加在 URL 上
    }
);

export default routerAuth;