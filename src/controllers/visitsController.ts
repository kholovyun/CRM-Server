import express, { Request, Response, Router } from "express";
import IResponse from "../interfaces/IResponse";
import { permission } from "../middleware/permission";
import { ERoles } from "../enums/ERoles";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import IError from "../interfaces/IError";
import { VisitsDb, visitDb } from "../repository/subDb/visitsDb";
import IVisitGetDto from "../interfaces/IVisit/IVisitGetDto";

export class VisitsController {
    private repository: VisitsDb;
    private router: Router;

    constructor() {
        this.repository = visitDb;
        this.router = express.Router();
        this.router.post("/", permission([ERoles.DOCTOR]), this.createVisit);
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private createVisit = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string, role: string };
        const visit = req.body;
        const response: IResponse<IVisitGetDto | IError> = await this.repository.createVisit(user.id, visit);
        res.status(response.status).send(response.result);
    };
}