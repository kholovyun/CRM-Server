import {errorCodesMathcher} from "../../helpers/errorCodeMatcher";
import {StatusCodes} from "http-status-codes";
import IResponse from "../../interfaces/IResponse";
import IError from "../../interfaces/IError";
import ISubscriptionGetDto from "../../interfaces/ISubscription/ISubscriptionGetDto";
import {User} from "../../models/User";
import {EErrorMessages} from "../../enums/EErrorMessages";
import {Parent} from "../../models/Parent";
import {IMessage} from "../../interfaces/IMessage";
import {Subscription} from "../../models/Subscription";
import {Doctor} from "../../models/Doctor";


export class SubscriptionsDb {
    public renewSubscription = async (userId: string, parentId: string, subscriptionDto: ISubscriptionGetDto): Promise<IResponse<IMessage | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);


            const foundParent = await Parent.findByPk(parentId);
            if (!foundParent) throw new Error(EErrorMessages.PARENT_NOT_FOUND);

            const foundUserParent = await User.findByPk(foundParent.userId);
            if (!foundUserParent) throw new Error(EErrorMessages.NO_ACCESS);

            const foundDoctor = await Doctor.findByPk(foundParent.doctorId);
            if (!foundDoctor) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);

            let price;

            switch (subscriptionDto.type) {
                case 1:
                    price = foundDoctor?.price
                    break;
                case 6:
                    price = Math.floor(foundDoctor?.price * 6 - (foundDoctor?.price * 6) * 15/100)
                    break;
                case 12:
                    price = Math.floor(foundDoctor?.price * 12 - (foundDoctor?.price * 12) * 35/100)
                    break;
            }

            const updatedEndDate = new Date().setMonth(foundParent.subscriptionEndDate.getMonth() + subscriptionDto.type)

            await Parent.update({subscriptionEndDate: updatedEndDate}, {where: {id: parentId}})

            await Subscription.update({
                endDate: updatedEndDate,
                payedBy: userId,
                type: subscriptionDto.type,
                paymentType: subscriptionDto.paymentType,
                sum: price
            }, {where: {userId: foundUserParent.id}})

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
    }
}

export const subscriptionsDb = new SubscriptionsDb();
