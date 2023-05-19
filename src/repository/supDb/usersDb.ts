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
import IError from "../../interfaces/IError";
import { passwordValidation } from "../../helpers/passwordValidation";
import { EErrorMessages } from "../../enums/EErrorMessages";
import { errorCodesMathcher } from "../../helpers/errorCodeMatcher";

export class UsersDb {
    public getUsers = async (userId: string): Promise<IResponse<IUserGetDto[] | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error(EErrorMessages.NO_ACCESS);
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
                    result: {
                        status: "error",
                        message: error.message
                    }
                };
            } else {
                return {
                    status: StatusCodes.INTERNAL_SERVER_ERROR,
                    result: {
                        status: "error",
                        message: error.message
                    }
                };
            }
        }
    };

    public getUserByid = async (seekerId: string, userId: string): Promise<IResponse<IUserGetDto | IError>> => {
        try {
            const foundSeeker = await User.findByPk(seekerId);
            if (!foundSeeker || foundSeeker.isBlocked && foundSeeker.role !== ERoles.PARENT)
                throw new Error();
            if (foundSeeker.role === ERoles.PARENT) {
                const foundParent = await Parent.findOne({ where: { userId: foundSeeker.id } });
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
            const status = errorCodesMathcher[error.message] || StatusCodes.INTERNAL_SERVER_ERROR;
            return {
                status,
                result: {
                    status: "error",
                    message: error.message
                }
            };
        }
    };

    public register = async (userDto: IUserCreateDto): Promise<IResponse<IUserGetDtoWithToken | IError>> => {
        try {
            const userExists = await User.findOne({
                where: {
                    email: userDto.email
                }
            });
            if (userExists) throw new Error(EErrorMessages.USER_ALREADY_EXISTS);
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const email: IEmailFromTokem = { email: userDto.email };
            if (!emailRegex.test(userDto.email)) {
                throw new Error(EErrorMessages.WRONG_MAIL_FOTMAT);
            }

            const primaryPassword: string = shortid.generate();
            // НИЖНЯЯ СТРОКА ПОЗВОЛЯЕТ УВИДЕТЬ ПАРОЛЬ В КОНСОЛИ. ВРЕМЕННО(ПОТОМ УДАЛИМ)
            console.log("АВТОМАТИЧЕСКИЙ СГЕНЕРИРОВАННЫЙ ПАРОЛЬ: " + primaryPassword);
            const user = await User.create({ ...userDto, password: await generateHash(primaryPassword) });
            const token = jwt.sign(email, `${process.env.MAIL_KEY}`, { expiresIn: "24h" });
            const url = `http://localhost:5173/reset-password?token=${token}`;
            await sendMail({ link: url, recipient: email.email, theme: "Регистрация" });
            if (user.role === ERoles.DOCTOR) {
                const newDoctor: IDoctorCreateDto = {
                    userId: user.id,
                    speciality: "-",
                    experience: 0,
                    placeOfWork: "-",
                    photo: "default-photo.svg",
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
                result: {
                    status: "error",
                    message: error.message
                }
            };
        }
    };

    public login = async (userDto: IUserLoginDto): Promise<IResponse<IUserGetDtoWithToken | IError>> => {
        try {
            const foundUser = await User.findOne({ where: { email: userDto.email } });

            if (!foundUser) throw new Error(EErrorMessages.USER_NOT_FOUND);

            const isMatch: boolean = await checkPassword(userDto.password, foundUser);
            if (!isMatch) throw new Error(EErrorMessages.WRONG_PASSWORD);
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
            const status = errorCodesMathcher[error.message] || StatusCodes.BAD_REQUEST;
            return {
                status,
                result: {
                    status: "error",
                    message: error.message
                }
            };
        }
    };

    public editUser = async (userDto: IUserCreateDto & { password?: string }, userId: string): Promise<IResponse<IUserGetDto | IError>> => {
        try {
            if (userDto.password) {
                passwordValidation(userDto.password);
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
                result: {
                    status: "error",
                    message: error.message
                }
            };
        }
    };

    public setPassword = async (data: ISetPasswordData): Promise<IResponse<IMessage>> => {
        try {
            const dataFromToken = jwt.verify(data.token, `${process.env.MAIL_KEY}`) as IEmailFromTokem;
            if (!dataFromToken) throw new Error(ReasonPhrases.UNAUTHORIZED);
            passwordValidation(data.password);
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

    public blockUser = async (adminId: string, userId: string): Promise<IResponse<IUserGetDto | IError>> => {
        try {
            const foundAdmin = await User.findByPk(adminId);
            if (!foundAdmin || foundAdmin.isBlocked)
                throw new Error(EErrorMessages.NO_ACCESS);
            const foundUser: IUserGetDto | null = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.USER_NOT_FOUND_BY_ID);
            if (foundUser.role === ERoles.SUPERADMIN) throw new Error(EErrorMessages.SUPERADMIN_CANT_BE_DELETED);
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
            const status = errorCodesMathcher[error.message] || StatusCodes.BAD_REQUEST;
            return {
                status,
                result: {
                    status: "error",
                    message: error.message
                }
            };
        }
    };
}

export const usersDb = new UsersDb();

