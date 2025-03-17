import { Router } from "express";
import passport from "../config/passport";

const routerAuth = Router();

// 发起 Google OAuth 认证
routerAuth.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google 回调处理
routerAuth.get("/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("/user/info"); // 登录成功后跳转
    }
);

export default routerAuth;