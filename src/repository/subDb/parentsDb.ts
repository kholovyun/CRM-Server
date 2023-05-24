import { StatusCodes } from "http-status-codes";
import IParentGetDto from "../../interfaces/IParent/IParentGetDto";
import IResponse from "../../interfaces/IResponse";
import { Parent } from "../../models/Parent";
import { User } from "../../models/User";
import { Subscription } from "../../models/Subscription";
import { ERoles } from "../../enums/ERoles";
import IParentCreateDto from "../../interfaces/IParent/IParentCreateDto";
import IError from "../../interfaces/IError";
import { EErrorMessages } from "../../enums/EErrorMessages";
import { errorCodesMathcher } from "../../helpers/errorCodeMatcher";


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
                    [{ model: User, as: "users" }, "surname", "ASC"]
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

    public createParent = async (userId: string, parent: IParentCreateDto): Promise<IResponse<IParentGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error(EErrorMessages.NO_ACCESS);
            const exsistedParent = await Parent.findOne({
                where: {
                    userId: parent.userId
                }
            });
            if (exsistedParent) throw new Error(EErrorMessages.PARENT_TABLE_ALREADY_EXISTS);
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
                }).then((result) => { return result[1][0]; });
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

}

export const parentsDb = new ParentsDb();