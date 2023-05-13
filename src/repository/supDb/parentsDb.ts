import { StatusCodes } from "http-status-codes";
import IParentGetDto from "../../interfaces/IParent/IParentGetDto";
import IResponse from "../../interfaces/IResponse";
import { Parent } from "../../models/Parent";
import { User } from "../../models/User";
import { Subscription } from "../../models/Subscription";
import { ERoles } from "../../enums/ERoles";
import IParentCreateDto from "../../interfaces/IParent/IParentCreateDto";
import IError from "../../interfaces/IError";


export class ParentsDb {
    public getParents = async (userId: string, offset: string, limit: string): Promise<IResponse<IParentGetDto[] | IError>> => {
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

    public getParentById = async (userId: string, id: string): Promise<IResponse<IParentGetDto | IError>> => {
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
                    result: { 
                        status: "error",
                        message: error.message
                    }
                };
            } else if (error.message === "Родитель пациента не найден.") {
                return {
                    status: StatusCodes.NOT_FOUND,
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

    public createParent = async (userId: string, parent: IParentCreateDto): Promise<IResponse<IParentGetDto | IError>> => {
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
                    result: { 
                        status: "error",
                        message: error.message
                    }
                };
            } else {
                return {
                    status: StatusCodes.BAD_REQUEST,
                    result: { 
                        status: "error",
                        message: error.message
                    }
                };
            }
        }
    };

    public activateParent = async (userId: string, parentId: string): Promise<IResponse<IParentGetDto | IError>> => {
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
                    result: { 
                        status: "error",
                        message: error.message
                    }
                };
            } else if (error.message === "Родитель не найден.") {
                return {
                    status: StatusCodes.NOT_FOUND,
                    result: { 
                        status: "error",
                        message: error.message
                    }
                };
            } else {
                return {
                    status: StatusCodes.BAD_REQUEST,
                    result: { 
                        status: "error",
                        message: error.message
                    }
                };
            }
        }
    };

}

export const parentsDb = new ParentsDb();