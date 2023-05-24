import { StatusCodes } from "http-status-codes";
import { Child } from "../../models/Child";
import IResponse from "../../interfaces/IResponse";
import IError from "../../interfaces/IError";
import IChildCreateDto from "../../interfaces/IChild/IChildCreateDto";
import IChildGetDto from "../../interfaces/IChild/IChildGetDto";
import { User } from "../../models/User";
import { EErrorMessages } from "../../enums/EErrorMessages";
import { ERoles } from "../../enums/ERoles";
import { errorCodesMathcher } from "../../helpers/errorCodeMatcher";
import { Parent } from "../../models/Parent";
import { Doctor } from "../../models/Doctor";
import Logger from "../../lib/logger";

export class ChildrenDb {
    public getChildrenByParentId = async (userId: string, parentId: string): Promise<IResponse<IChildGetDto[] | IError>> => {
        try {
            //check with no access 
            // middleware permisson in controller
            const children = await Child.findAll({
                where: { parentId: parentId },
                raw: true,
            });
            return {
                status: StatusCodes.OK,
                result: children,
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
    public getChildById = async (childId: string, userId: string): Promise<IResponse<IChildGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.NO_ACCESS);

            const child = await Child.findByPk(childId);
            if (!child) throw new Error(EErrorMessages.CHILD_NOT_FOUND);
            
            const foundParent = await Parent.findByPk(child.parentId);
            if (!foundParent) throw new Error(EErrorMessages.PARENT_NOT_FOUND);

            if (foundUser.role === ERoles.DOCTOR) {


                const foundDoctor = await Doctor.findOne({where: {userId: foundUser.id}});
                if (!foundDoctor) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);


                if (foundParent?.doctorId !== foundDoctor.id) {
                    throw new Error(EErrorMessages.NO_ACCESS);
                }
            }

            if (foundUser.role === ERoles.PARENT) {
                if (foundParent.id !== child.parentId) {
                    throw new Error(EErrorMessages.NO_ACCESS);
                }

            }

            if (foundUser.role === ERoles.ADMIN || foundUser.role === ERoles.SUPERADMIN ) {
                if (foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS); 
            }
            
            

            return {
                status: StatusCodes.OK,
                result: child,
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
    public createChild = async (child: IChildCreateDto, userId: string): Promise<IResponse<IChildCreateDto | IError>> => {
        try {
          
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.NO_ACCESS);
            if (foundUser.isBlocked && foundUser.role !== ERoles.PARENT) throw new Error(EErrorMessages.NO_ACCESS);

            if (foundUser.role === ERoles.PARENT) {
                const foundParent = await Parent.findOne({where: {user_id: userId}});
                if (foundParent?.userId !== userId) {
                    throw new Error(EErrorMessages.NO_ACCESS);
                }
            }

            if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctor = await Doctor.findOne({where: {user_id: userId}});
                const foundParent = await Parent.findOne({where: {id: child.parentId}});
                if (foundParent?.doctorId !== foundDoctor?.id) {
                    throw new Error(EErrorMessages.NO_ACCESS);
                }
            }
                

            const newChild = await Child.create({...child});
        
            return {
                status: StatusCodes.OK,
                result: newChild,
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
    public editChildById = async (
        childId: string,
        child: IChildGetDto,
        userId: string
    ): Promise<IResponse<IChildGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);
            

            const foundChild: IChildGetDto | null = await Child.findByPk(childId);
            
            if (!foundChild) throw new Error("Ребенок не найден.");

            const updatedChild = await Child.update(
                { ...child },
                { where: { id: foundChild.id }, returning: true }
            ).then((result) => {
                return result[1][0];
            });
            return {
                status: StatusCodes.OK,
                result: updatedChild,
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

export const childrenDb = new ChildrenDb();
