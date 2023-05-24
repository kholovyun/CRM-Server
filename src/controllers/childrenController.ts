import express, { Request, Response, Router } from "express";

import morganMiddleware from "../config/morganMiddleware";
import { permission } from "../middleware/permission";
import { ChildrenDb, childrenDb } from "../repository/supDb/childrenDb";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import IResponse from "../interfaces/IResponse";
import IError from "../interfaces/IError";
import { ERoles } from "../enums/ERoles";
import IChildCreateDto from "../interfaces/IChild/IChildCreateDto";
import IChildGetDto from "../interfaces/IChild/IChildGetDto";

export class childrenController {
    private repository: ChildrenDb;
    private router: Router;
    constructor() {
        this.router = express.Router();
        this.router.use(morganMiddleware);
        this.router.get("/children", permission([ERoles.ADMIN, ERoles.DOCTOR, ERoles.PARENT, ERoles.SUPERADMIN]), this.getChildrenByParentId);
        this.router.post("/", permission([ERoles.ADMIN, ERoles.DOCTOR, ERoles.PARENT, ERoles.SUPERADMIN]), this.createChild);
        this.router.get("/child", permission([ERoles.ADMIN, ERoles.DOCTOR, ERoles.PARENT, ERoles.SUPERADMIN]), this.getChildById);
        this.router.patch("/edit", permission([ERoles.ADMIN, ERoles.DOCTOR, ERoles.PARENT, ERoles.SUPERADMIN]), this.editChild);
        this.repository = childrenDb;
    }
    public getRouter = (): Router => {
        return this.router;
    };
    private getChildrenByParentId = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const response: IResponse<IChildGetDto[] | IError> = await this.repository.getChildrenByParentId(
            expressReq.body.parentId, user.id
        );
        res.status(response.status).send(response);
    };

    private getChildById = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const response: IResponse<IChildGetDto | IError> = await this.repository.getChildById(
            expressReq.body.childId, user.id
        );
        res.status(response.status).send(response);
    };

    private createChild = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        
        const response: IResponse<IChildCreateDto | IError> = await this.repository.createChild(
            expressReq.body, user.id
        );
        res.status(response.status).send(response);
    };

    private editChild = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const response: IResponse<IChildGetDto | IError> = await this.repository.editChildById(
            expressReq.body.childId,
            expressReq.body.child,
            user.id
        );
        res.status(response.status).send(response);
    };
}
