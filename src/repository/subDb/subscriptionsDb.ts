import {errorCodesMathcher} from "../../helpers/errorCodeMatcher";
import {StatusCodes} from "http-status-codes";
import IResponse from "../../interfaces/IResponse";
import IError from "../../interfaces/IError";
import { User } from "../../models/User";
import { EErrorMessages } from "../../enums/EErrorMessages";
import { Parent } from "../../models/Parent";
import { IMessage } from "../../interfaces/IMessage";
import { Subscription } from "../../models/Subscription";
import { Doctor } from "../../models/Doctor";
import ISubscriptionUpdateDto from "../../interfaces/ISubscription/ISubscriptionUpdateDto";
import { ERoles } from "../../enums/ERoles";


export class SubscriptionsDb {
    public renewSubscription = async (userId: string, subscriptionDto: ISubscriptionUpdateDto): Promise<IResponse<IMessage | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);

            const foundParent = await Parent.findOne({ where: { userId: subscriptionDto.userId } });
            if (!foundParent) throw new Error(EErrorMessages.PARENT_NOT_FOUND);

            if (foundUser.role === ERoles.PARENT && foundUser.id !== subscriptionDto.userId )
                throw new Error(EErrorMessages.NO_ACCESS);
            
            const foundDoctor = await Doctor.findByPk(foundParent.doctorId);
            if (!foundDoctor) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);
            
            if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctorByUser = await Doctor.findOne({ where: { userId: subscriptionDto.payedBy } });
                if (!foundDoctorByUser || foundParent.doctorId !== foundDoctorByUser.id) 
                    throw new Error(EErrorMessages.NO_ACCESS);
            }

            const foundSubscription = await Subscription.findOne({ where: { userId: subscriptionDto.userId } });
            if (!foundSubscription) throw new Error(EErrorMessages.NO_SUBSCRIPTION);

            let sum;

            switch (subscriptionDto.type) {
            case 1:
                sum = foundDoctor.price;
                break;
            case 6:
                sum = Math.floor((foundDoctor.price * 6 - (foundDoctor.price * 6) * 15/100) / 1000) * 1000;
                break;
            case 12:
                sum = Math.floor((foundDoctor.price * 12 - (foundDoctor.price * 12) * 35/100) / 1000) * 1000;
                break;
            }
            const newDate = new Date();
            let updatedEndDate: Date;
            if (foundParent.subscriptionEndDate.getTime() > newDate.getTime()) {
                updatedEndDate = new Date(new Date(new Date(foundParent.subscriptionEndDate))
                    .setMonth(new Date(foundParent.subscriptionEndDate).getMonth() + subscriptionDto.type));
            } else {
                updatedEndDate = new Date(new Date().setMonth(new Date().getMonth() + subscriptionDto.type));
            }            

            await Parent.update({subscriptionEndDate: updatedEndDate}, {where: {id: foundParent.id}});

            await Subscription.update({
                endDate: updatedEndDate,
                payedBy: userId,
                type: subscriptionDto.type,
                paymentType: subscriptionDto.paymentType,
                sum: sum
            }, {where: {id: foundSubscription.id}});

            return {
                status: StatusCodes.OK, result: {message: "Subscription is renewed"}
            };
        } catch (err: unknown) {
            const error = err as Error;
            const status = errorCodesMathcher[error.message] || StatusCodes.INTERNAL_SERVER_ERROR;
            return {
                status, result: {
                    status: "error", message: error.message
                }
            };
        }
    };
}

export const subscriptionsDb = new SubscriptionsDb();