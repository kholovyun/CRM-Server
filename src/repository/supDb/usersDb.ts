import { ReasonPhrases, StatusCodes } from "http-status-codes";
import IResponse from "../../interfaces/IResponse";
import IUserGetDto from "../../interfaces/IUser/IUserGetDto";
import { User } from "../../models/User";
import { ERoles } from "../../enums/ERoles";
import { Parent } from "../../models/Parent";
import IUserCreateDto from "../../interfaces/IUser/IUserCreateDto";
import IUserGetDtoWithToken from "../../interfaces/IUser/IUserGetDtoWithToken";
import shortid from "shortid";
import { generateHash } from "../../helpers/generateHash";
import jwt from "jsonwebtoken";
import IDoctorCreateDto from "../../interfaces/IDoctor/IDoctorCreateDto";
import sendMail from "../../lib/mailer";
import { Doctor } from "../../models/Doctor";
import { generateJWT } from "../../helpers/generateJWT";
import IUserLoginDto from "../../interfaces/IUser/IUserLoginDto";
import { IMessage } from "../../interfaces/IMessage";
import { checkPassword } from "../../helpers/checkPassword";
import ISetPasswordData from "../../interfaces/ISetPasswordData";
import { IEmailFromTokem } from "../../interfaces/IEmailFromTokem";

export class UsersDb {
    public getUsers = async (userId: string): Promise<IResponse<IUserGetDto[] | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error("У Вас нет прав доступа.");
            const foundUsers = await User.findAll({ raw: true });
            return {
                status: StatusCodes.OK,
                result: foundUsers
            };
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else {
                return {
                    status: StatusCodes.INTERNAL_SERVER_ERROR,
                    result: error.message
                };
            }
        }
    };

    public getUserByid = async (seekerId: string, userId: string): Promise<IResponse<IUserGetDto | string>> => {
        try {
            const foundSeeker = await User.findByPk(seekerId);
            if (!foundSeeker || foundSeeker.isBlocked && foundSeeker.role !== ERoles.PARENT)
                throw new Error("У Вас нет прав доступа.");
            if (foundSeeker.role === ERoles.PARENT) {
                const foundParent = await Parent.findOne({where: {userId: foundSeeker.id}});
                if (!foundParent || foundParent.userId !== userId)
                    throw new Error("У Вас нет прав доступа.");
            }
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error("Пользователь не найден.");
            return {
                status: StatusCodes.OK,
                result: foundUser
            };
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else if (error.message === "Пользователь не найден.") {
                return {
                    status: StatusCodes.NOT_FOUND,
                    result: error.message
                };
            } else {
                return {
                    status: StatusCodes.INTERNAL_SERVER_ERROR,
                    result: error.message
                };
            }
        }
    };

    public register = async (userDto: IUserCreateDto): Promise<IResponse<IUserGetDtoWithToken | string>> => {
        try {
            const userExists = await User.findOne({
                where: {
                    email: userDto.email
                }
            });
            if (userExists) throw new Error("Пользователь с таким email уже зарегистрирован.");

            const primaryPassword: string = shortid.generate();
            // НИЖНЯЯ СТРОКА ПОЗВОЛЯЕТ УВИДЕТЬ ПАРОЛЬ В КОНСОЛИ. ВРЕМЕННО(ПОТОМ УДАЛИМ)
            console.log("АВТОМАТИЧЕСКИЙ СГЕНЕРИРОВАННЫЙ ПАРОЛЬ: " + primaryPassword);
            const user = await User.create({ ...userDto, password: await generateHash(primaryPassword) });
            const email = { email: userDto.email };
            const token = jwt.sign(email, `${process.env.MAIL_KEY}`, { expiresIn: "24h" });
            const url = `http://localhost:5173/reset-password?token=${token}`;
            await sendMail(url, email);
            if (user.role === ERoles.DOCTOR) {
                const newDoctor: IDoctorCreateDto = {
                    userId: user.id,
                    speciality: "-",
                    experience: 0,
                    placeOfWork: "-",
                    photo: "default_doctor_photo.jpg",
                    isActive: true
                };
                await Doctor.create({ ...newDoctor });
            }
            delete user.dataValues.password;
            const userWithToken: IUserGetDtoWithToken = {
                ...user.dataValues,
                token: generateJWT({
                    id: user.dataValues.id,
                    email: user.dataValues.email,
                    role: user.dataValues.role
                })
            };

            return {
                status: StatusCodes.CREATED,
                result: userWithToken
            };
        } catch (err: unknown) {
            const error = err as Error;
            return {
                status: StatusCodes.BAD_REQUEST,
                result: error.message,
            };
        }
    };

    public login = async (userDto: IUserLoginDto): Promise<IResponse<IUserGetDtoWithToken | IMessage>> => {
        try {
            const foundUser = await User.findOne({ where: { email: userDto.email } });

            if (!foundUser) throw new Error("Пользователь не найден!");

            const isMatch: boolean = await checkPassword(userDto.password, foundUser);
            if (!isMatch) throw new Error("Пароли не совпадают!");
            const user = foundUser.dataValues;
            delete user.password;
            const userWithToken: IUserGetDtoWithToken = 
                { ...user, token: generateJWT({ id: user.id, email: user.email, role: user.role }) };

            return {
                status: StatusCodes.OK,
                result: userWithToken,
            };
        } catch (err: unknown) {
            const error = err as Error;
            return {
                status: StatusCodes.UNAUTHORIZED,
                result: { message: error.message },
            };
        }
    };

    public editUser = async (userDto: IUserCreateDto & { password?: string }, userId: string): Promise<IResponse<IUserGetDto | string>> => {
        try {
            if (userDto.password) {
                if (!userDto.password?.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*[^a-zA-Z0-9]).{6,10}$/)) 
                    throw new Error("Введён некорректный пароль.");
                userDto.password = await generateHash(userDto.password);
            }
            const user = await User.update(userDto, { where: { id: userId }, returning: true }).then((result) => {
                delete result[1][0].dataValues.password;
                return result[1][0];
            });

            return {
                status: StatusCodes.OK,
                result: user
            };
        } catch (err: unknown) {
            const error = err as Error;
            return {
                status: StatusCodes.BAD_REQUEST,
                result: error.message
            };
        }
    };

    public setPassword = async (data: ISetPasswordData): Promise<IResponse<IMessage>> => {
        try {
            const dataFromToken = jwt.verify(data.token, `${process.env.MAIL_KEY}`) as IEmailFromTokem;
            if (!dataFromToken) throw new Error(ReasonPhrases.UNAUTHORIZED);
            if (!data.password?.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*[^a-zA-Z0-9]).{6,10}$/)) 
                throw new Error("Введён некорректный пароль.");
            const foundUser = await User.findOne({ where: { email: dataFromToken.email } });
            const newPassword = await generateHash(data.password);
            await User.update({ password: newPassword }, { where: { id: foundUser?.dataValues.id }, returning: true });
            return {
                status: StatusCodes.OK,
                result: { message: "Пароль изменён." }
            };
        } catch (err: unknown) {
            const error = err as Error;
            return {
                status: StatusCodes.BAD_REQUEST,
                result: { message: error.message }
            };
        }
    };

    public blockUser = async (adminId: string, userId: string): Promise<IResponse<IUserGetDto | string>> => {
        try {
            const foundAdmin = await User.findByPk(adminId);
            if (!foundAdmin || foundAdmin.isBlocked)
                throw new Error("У Вас нет прав доступа.");
            const foundUser: IUserGetDto | null = await User.findByPk(userId);
            if (!foundUser) throw new Error("Пользователь с таким ID не найден.");
            if (foundUser.role === ERoles.SUPERADMIN) throw new Error("Супер админ не может быть удален.");
            const updatedUser = await User.update(
                { isBlocked: foundUser.isBlocked ? false : true },
                {
                    where: { id: foundUser.id },
                    returning: true
                }).then((result) => { return result[1][0]; });
            return {
                status: StatusCodes.OK,
                result: updatedUser
            };
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else if (error.message === "Пользователь с таким ID не найден.") {
                return {
                    status: StatusCodes.NOT_FOUND,
                    result: error.message
                };
            } else {
                return {
                    status: StatusCodes.BAD_REQUEST,
                    result: error.message
                };
            }
        }
    };
}

export const usersDb = new UsersDb();

