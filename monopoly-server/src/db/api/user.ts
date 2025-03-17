import {User} from "../entities/user/user";
import { AppDataSource, UserDataSource } from "../dbConnecter";

// 獲取用戶列表（分頁查詢）
export const getUserList = async (page: number, size: number) => {
    //const userRepo = AppDataSource.getRepository(User);
    const userRepo = UserDataSource.getRepository(User);
    const [userList, total] = await userRepo.findAndCount({
        skip: (page - 1) * size,
        take: size,
        order: { username: "ASC" },
    });
    return { userList, total };
};

// 根據ID獲取用戶資訊
export const getUserById = async (id: string) => {
    //const userRepo = AppDataSource.getRepository(User);
    const userRepo = UserDataSource.getRepository(User);
    return await userRepo.findOneBy({ id });
};

//創建用戶
export const createUser = async (
    useraccount: string,
    username: string,
    password: string,
    avatar: string,
    color: string
) => {
    const user = await UserDataSource.manager.findOneBy(User
        , { useraccount });
    if (user) throw new Error("用戶已存在");

    const userToCreate = new User();
    userToCreate.useraccount = useraccount;
    userToCreate.username = username;
    userToCreate.password = password;
    userToCreate.avatar = avatar;
    userToCreate.color = color; // || randomColor();
    
    return await UserDataSource.manager.save(userToCreate);
};

// 刪除用戶
export const deleteUser = async (id: string) => {
    //const userRepo = AppDataSource.getRepository(User);
    const userRepo = UserDataSource.getRepository(User);
    const user = await userRepo.findOne({
        where: {id},
    });
    if (user) {
        return userRepo.remove(user);
    } else {
        throw new Error("用戶不存在");
    }
};