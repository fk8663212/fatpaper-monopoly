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
        try {
          const user = req.user as any;
          // 生成 token（例如 JWT），有效期 1 小时
          const tokenExpireTimeMs = 60 * 60 * 1000;
          const token = await setToken(user.id, user.isAdmin, tokenExpireTimeMs);
    
          // 将 token 和用户信息存入 session
          req.session.token = token;
          req.session.user = user;
    
          res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>登录成功</title>
            </head>
            <body>
              <script>
                (function() {
                  // 将生成的 token 和用户信息传递给主窗口
                  var token = "${token}";
                  var user = ${JSON.stringify(user)};
                  if (window.opener) {
                    window.opener.postMessage({ type: "login_success", token: token, user: user }, "*");
                    // 关闭当前 popup 窗口
                    window.close();
                  } else {
                    // 如果没有父窗口，则重定向到首页
                    window.location.href = "/";
                  }
                })();
              </script>
              <p>登录成功，正在跳转...</p>
            </body>
            </html>
          `);

        } catch (error) {
          console.error("Google callback error:", error);
          res.redirect("/login");
        }
      }
);

export default routerAuth;