import express, { Request, Response, Router } from "express";
import { NewbornDataDb, newbornDataDb } from "../repository/subDb/newbornDataDb";
import { permission } from "../middleware/permission";
import { ERoles } from "../enums/ERoles";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import IResponse from "../interfaces/IResponse";
import INewBornDataGetDto from "../interfaces/IChild/INewBornData/INewBornDataGetDto";
import IError from "../interfaces/IError";

export class NewbornDataController {
    private repository: NewbornDataDb;
    private readonly router: Router;

    constructor() {
        this.repository = newbornDataDb;
        this.router = express.Router();
        this.router.get("/:id", permission([ERoles.DOCTOR, ERoles.SUPERADMIN, ERoles.ADMIN, ERoles.PARENT]), this.getNewbornDataByChildId);
    }

    public getRouter = (): Router => {
        return this.router;
    };

    public getNewbornDataByChildId = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string, email: string, role: string };
        const response: IResponse<INewBornDataGetDto[] | IError> = await this.repository.getNewbornDataByChildId(user.id, req.params.id);
        res.status(response.status).send(response.result);
    };
}