import {subscriptionsDb, SubscriptionsDb} from "../repository/subDb/subscriptionsDb";
import express, {Request, Response, Router} from "express";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import IResponse from "../interfaces/IResponse";
import IError from "../interfaces/IError";
import ISubscriptionGetDto from "../interfaces/ISubscription/ISubscriptionGetDto";
import {permission} from "../middleware/permission";
import {ERoles} from "../enums/ERoles";

export class SubscriptionsController {
    private repository: SubscriptionsDb;
    private readonly router: Router;

    constructor() {
        this.repository = subscriptionsDb;
        this.router = express.Router();
        this.router.patch("/:id", permission([ERoles.DOCTOR, ERoles.PARENT]), this.renewSubscription)
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private renewSubscription = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string, email: string, role: string };
        const response: IResponse<ISubscriptionGetDto | IError> = await this.repository.renewSubscription(user.id, req.params.id);
        res.status(response.status).send(response.result);
    };

}