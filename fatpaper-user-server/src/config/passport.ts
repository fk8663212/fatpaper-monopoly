// src/config/passport.ts
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { createUserFromGoogleProfile, findUserByEmail, findUserById } from "../utils/db/api/user"; // 你需要实现这两个函数，用于查询和创建用户
import { setToken } from "../utils/token";

// 配置 Google 策略
passport.use(new GoogleStrategy({
    // clientID: process.env.GOOGLE_CLIENT_ID!,       // 从环境变量获取
    // clientSecret: process.env.GOOGLE_CLIENT_SECRET!, // 从环境变量获取
    clientID: "32337256213-u6p1v2833tce0la1fetq1o0nbqs8up8g.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // 根据 profile.id 查找用户
        let user = await findUserByEmail(profile.id);
        if (!user) {
            // 如果用户不存在，根据 profile 信息自动注册
            user = await createUserFromGoogleProfile(profile);
        }
        // 如果需要，你可以在这里生成 token 等后续处理
        done(null, user);
    } catch (err) {
        //done(err, null);
    }
}));

// 序列化/反序列化（如果使用 session 的话）
passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await findUserById(String(id));
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});



export default passport;
