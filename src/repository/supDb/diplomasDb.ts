import { StatusCodes } from "http-status-codes";
import { Diploma } from "../../models/Diploma";
import { ERoles } from "../../enums/ERoles";
import { Doctor } from "../../models/Doctor";
import { User } from "../../models/User";
import IDiplomaGetDto from "../../interfaces/IDiploma/IDiplomaGetDto";
import IDiplomaCreateDto from "../../interfaces/IDiploma/IDiplomaCreateDto";
import { Parent } from "../../models/Parent";
import IResponse from "../../interfaces/IResponse";
import IError from "../../interfaces/IError";

export class DiplomasDb {
    public getDiplomasByDoctor = async (userId: string, doctorId: string): Promise<IResponse<IDiplomaGetDto[] | IError>> => {
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
                    result: { 
                        status: "error",
                        message: error.message
                    }
                };
            } else if (error.message === "Врач, чьи дипломы Вы запрашиваете не найден.") {
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

    public createDiploma = async (userId: string, diploma: IDiplomaCreateDto): Promise<IResponse<IDiplomaGetDto | IError>> => {
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

    public deleteDiploma = async (userId: string, diplomaId: string): Promise<IResponse<string | IError>> => {
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
                    result: { 
                        status: "error",
                        message: error.message
                    }
                };
            } else if (error.message === "Диплом не найден.") {
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
}

export const diplomasDb = new DiplomasDb();