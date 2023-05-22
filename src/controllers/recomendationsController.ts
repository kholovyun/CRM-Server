import express, { Request, Response, Router } from "express";
import IResponse from "../interfaces/IResponse";
import { permission } from "../middleware/permission";
import { ERoles } from "../enums/ERoles";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import IUserGetDto from "../interfaces/IUser/IUserGetDto";
import { config } from "../index.config";
import multer from "multer";
import shortid from "shortid";
import IError from "../interfaces/IError";
import { RecomendationsDb, recomendationDb } from "../repository/supDb/recomendationsDb";
import IRecomendationCetDto from "../interfaces/IRecomendation/IRecomendationGetDto";
import IRecomendationCreateDto from "../interfaces/IRecomendation/IRecomendationCreateDto";

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, config.doctorsDiplomas);
    },
    filename(req, file, callback) {
        callback(null, `${shortid()}${file.originalname}`);
    },
});

const upload = multer({ storage });

export class RecomendationsControllers {
    private repository: RecomendationsDb;
    private router: Router;

    constructor() {
        this.repository = recomendationDb;
        this.router = express.Router();
        this.router.get("/:id", permission(), this.getRecomendationsByDoctorId);
        this.router.post("/", [permission([ERoles.DOCTOR]), upload.single("url")], this.createRecomendation);
        this.router.delete("/:id", permission([ERoles.DOCTOR, ERoles.ADMIN, ERoles.SUPERADMIN]), this.deleteRecomendation);
        this.router.put("/:id", [permission([ERoles.DOCTOR, ERoles.ADMIN, ERoles.SUPERADMIN]), upload.single("url")], this.editRecomendation);
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private getRecomendationsByDoctorId = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const response: IResponse<IRecomendationCetDto[] | IError> = await this.repository.getRecomendationsByDoctor(req.params.id);
        res.status(response.status).send(response.result);
    };

    private createRecomendation = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string, role: string };
        const recomendation = req.body;
        recomendation.url = req.file ? req.file.filename : "";
        const response: IResponse<IRecomendationCreateDto | IError> = await this.repository.createRecomendation(user.id, recomendation);
        res.status(response.status).send(response.result);
    };

    private deleteRecomendation = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as IUserGetDto;
        const response: IResponse<string | IError> = await this.repository.deleteRecomendation(user.id, req.params.id);
        res.status(response.status).send(response.result);
    };
    private editRecomendation = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as IUserGetDto;
        const upgradedRecomendation = req.body;
        const response: IResponse<IRecomendationCreateDto | IError> = await this.repository.editRecomendation(user.id, upgradedRecomendation);
        res.status(response.status).send(response.result);
    };
}