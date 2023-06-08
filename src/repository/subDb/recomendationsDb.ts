import { StatusCodes } from "http-status-codes";
import { ERoles } from "../../enums/ERoles";
import { Doctor } from "../../models/Doctor";
import { User } from "../../models/User";
import IResponse from "../../interfaces/IResponse";
import IError from "../../interfaces/IError";
import { errorCodesMathcher } from "../../helpers/errorCodeMatcher";
import { EErrorMessages } from "../../enums/EErrorMessages";
import { Recommendation } from "../../models/Recommendation";
import IRecomendationCreateDto from "../../interfaces/IRecomendation/IRecomendationCreateDto";
import IRecomendationGetDto from "../../interfaces/IRecomendation/IRecomendationGetDto";

export class RecomendationsDb {
    public getRecomendationsByDoctor = async (doctorId: string): Promise<IResponse<IRecomendationGetDto[] | IError>> => {
        try {
            const foundDoctor = await Doctor.findByPk(doctorId);
            if (!foundDoctor) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);
            const recomendations = await Recommendation.findAll({
                where: {doctorId: doctorId}
            });
            return {
                status: StatusCodes.OK,
                result: recomendations
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

    public createRecomendation = async (userId: string, recomendation: IRecomendationCreateDto): Promise<IResponse<IRecomendationCreateDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);

            if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctor = await Doctor.findOne({
                    where: {userId: foundUser.id}
                });
                if (!foundDoctor || recomendation.doctorId !== foundDoctor.id ) 
                    throw new Error(EErrorMessages.NO_ACCESS);
            }

            const newRecomeddation: IRecomendationCreateDto = await Recommendation.create({...recomendation});
            return {
                status: StatusCodes.CREATED,
                result: newRecomeddation
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

    public editRecomendation = async (userId: string, recomendationId : string, upgradedRecomendation: IRecomendationCreateDto): Promise<IResponse<IRecomendationCreateDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);

            if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctor = await Doctor.findOne({
                    where: {userId: foundUser.id}
                });
                if (!foundDoctor || upgradedRecomendation.doctorId !== foundDoctor.id ) 
                    throw new Error(EErrorMessages.NO_ACCESS);
            }
            
            const editedRecomeddation: IRecomendationCreateDto = await Recommendation.update({...upgradedRecomendation},
                {
                    where: { id: recomendationId },
                    returning: true
                }).then((result) => { 
                return result[1][0];
            });
            return {
                status: StatusCodes.OK,
                result: editedRecomeddation
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

    public deleteRecomendation = async (userId: string, recomendationId: string): Promise<IResponse<string | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);
            
            const recomendation = await Recommendation.findByPk(recomendationId);
            if (!recomendation) throw new Error(EErrorMessages.NO_RECOMENDATIONS_FOUND);
            if(foundUser.role === ERoles.ADMIN || ERoles.SUPERADMIN) {
                await Recommendation.destroy(
                    {
                        where: {id: recomendationId}
                    });
                return {
                    status: StatusCodes.OK,
                    result: "Публикация удалена!"
                };
            } else if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctor = await Doctor.findOne({
                    where: {userId: foundUser.id}
                });
                if (!foundDoctor || recomendation.doctorId !== foundDoctor.id ) 
                    throw new Error(EErrorMessages.NO_ACCESS);
                
                await Recommendation.destroy(
                    {
                        where: {id: recomendationId}
                    });
                return {
                    status: StatusCodes.OK,
                    result: "Публикация удалена!"
                };
            } else {
                throw new Error(EErrorMessages.NO_ACCESS);
            }
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

export const recomendationDb = new RecomendationsDb();