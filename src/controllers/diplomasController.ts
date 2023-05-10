import express, { Request, Response, Router } from "express";
import { DiplomasService, diplomasService } from "../services/diplomasService";
import IResponse from "../interfaces/IResponse";
import IDiplomGetDto from "../interfaces/IDiplom/IDiplomGetDto";
import { permission } from "../middleware/permission";
import { ERoles } from "../enums/ERoles";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import IUserGetDto from "../interfaces/IUser/IUserGetDto";

export class DiplomasControllers {
    private service: DiplomasService;
    private router: Router;

    constructor() {
        this.service = diplomasService;
        this.router = express.Router();
        this.router.get("/", permission([ERoles.DOCTOR, ERoles.DOCTOR, ERoles.ADMIN, ERoles.PARENT]), this.getDiplomasByDoctor);
        this.router.post("/", permission([ERoles.DOCTOR, ERoles.ADMIN, ERoles.DOCTOR]), this.createDiploma);
        this.router.delete("/",permission([ERoles.DOCTOR]), this.deleteDiploma);
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private getDiplomasByDoctor = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as IUserGetDto;
        const response: IResponse<IDiplomGetDto[] | string> = await this.service.getDiplomasByDoctor(user.id, req.body.doctorId);
        res.status(response.status).send(response.result);
    };

    private createDiploma = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as IUserGetDto;
        const response: IResponse<IDiplomGetDto | string> = await this.service.createDiploma(user.id, req.body);
        res.status(response.status).send(response.result);
    };

    private deleteDiploma = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as IUserGetDto;
        const response: IResponse<IDiplomGetDto | string | number> = await this.service.deleteDiploma(user.id, req.body.diplomaId);
        res.status(response.status).send(response.result);
    };
}