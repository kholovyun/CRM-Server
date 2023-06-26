import {errorCodesMathcher} from "../../helpers/errorCodeMatcher";
import {StatusCodes} from "http-status-codes";
import IResponse from "../../interfaces/IResponse";
import IError from "../../interfaces/IError";
import ISubscriptionGetDto from "../../interfaces/ISubscription/ISubscriptionGetDto";
import {User} from "../../models/User";
import {EErrorMessages} from "../../enums/EErrorMessages";
import {Parent} from "../../models/Parent";
import {IMessage} from "../../interfaces/IMessage";


export class SubscriptionsDb {
    public renewSubscription = async (userId: string, parentId: string, subscriptionDto: ISubscriptionGetDto): Promise<IResponse<IMessage | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);


            const foundParent = await Parent.findByPk(parentId);
            if (!foundParent) throw new Error(EErrorMessages.PARENT_NOT_FOUND);

            const isParentBlocked = await User.findByPk(foundParent.userId);
            if (isParentBlocked) throw  new Error(EErrorMessages.NO_ACCESS);

            let days = 0;
            switch (subscriptionDto.type) {
                case 1:
                    days = 30;
                    break;
                case 6:
                    days = 180
                    break;
                case 12:
                    days = 360;
                    break;

            }

            await Parent.update({subscriptionEndDate: new Date().setDate(foundParent.subscriptionEndDate.getDate() + days)}, {where: {id: parentId}})


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
