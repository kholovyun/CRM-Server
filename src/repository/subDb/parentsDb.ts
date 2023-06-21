import { StatusCodes } from "http-status-codes";
import IParentGetDto from "../../interfaces/IParent/IParentGetDto";
import IResponse from "../../interfaces/IResponse";
import { Parent } from "../../models/Parent";
import { User } from "../../models/User";
import { Subscription } from "../../models/Subscription";
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

    public getParentByUserId = async (userId: string, parentUserId: string): Promise<IResponse<IParent | IError>> => {
        try {
            const foundUser: IUser | null = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.NOT_AUTHORIZED);
            const parent: Parent | null = await Parent.findOne({
                where: {userId: parentUserId},
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
            if (!parent) throw new Error(EErrorMessages.PARENT_NOT_FOUND);
            const iParrent: IParent = {
                id: parent.id,
                userId: parent.userId,
                doctorId: parent.doctorId,
                registerDate: parent.registerDate,
                isActive: parent.isActive,
                users: {
                    id: parent.users.id,
                    email: parent.users.email,
                    isBlocked: parent.users.isBlocked,
                    name: parent.users.name,
                    surname: parent.users.surname,
                    patronim: parent.users.patronim,
                    phone: parent.users.phone,
                    role: parent.users.role,
                    subscriptions: [{ endDate: `${parent.users.subscriptions[0].endDate}`}]
                },
                doctors: {
                    id: parent.doctors.id,
                    userId: parent.doctors.userId,
                    photo: parent.doctors.photo,
                    speciality: parent.doctors.speciality,
                    placeOfWork: parent.doctors.placeOfWork,
                    experience: parent.doctors.experience,
                    isActive: parent.doctors.isActive,
                    price: `${parent.doctors.price}`,
                    achievements: parent.doctors.achievements,
                    degree: parent.doctors.degree,
                    users: parent.doctors.users
                },
                children: parent.children
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