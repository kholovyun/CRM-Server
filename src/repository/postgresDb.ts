import dotenv from "dotenv";
import path from "path";
import { Sequelize } from "sequelize-typescript";
import IResponse from "../interfaces/IResponse";
import IUserGetDtoWithToken from "../interfaces/IUser/IUserGetDtoWithToken";
import IUserCreateDto from "../interfaces/IUser/IUserCreateDto";
import { User } from "../models/User";
import { generateJWT } from "../helpers/generateJWT";
import IUserLoginDto from "../interfaces/IUser/IUserLoginDto";
import { ReasonPhrases, StatusCodes } from "http-status-codes";
import { checkPassword } from "../helpers/checkPassword";
import IUserGetDto from "../interfaces/IUser/IUserGetDto";
import { generateHash } from "../helpers/generateHash";
import shortid from "shortid";
import IDoctorGetDto from "../interfaces/IDoctor/IDoctorGetDto";
import { ERoles } from "../enums/ERoles";
import { Doctor } from "../models/Doctor";
import IDoctorCreateDto from "../interfaces/IDoctor/IDoctorCreateDto";
import IDoctorUpdateDto from "../interfaces/IDoctor/IDoctorUpdateDto";
import Logger from "../lib/logger";
import jwt from "jsonwebtoken";
import ISetPasswordData from "../interfaces/ISetPasswordData";
import { IEmailFromTokem } from "../interfaces/IEmailFromTokem";
import IParentGetDto from "../interfaces/IParent/IParentGetDto";
import { Parent } from "../models/Parent";
import { Subscription } from "../models/Subscription";
import IParentCreateDto from "../interfaces/IParent/IParentCreateDto";
import sendMail from "../lib/mailer";
import { IMessage } from "../interfaces/IMessage";
import { Diploma } from "../models/Diploma";
import IDiplomaCreateDto from "../interfaces/IDiploma/IDiplomaCreateDto";
import IDiplomaGetDto from "../interfaces/IDiploma/IDiplomaGetDto";

dotenv.config();

export class PostgresDB {

    private sequelize: Sequelize;

    constructor() {
        this.sequelize = new Sequelize({
            database: process.env.PG_DB,
            dialect: "postgres",
            host: process.env.PG_HOST,
            username: process.env.PG_USER,
            password: process.env.PG_PASS,
            storage: ":memory",
            models: [path.join(__dirname, "../models")]
        });
    }

    public getSequelize = (): Sequelize => {
        return this.sequelize;
    };

    public close = async (): Promise<void> => {
        await this.sequelize.close();
    };

    public init = async (): Promise<void> => {
        try {
            await this.sequelize.authenticate();
            await this.sequelize.sync({
                alter: true
            });
            Logger.info("DB postgres is connected");
        } catch (err: unknown) {
            const error = err as Error;
            Logger.error(error.message);
        }
    };

    // ПОЛЬЗОВАТЕЛИ
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

    // Врачи (DOCTORS)
    public getDoctors = async (userId: string, offset: string, limit: string): Promise<IResponse<IDoctorGetDto[] | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error("У Вас нет прав доступа.");
            const foundDoctors = await Doctor.findAll({
                include: {
                    model: User,
                    as: "users",
                    attributes: ["name", "patronim", "surname", "email", "phone", "isBlocked"]
                },
                order: [
                    [{ model: User, as: "users" }, "surname", "ASC"]
                ],
                raw: true,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            return {
                status: StatusCodes.OK,
                result: foundDoctors
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

    public getDoctorById = async (userId: string, id: string): Promise<IResponse<IDoctorGetDto | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error("Вы не идентифицированы.");
            const doctor: IDoctorGetDto | null = await Doctor.findByPk(id,
                {
                    include: {
                        model: User,
                        as: "users",
                        attributes: ["name", "patronim", "surname", "email", "phone"]
                    }
                });
            if (!doctor) throw new Error("Врач не найден.");
            if (foundUser.role === ERoles.ADMIN || String(foundUser.id) === String(doctor.userId)) {
                return {
                    status: StatusCodes.OK,
                    result: doctor
                };
            }
            if (!doctor.isActive) throw new Error("Врач не найден.");
            const doctorForParent: IDoctorGetDto | null = await Doctor.findByPk(id,
                {
                    include: {
                        model: User,
                        as: "users",
                        attributes: ["name", "patronim", "surname"]
                    }
                });
            if (!doctorForParent) throw new Error("Врач не найден.");
            return {
                status: StatusCodes.OK,
                result: doctorForParent
            };
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message === "Вы не идентифицированы.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else if (error.message === "Врач не найден.") {
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

    public createDoctor = async (userId: string, doctor: IDoctorCreateDto): Promise<IResponse<IDoctorGetDto | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error("У Вас нет прав доступа.");
            const exsistedDoctor = await Doctor.findOne({
                where: {
                    userId: doctor.userId
                }
            });
            if (exsistedDoctor) throw new Error("Таблица врач для этого пользователя уже создана.");
            if (doctor.photo === "") {
                doctor.photo = "default_doctor_photo.jpg";
            }
            const newDoctor: IDoctorGetDto = await Doctor.create({ ...doctor });
            return {
                status: StatusCodes.CREATED,
                result: newDoctor
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
                    status: StatusCodes.BAD_REQUEST,
                    result: error.message
                };
            }
        }
    };

    public editDoctor = async (userId: string, searchId: string, doctor: IDoctorUpdateDto): Promise<IResponse<IDoctorGetDto | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error("У Вас нет прав доступа.");
            const foundDoctor: IDoctorGetDto | null = await Doctor.findByPk(searchId);
            if (!foundDoctor) throw new Error("Врач не найден.");
            if (foundUser.role === ERoles.DOCTOR && String(foundUser.id) !== String(foundDoctor.userId)) {
                throw new Error("У Вас нет прав доступа.");
            }
            if (doctor.photo === "") {
                doctor.photo = "default_doctor_photo.jpg";
            }
            const updatedDoctor = await Doctor.update(
                { ...doctor },
                {
                    where: { id: foundDoctor.id },
                    returning: true
                }).then((result) => { return result[1][0]; });
            return {
                status: StatusCodes.OK,
                result: updatedDoctor
            };
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else if (error.message === "Врач не найден.") {
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

    public activateDoctor = async (userId: string, doctorId: string): Promise<IResponse<IDoctorGetDto | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) 
                throw new Error("У Вас нет прав доступа.");
            const foundDoctor: IDoctorGetDto | null = await Doctor.findByPk(doctorId);
            if (!foundDoctor) throw new Error("Врач не найден.");
            const updatedDoctor = await Doctor.update(
                { isActive: foundDoctor.isActive ? false : true},
                { 
                    where: {id: foundDoctor.id },
                    returning: true 
                }).then((result) => { return result[1][0]; });
            return {
                status: StatusCodes.OK,
                result: updatedDoctor
            };
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else if (error.message === "Врач не найден.") {
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

    // В ТЗ Пациенты/ у нас Родители (PARENTS)
    public getParents = async (userId: string, offset: string, limit: string): Promise<IResponse<IParentGetDto[] | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error("У Вас нет прав доступа.");
            const foundParents = await Parent.findAll({
                include: {
                    model: User,
                    as: "users",
                    attributes: ["name", "patronim", "surname", "email", "phone", "isBlocked"]
                },
                order: [
                    [{ model: User, as: "users" }, "surname", "ASC"]
                ],
                raw: true,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            return {
                status: StatusCodes.OK,
                result: foundParents
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

    public getParentById = async (userId: string, id: string): Promise<IResponse<IParentGetDto | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error("Вы не идентифицированы.");
            const parent: IParentGetDto | null = await Parent.findByPk(id,
                {
                    include: [{
                        model: User,
                        as: "users",
                        attributes: ["name", "patronim", "surname", "phone"],
                        include: [{
                            model: Subscription,
                            as: "subscriptions",
                            attributes: ["end_date"]
                        }]
                    }]
                });
            if (!parent) throw new Error("Родитель пациента не найден.");
            if (foundUser.role === ERoles.ADMIN || foundUser.role === ERoles.SUPERADMIN) {
                return {
                    status: StatusCodes.OK,
                    result: parent
                };
            }
            if (foundUser.role === ERoles.DOCTOR && String(foundUser.id) !== String(parent.doctorId) || 
                String(foundUser.id) !== String(parent.userId)) 
                throw new Error("У Вас нет прав доступа.");
            return {
                status: StatusCodes.OK,
                result: parent
            };
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message === "Вы не идентифицированы." || error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else if (error.message === "Родитель пациента не найден.") {
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

    public createParent = async (userId: string, parent: IParentCreateDto): Promise<IResponse<IParentGetDto | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error("У Вас нет прав доступа.");
            const exsistedParent = await Parent.findOne({
                where: {
                    userId: parent.userId
                }
            });
            if (exsistedParent) throw new Error("Таблица «Родитель» для этого пользователя уже создана.");
            const newParent: IParentGetDto = await Parent.create({ ...parent });
            await Subscription.create({
                userId: newParent.userId
            });
            return {
                status: StatusCodes.CREATED,
                result: newParent
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
                    status: StatusCodes.BAD_REQUEST,
                    result: error.message
                };
            }
        }
    };

    public activateParent = async (userId: string, parentId: string): Promise<IResponse<IParentGetDto | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) 
                throw new Error("У Вас нет прав доступа.");
            const foundParent: IParentGetDto | null = await Parent.findByPk(parentId);
            if (!foundParent) throw new Error("Родитель не найден.");
            const updatedParent: IParentGetDto = await Parent.update(
                { isActive: foundParent.isActive ? false : true},
                { 
                    where: {id: foundParent.id },
                    returning: true 
                }).then((result) => { return result[1][0]; });
            return {
                status: StatusCodes.OK,
                result: updatedParent
            };
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else if (error.message === "Родитель не найден.") {
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

    //Дипломы (Diplomas)
    public getDiplomasByDoctor = async (userId: string, doctorId: string): Promise<IResponse<IDiplomaGetDto[] | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error("У Вас нет прав доступа.");
            
            const foundDoctor = await Doctor.findByPk(doctorId);
            if (!foundDoctor) throw new Error("Врач, чьи дипломы Вы запрашиваете не найден.");
            
            if (foundUser.role === ERoles.DOCTOR && String(foundUser.id) !== String(foundDoctor.userId))
                throw new Error("У Вас нет прав доступа.");
            if (foundUser.role === ERoles.PARENT) {
                const foundParent = await Parent.findOne({
                    where: {userId: foundUser.id, doctorId: doctorId}
                });
                if(!foundParent) throw new Error("У Вас нет прав доступа.");
            }
            const diplomas = await Diploma.findAll({
                where: {doctorId: doctorId},
                raw: true
            });            
            return {
                status: StatusCodes.OK,
                result: diplomas
            };
        } catch(err: unknown) {
            const error = err as Error;
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else if (error.message === "Врач, чьи дипломы Вы запрашиваете не найден.") {
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

    public createDiploma = async (userId: string, diploma: IDiplomaCreateDto) => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error("У Вас нет прав доступа.");

            if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctor = await Doctor.findOne({
                    where: {userId: foundUser.id}
                });
                if (!foundDoctor || diploma.doctorId !== foundDoctor.id ) 
                    throw new Error("У Вас нет прав доступа.");
            }

            if (diploma.url === "") throw new Error("Изображение обязательно.");

            const newDiploma: IDiplomaGetDto = await Diploma.create({...diploma});
            return {
                status: StatusCodes.OK,
                result: newDiploma
            };
        } catch(err: unknown) {
            const error = err as Error;
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
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

    public deleteDiploma = async (userId: string, diplomaId: string) => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error("У Вас нет прав доступа.");
            
            const diploma = await Diploma.findByPk(diplomaId);
            if (!diploma) throw new Error("Диплом не найден.");

            if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctor = await Doctor.findOne({
                    where: {userId: foundUser.id}
                });
                if (!foundDoctor || diploma.doctorId !== foundDoctor.id ) 
                    throw new Error("У Вас нет прав доступа.");
            }
            
            await Diploma.destroy({where: {id: diplomaId}});
            return {
                status: StatusCodes.OK,
                result: "Диплом удален!"
            };
        } catch(err: unknown) {
            const error = err as Error;
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else if (error.message === "Диплом не найден.") {
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
}

export const postgresDB = new PostgresDB();