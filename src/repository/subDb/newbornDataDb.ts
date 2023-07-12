import { StatusCodes } from "http-status-codes";
import { EErrorMessages } from "../../enums/EErrorMessages";
import { errorCodesMathcher } from "../../helpers/errorCodeMatcher";
import INewBornDataGetDto from "../../interfaces/IChild/INewBornData/INewBornDataGetDto";
import IError from "../../interfaces/IError";
import IResponse from "../../interfaces/IResponse";
import { User } from "../../models/User";
import { Child } from "../../models/Child";
import { ERoles } from "../../enums/ERoles";
import { Doctor } from "../../models/Doctor";
import { Parent } from "../../models/Parent";
import { NewbornData } from "../../models/NewbornData";

export class NewbornDataDb {
    public getNewbornDataByChildId = async (userId: string, childId: string): Promise<IResponse<INewBornDataGetDto[] | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.NO_ACCESS);

            const foundChild = await Child.findByPk(childId);
            if (!foundChild) throw new Error(EErrorMessages.CHILD_NOT_FOUND);

            if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctor = await Doctor.findOne({where: {userId}});
                const foundParent = await Parent.findOne({where: {id: foundChild.parentId}});
                if (foundDoctor?.id !== foundParent?.doctorId) throw new Error(EErrorMessages.NO_ACCESS);
            }

            if (foundUser.role === ERoles.PARENT) {
                const foundParent = await Parent.findOne({where: {userId}});
                if (foundChild.parentId !== foundParent?.id) throw new Error(EErrorMessages.NO_ACCESS);
            }

            const newbornData = await NewbornData.findAll({
                where: {childId},
            });
            return {
                status: StatusCodes.OK,
                result: newbornData
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

export const newbornDataDb = new NewbornDataDb();