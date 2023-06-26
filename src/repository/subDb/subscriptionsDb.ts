import {errorCodesMathcher} from "../../helpers/errorCodeMatcher";
import {StatusCodes} from "http-status-codes";
import IResponse from "../../interfaces/IResponse";
import IError from "../../interfaces/IError";
import ISubscriptionGetDto from "../../interfaces/ISubscription/ISubscriptionGetDto";
import {User} from "../../models/User";

export class SubscriptionsDb {
    public renewSubscription = async (userId: string, parentId: string):Promise<IResponse<ISubscriptionGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);

            return {
                status: StatusCodes.OK,
                result: undefined
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
    }
}

export const subscriptionsDb = new SubscriptionsDb();
