import { StatusCodes } from "http-status-codes";
import IParentGetDto from "../../interfaces/IParent/IParentGetDto";
import IResponse from "../../interfaces/IResponse";
import { Parent } from "../../models/Parent";
import { User } from "../../models/User";
import { Subscription } from "../../models/Subscription";
import { ERoles } from "../../enums/ERoles";
import IError from "../../interfaces/IError";
import { EErrorMessages } from "../../enums/EErrorMessages";
import { errorCodesMathcher } from "../../helpers/errorCodeMatcher";
import IUser from "../../interfaces/IUser/IUser";
import { Doctor } from "../../models/Doctor";
import { Child } from "../../models/Child";
import IParent from "../../interfaces/IParent/IParent";

export class ParentsDb {
    public getParents = async (userId: string, offset: string, limit: string): Promise<IResponse<IParentGetDto[] | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error(EErrorMessages.NO_ACCESS);
            const foundParents = await Parent.findAll({
                include: {
                    model: User,
                    as: "users",
                    attributes: ["name", "patronim", "surname", "email", "phone", "isBlocked"]
                },
                order: [
                    [{ model: User, as: "users" }, "surname", "ASC"],
                    [{ model: User, as: "users" }, "name", "ASC"]
                ],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            return {
                status: StatusCodes.OK,
                result: foundParents
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

    public getParentsByDoctorId = async (userId: string, offset: string, limit: string, doctorId: string): 
        Promise<IResponse<{rows: IParentGetDto[], count: number} | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error(EErrorMessages.NO_ACCESS);
            const foundDoctor = await Doctor.findByPk(doctorId);
            if (!foundDoctor) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);
            const foundParents = await Parent.findAndCountAll({
                where: { doctorId },
                include: {
                    model: User,
                    as: "users",
                    attributes: ["name", "patronim", "surname", "email", "phone", "isBlocked"]
                },
                order: [
                    [{ model: User, as: "users" }, "surname", "ASC"],
                    [{ model: User, as: "users" }, "name", "ASC"]
                ],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            return {
                status: StatusCodes.OK,
                result: foundParents
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

    public getParentById = async (userId: string, id: string): Promise<IResponse<IParentGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.NOT_AUTHORIZED);
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
            if (!parent) throw new Error(EErrorMessages.PARENT_NOT_FOUND);
            if (foundUser.role === ERoles.ADMIN || foundUser.role === ERoles.SUPERADMIN) {
                return {
                    status: StatusCodes.OK,
                    result: parent
                };
            }
            if (foundUser.role === ERoles.DOCTOR && String(foundUser.id) !== String(parent.doctorId) || 
                String(foundUser.id) !== String(parent.userId)) 
                throw new Error(EErrorMessages.NOT_AUTHORIZED);
            return {
                status: StatusCodes.OK,
                result: parent
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

    public activateParent = async (userId: string, parentId: string): Promise<IResponse<IParentGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) 
                throw new Error(EErrorMessages.NO_ACCESS);
            const foundParent: IParentGetDto | null = await Parent.findByPk(parentId);
            if (!foundParent) throw new Error(EErrorMessages.PARENT_NOT_FOUND);
            const updatedParent: IParentGetDto = await Parent.update(
                { isActive: foundParent.isActive ? false : true},
                { 
                    where: {id: foundParent.id },
                    returning: true 
                }).then((result) => { 
                return result[1][0];
            });
            return {
                status: StatusCodes.OK,
                result: updatedParent
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

    public getParentByUserId = async (userId: string, id: string): Promise<IResponse<IParent | IError>> => {
        try {
            const foundUser: IUser | null = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.NOT_AUTHORIZED);
            const parrent: Parent | null = await Parent.findOne({
                where: {userId: id},
                include: [
                    {
                        model: User,
                        attributes: { exclude: ["password"] },
                        include: [
                            {
                                model: Subscription,
                                as: "subscriptions",
                                order: [["endDate", "DESC"]],
                                limit: 1
                            }
                        ]
                    },
                    {
                        model: Doctor,
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ["password"] },
                            },
                        ],
                    },
                    {
                        model: Child,
                    },
                ],
            
            });
            if (!parrent) throw new Error(EErrorMessages.PARENT_NOT_FOUND);
            const iParrent: IParent = {
                id: parrent.id,
                userId: parrent.userId,
                doctorId: parrent.doctorId,
                registerDate: parrent.registerDate,
                isActive: parrent.isActive,
                users: {
                    id: parrent.users.id,
                    email: parrent.users.email,
                    isBlocked: parrent.users.isBlocked,
                    name: parrent.users.name,
                    surname: parrent.users.surname,
                    patronim: parrent.users.patronim,
                    phone: parrent.users.phone,
                    role: parrent.users.role,
                    subscriptions: [{ endDate: `${parrent.users.subscriptions[0].endDate}`}]
                },
                doctors: {
                    id: parrent.doctors.id,
                    userId: parrent.doctors.userId,
                    photo: parrent.doctors.photo,
                    speciality: parrent.doctors.speciality,
                    placeOfWork: parrent.doctors.placeOfWork,
                    experience: parrent.doctors.experience,
                    isActive: parrent.doctors.isActive,
                    price: `${parrent.doctors.price}`,
                    achievements: parrent.doctors.achievements,
                    degree: parrent.doctors.degree,
                    users: parrent.doctors.users
                },
                children: parrent.children
            };
            return {
                status: StatusCodes.OK,
                result: iParrent
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

    public getParentByParentId = async (userId: string, parrentId: string): Promise<IResponse<IParent | IError>> => {
        try {
            const foundUser: IUser | null = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.NOT_AUTHORIZED);
            const parrent: Parent | null = await Parent.findOne({
                where: {id: parrentId},
                include: [
                    {
                        model: User,
                        attributes: { exclude: ["password"] },
                        include: [
                            {
                                model: Subscription,
                                as: "subscriptions",
                                order: [["endDate", "DESC"]],
                                limit: 1
                            }
                        ]
                    },
                    {
                        model: Doctor,
                        include: [
                            {
                                model: User,
                                attributes: { exclude: ["password"] },
                            },
                        ],
                    },
                    {
                        model: Child,
                    },
                ],
            
            });
            if (!parrent) throw new Error(EErrorMessages.PARENT_NOT_FOUND);
            const iParrent: IParent = {
                id: parrent.id,
                userId: parrent.userId,
                doctorId: parrent.doctorId,
                registerDate: parrent.registerDate,
                isActive: parrent.isActive,
                users: {
                    id: parrent.users.id,
                    email: parrent.users.email,
                    isBlocked: parrent.users.isBlocked,
                    name: parrent.users.name,
                    surname: parrent.users.surname,
                    patronim: parrent.users.patronim,
                    phone: parrent.users.phone,
                    role: parrent.users.role,
                    subscriptions: [{ endDate: `${parrent.users.subscriptions[0].endDate}`}]
                },
                doctors: {
                    id: parrent.doctors.id,
                    userId: parrent.doctors.userId,
                    photo: parrent.doctors.photo,
                    speciality: parrent.doctors.speciality,
                    placeOfWork: parrent.doctors.placeOfWork,
                    experience: parrent.doctors.experience,
                    isActive: parrent.doctors.isActive,
                    price: `${parrent.doctors.price}`,
                    achievements: parrent.doctors.achievements,
                    degree: parrent.doctors.degree,
                    users: parrent.doctors.users
                },
                children: parrent.children
            };
            return {
                status: StatusCodes.OK,
                result: iParrent
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
}

export const parentsDb = new ParentsDb();