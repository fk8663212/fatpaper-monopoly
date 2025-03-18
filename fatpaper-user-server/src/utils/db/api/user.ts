import {User} from "../entities/user";
import AppDataSource from "../dbConnecter";
import {decryptPassword, generatePasswordHash, getRandomString, randomColor} from "../../index";

const userRepository = AppDataSource.getRepository(User);

export const createUser = async (
    useraccount: string,
    username: string,
    password: string,
    avatar: string,
    color?: string
) => {
    const user = await AppDataSource.manager.findOneBy(User, {useraccount});
    if (user) throw new Error("已经存在的账号名")
    const decryptedPassword = decryptPassword(password);
    const {salt, passwordHash} = generatePasswordHash(decryptedPassword, getRandomString(16));

    const userToCreate = new User();
    userToCreate.useraccount = useraccount;
    userToCreate.username = username;
    userToCreate.password = passwordHash;
    userToCreate.salt = salt;
    userToCreate.avatar = avatar;
    userToCreate.color = color || randomColor();

    return await userRepository.save(userToCreate);
};

export const userLogin = async (useraccount: string, password: string, privateKey: string) => {
    const user = await AppDataSource.manager.findOneBy(User, {useraccount});
    if (user) {
        const decryptedPassword = decryptPassword(password);
        if (!decryptedPassword) throw new Error("客户端密码解密失败");
        const {passwordHash} = generatePasswordHash(decryptedPassword, user.salt);
        if (user.password === passwordHash) {
            return user;
        } else {
            throw new Error("密码错误");
        }
    } else {
        throw new Error("不存在的账号");
    }
};

export const deleteUser = async (id: string) => {
    const user = await userRepository.findOne({
        where: {id},
    });
    if (user) {
        return userRepository.remove(user);
    } else {
        null;
    }
};

export const getUserById = async (userId: string) => {
    const user = await AppDataSource.manager.findOne(User, {
        select: ["id", "useraccount", "username", "avatar", "color"],
        where: {id: userId},
    });
    if (user) {
        return user;
    } else {
        return null;
    }
};

export const getUserList = async (page: number, size: number) => {
    const userList = await userRepository.find({
        skip: (page - 1) * size,
        take: size,
        select: ["id", "username", "avatar", "color"],
    });
    // const total = Math.round((await userRepository.count()) / size);
    const total = await userRepository.count();
    return {userList, total};
};

export const isAdmin = async (openId: string) => {
    return openId === "o9eqR63E6wFQRAqUUcHs424HCNw4";
};


//google login
export const findUserByEmail = async (email: string): Promise<User | null> => {
    const userRepo = AppDataSource.getRepository(User); // 假設使用 UserDataSource
    const user = await userRepo.findOne({ where: { useraccount: email } });
    return user;
};
export const findUserById = async (id: string): Promise<User | null> => {
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id } });
    return user;
};


export const createUserFromGoogleProfile = async (profile: any): Promise<User> => {
    const userRepo = AppDataSource.getRepository(User);

    // 提取必要資訊，並做基本檢查
    const email = (profile.emails && profile.emails[0] && profile.emails[0].value) || "";
    const displayName = profile.displayName || email;
    const photo = (profile.photos && profile.photos[0] && profile.photos[0].value) || "";

    // 構造新用戶資料，這裡假設你已在 User 實體中加入了 googleId 欄位
    const newUser = userRepo.create({
        // id 可以由 @PrimaryGeneratedColumn 自動生成，也可以手動設置 uuid
        //id: uuidv4(),
        //googleId: profile.id,
        id: profile.id,
        useraccount: email,       // 以 email 作為帳號
        username: displayName,
        password: "GOOGLEID",             // Google 登入不需要密碼，可留空或設定特殊標記
        salt: "",
        avatar: photo,
        color: "",                // 如有預設顏色可設定
        online: false,
        isAdmin: false,
    }); 
    return await userRepo.save(newUser);
};