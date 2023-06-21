import express, { Request, Response, Router } from "express";
import IResponse from "../interfaces/IResponse";
import IParentGetDto from "../interfaces/IParent/IParentGetDto";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import morganMiddleware from "../config/morganMiddleware";
import { permission } from "../middleware/permission";
import { ERoles } from "../enums/ERoles";
import { ParentsDb, parentsDb } from "../repository/subDb/parentsDb";
import IError from "../interfaces/IError";
import IParent from "../interfaces/IParent/IParent";

export class ParentsController {
    private repository: ParentsDb;
    private router: Router;

    constructor() {
        this.router = express.Router();
        this.router.use(morganMiddleware);
        this.router.get("/", permission([ERoles.ADMIN, ERoles.SUPERADMIN]), this.getParents);
        this.router.get("/doctor/:id", permission([ERoles.ADMIN, ERoles.SUPERADMIN, ERoles.DOCTOR,]), this.getParentsByDoctorId);
        this.router.get("/:id", permission([ERoles.ADMIN, ERoles.SUPERADMIN, ERoles.DOCTOR, ERoles.PARENT]), this.getParentById);
        this.router.patch("/:id", permission([ERoles.ADMIN, ERoles.SUPERADMIN]), this.activateParent);
        this.router.get("/alldata", permission([ERoles.ADMIN, ERoles.SUPERADMIN, ERoles.DOCTOR, ERoles.PARENT]), this.getParentByUserId);
        this.router.get("/data/:id", permission([ERoles.ADMIN, ERoles.SUPERADMIN, ERoles.DOCTOR, ERoles.PARENT]), this.getParentByParentId);

        this.repository = parentsDb;
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private getParents = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string, email: string, role: string };
        const response: IResponse<IParentGetDto[] | IError> = await this.repository.getParents(
            user.id, String(req.query.offset), String(req.query.limit)
        );
        res.status(response.status).send(response.result);
    };

    private getParentsByDoctorId = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string, email: string, role: string };
        const response: IResponse<{rows: IParentGetDto[], count: number} | IError> = await this.repository.getParentsByDoctorId(
            user.id, String(req.query.offset), String(req.query.limit), req.params.id
        );
        res.status(response.status).send(response.result);
    };

    private getParentById = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string, email: string, role: string };
        const response: IResponse<IParentGetDto | IError> = await this.repository.getParentById(
            user.id,
            req.params.id
        );
        res.status(response.status).send(response.result);
    };

    private activateParent = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string, email: string, role: string };
        const response: IResponse<IParentGetDto | IError> = await this.repository.activateParent(user.id, req.params.id);
        res.status(response.status).send(response.result);
    };

    private getParentByUserId = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string, email: string, role: string };
        const response: IResponse<IParent | IError> = await this.repository.getParentByUserId(
            user.id,
            req.body.id
        );
        res.status(response.status).send(response.result);
    };

    private getParentByParentId = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const params = req.params.id;
        const user = req.dataFromToken as { id: string, email: string, role: string };
        const response: IResponse<IParent | IError> = await this.repository.getParentByUserId(
            user.id,
            params
        );
        res.status(response.status).send(response.result);
    };
}