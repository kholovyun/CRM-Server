import { StatusCodes } from "http-status-codes";
import { Doctor } from "../../models/Doctor";
import { User } from "../../models/User";
import IResponse from "../../interfaces/IResponse";
import IError from "../../interfaces/IError";
import { errorCodesMathcher } from "../../helpers/errorCodeMatcher";
import { EErrorMessages } from "../../enums/EErrorMessages";
import IVisitCreateDto from "../../interfaces/IVisit/IVisitCreateDto";
import { Visit } from "../../models/Visit";
import IVisitGetDto from "../../interfaces/IVisit/IVisitGetDto";
import { Child } from "../../models/Child";
import { Parent } from "../../models/Parent";
import Logger from "../../lib/logger";


export class VisitsDb {
    public createVisit = async (userId: string, visit: IVisitCreateDto): Promise<IResponse<IVisitGetDto | IError>> => {
        try {
            Logger.info(new Date());
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);

            const foundDoctor = await Doctor.findOne({where: {userId: userId}});
            if (!foundDoctor) throw new Error(EErrorMessages.NO_ACCESS);

            const foundChild = await Child.findByPk(visit.childId);
            if (!foundChild) throw new Error(EErrorMessages.CHILD_NOT_FOUND);
            
            const foundParent = await Parent.findByPk(foundChild.parentId);
            if (!foundParent) throw new Error(EErrorMessages.NO_ACCESS);

            if (foundParent.doctorId !== foundDoctor.id) throw new Error(EErrorMessages.NO_ACCESS);

            const newVisit: IVisitGetDto = await Visit.create({...visit});
            return {
                status: StatusCodes.OK,
                result: newVisit
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

export const visitDb = new VisitsDb();