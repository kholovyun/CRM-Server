import { StatusCodes } from "http-status-codes";
import { Child } from "../../models/Child";
import IResponse from "../../interfaces/IResponse";
import IError from "../../interfaces/IError";

export class ChildrenDb {
    public getChildrenByParentId = async (parentId: string): Promise<IResponse<any | IError>> => {
        try {
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
            return {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                result: {
                    status: "error",
                    message: error.message,
                },
            };
        }
    };
    public getChildById = async (childId: string): Promise<IResponse<any | IError>> => {
        try {
            const child = await Child.findByPk(childId);
            return {
                status: StatusCodes.OK,
                result: child,
            };
        } catch (err: unknown) {
            const error = err as Error;
            return {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                result: {
                    status: "error",
                    message: error.message,
                },
            };
        }
    };
    public createChild = async (child: any): Promise<IResponse<any | IError>> => {
        try {
            const newChild = await Child.create(child);
            return {
                status: StatusCodes.OK,
                result: newChild,
            };
        } catch (err: unknown) {
            const error = err as Error;
            return {
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                result: {
                    status: "error",
                    message: error.message,
                },
            };
        }
    };
    public editChildById = async (
        childId: string,
        child: any
    ): Promise<IResponse<any | IError>> => {
        try {
            const foundChild: any = Child.findByPk(childId);
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
            if (error.message === "Врач не найден.") {
                return {
                    status: StatusCodes.NOT_FOUND,
                    result: {
                        status: "error",
                        message: error.message,
                    },
                };
            } else {
                return {
                    status: StatusCodes.BAD_REQUEST,
                    result: {
                        status: "error",
                        message: error.message,
                    },
                };
            }
        }
    };
}

export const childrenDb = new ChildrenDb();
