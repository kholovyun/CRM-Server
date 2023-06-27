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
import  { Op } from "sequelize";
import IChildCreateDto from "../../interfaces/IChild/IChildCreateDto";
import { Child } from "../../models/Child";
import IChildGetDto from "../../interfaces/IChild/IChildGetDto";
import { NewbornData } from "../../models/NewbornData";
import IUserUpdateDto from "../../interfaces/IUser/IUserUpdateDto";
import IUserCreateParentWithChildDto from "../../interfaces/IUser/IUserCreateParentWithChildDto";
import { Subscription } from "../../models/Subscription";
import { EPaymentType } from "../../enums/EPaymentType";

export class UsersDb {
    public getUsers = async (userId: string, offset: string, limit: string, filter?: string ): 
        Promise<IResponse<{rows: IUserGetDto[], count: number} | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error(EErrorMessages.NO_ACCESS);
            let foundUsers: {rows: IUserGetDto[], count: number} = {
                rows: [],
                count: 0
            };
            if (filter && filter === "admins") {
                foundUsers = await User.findAndCountAll({ 
                    where: {
                        role: {
                            [Op.or]: [ERoles.ADMIN, ERoles.SUPERADMIN]
                        }
                    },
                    order: [
                        ["surname", "ASC"],
                        ["name", "ASC"]
                    ],
                    limit: parseInt(limit),
                    offset: parseInt(offset) 
                });
            } else {
                foundUsers = await User.findAndCountAll({
                    order: [
                        ["surname", "ASC"],
                        ["name", "ASC"]
                    ], 
                    limit: parseInt(limit),
                    offset: parseInt(offset) 
                });
            }            
            return {
                status: StatusCodes.OK,
                result: foundUsers
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

    public getUserByid = async (seekerId: string, userId: string): Promise<IResponse<IUserGetDto | IError>> => {
        try {
            const foundSeeker = await User.findByPk(seekerId);
            if (!foundSeeker || foundSeeker.isBlocked && foundSeeker.role !== ERoles.PARENT)
                throw new Error();
            if (foundSeeker.role === ERoles.PARENT) {
                const foundParent = await Parent.findOne({ where: { userId: foundSeeker.id } });
                if (!foundParent || foundParent.userId !== userId)
                    throw new Error(EErrorMessages.NO_ACCESS);
            }
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.USER_NOT_FOUND);
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

    public register = async (userDto: IUserCreateDto): Promise<IResponse<IUserGetDto | IError>> => {
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
                throw new Error(EErrorMessages.WRONG_MAIL_FORMAT);
            }

            const primaryPassword: string = shortid.generate();
            // НИЖНЯЯ СТРОКА ПОЗВОЛЯЕТ УВИДЕТЬ ПАРОЛЬ В КОНСОЛИ. ВРЕМЕННО(ПОТОМ УДАЛИМ)
            console.log("АВТОМАТИЧЕСКИЙ СГЕНЕРИРОВАННЫЙ ПАРОЛЬ: " + primaryPassword);
            // const user = await User.create({ ...userDto, password: await generateHash(primaryPassword) });
            const user = await User.create({ ...userDto, password: "123"});
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
                    price: userDto.price ? userDto.price : 5000
                };
                await Doctor.create({ ...newDoctor });
            }
            // delete user.dataValues.password;
            return {
                status: StatusCodes.CREATED,
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

    public registerParent = async (userDto: IUserCreateParentWithChildDto, userId: string): Promise<IResponse<IUserGetDto | IError>> => {
        try {
            if (userDto.role !== ERoles.PARENT) 
                throw new Error(EErrorMessages.NO_ACCESS);
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error(EErrorMessages.NO_ACCESS);
            const doctor = await Doctor.findOne({
                where: {
                    userId: userId
                }
            }); 
            if (doctor && foundUser.role === ERoles.DOCTOR && doctor.id !== userDto.doctorId)
                throw new Error(EErrorMessages.NO_ACCESS);
            const foundDoctor = await Doctor.findByPk(userDto.doctorId);
            if (!foundDoctor) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);
                
            const userExists = await User.findOne({
                where: {
                    email: userDto.email
                }
            });
            if (userExists) throw new Error(EErrorMessages.USER_ALREADY_EXISTS);
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const email: IEmailFromTokem = { email: userDto.email };
            if (!emailRegex.test(userDto.email)) {
                throw new Error(EErrorMessages.WRONG_MAIL_FORMAT);
            }
            const primaryPassword: string = shortid.generate();
            // НИЖНЯЯ СТРОКА ПОЗВОЛЯЕТ УВИДЕТЬ ПАРОЛЬ В КОНСОЛИ. ВРЕМЕННО(ПОТОМ УДАЛИМ)
            console.log("АВТОМАТИЧЕСКИЙ СГЕНЕРИРОВАННЫЙ ПАРОЛЬ: " + primaryPassword);
            const user = await User.create({ ...userDto, password: await generateHash(primaryPassword) });
            const token = jwt.sign(email, `${process.env.MAIL_KEY}`, { expiresIn: "24h" });
            const url = `http://localhost:5173/reset-password?token=${token}`;
            await sendMail({ link: url, recipient: email.email, theme: "Регистрация" });
            const now = new Date();
            const newParent = {
                userId: user.id,
                doctorId: userDto.doctorId,
                subscriptionEndDate: new Date(now.setMonth(now.getMonth() + userDto.subscrType))
            };
            const parentUser = await Parent.create({ ...newParent });
            let sum;
            switch (userDto.subscrType) {
            case 1:
                sum = foundDoctor.price;
                break;
            case 6:
                sum = Math.floor((foundDoctor.price * 6 - (foundDoctor.price * 6) * 15/100) / 1000) * 1000;
                break;
            case 12:
                sum = Math.floor((foundDoctor.price * 12 - (foundDoctor.price * 12) * 35/100) / 1000) * 1000;
                break;
            }
            await Subscription.create({
                userId: user.id,
                payedBy: userDto.paymentType === EPaymentType.CASH ? foundDoctor.userId : parentUser.userId,
                type: userDto.subscrType,
                paymentType: userDto.paymentType,
                endDate: new Date(now.setMonth(now.getMonth() + userDto.subscrType)),
                sum: sum
            });
            const child: IChildCreateDto = {
                parentId: parentUser.id,
                photo: "default_child_photo.svg",
                name: userDto.child.name,
                surname: userDto.child.surname,
                patronim: userDto.child.patronim ? userDto.child.patronim : "",
                dateOfBirth: userDto.child.dateOfBirth,
                sex: userDto.child.sex,
                height: userDto.child.height,
                weight: userDto.child.weight
            };
            const createdChild: IChildGetDto = await Child.create({...child});
            const newbornData = {
                childId: createdChild.id
            };

            await NewbornData.create({...newbornData});
            delete user.dataValues.password;
            return {
                status: StatusCodes.CREATED,
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

    public login = async (userDto: IUserLoginDto): Promise<IResponse<IUserGetDtoWithToken | IError>> => {
        try {
            const foundUser = await User.findOne({ where: { email: userDto.email } });

            if (!foundUser) throw new Error(EErrorMessages.WRONG_PASS_OR_EMAIL);

            const isMatch: boolean = await checkPassword(userDto.password, foundUser);

            if (!isMatch) throw new Error(EErrorMessages.WRONG_PASS_OR_EMAIL);
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

    public editUser = async (editorId: string, userId: string, userDto: IUserUpdateDto, ): Promise<IResponse<IUserGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(editorId);
            const editingUser = await User.findByPk(userId);
            if (!editingUser) throw new Error(EErrorMessages.USER_NOT_FOUND);

            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);

            if (foundUser.role !== ERoles.SUPERADMIN && 
                foundUser.role !== ERoles.ADMIN && foundUser.id !== userId) throw new Error(EErrorMessages.NO_ACCESS);
            
            if (foundUser.role === ERoles.ADMIN && editingUser.role === ERoles.ADMIN && foundUser.id !== editingUser.id) 
                throw new Error(EErrorMessages.NO_ACCESS);

            if (foundUser.role === ERoles.ADMIN && editingUser.role === ERoles.SUPERADMIN) throw new Error(EErrorMessages.NO_ACCESS);

            const fieldsToExclude = ["id", "password", "email", "role", "isBlocked"];    
            const myFields = Object.keys(userDto).filter(field => !fieldsToExclude.includes(field));

            const user = await User.update(userDto, { where: { id: userId }, fields: myFields, returning: true }).then((result) => {
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
            if (foundUser.role === ERoles.SUPERADMIN) throw new Error(EErrorMessages.SUPERADMIN_CANT_BE_BLOCKED);
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