import express, { Request, Response, Router } from "express";
import IResponse from "../interfaces/IResponse";
import multer from "multer";
import shortid from "shortid";
import { config } from "../index.config";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import IDoctorGetDto from "../interfaces/IDoctor/IDoctorGetDto";
import morganMiddleware from "../config/morganMiddleware";
import { permission } from "../middleware/permission";
import { ERoles } from "../enums/ERoles";
import { DoctorsDb, doctorsDb } from "../repository/subDb/doctorsDb";
import IError from "../interfaces/IError";

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, config.doctorsImgs);
    },
    filename(req, file, callback) {
        callback(null, `${shortid()}${file.originalname}`);
    },
});

const upload = multer({ storage });

export class DoctorsController {
    private repository: DoctorsDb;
    private readonly router: Router;

    constructor() {
        this.router = express.Router();
        this.router.use(morganMiddleware);
        this.router.get("/", permission([ERoles.ADMIN, ERoles.SUPERADMIN, ERoles.DOCTOR]), this.getDoctors);
        this.router.get("/:id", permission([ERoles.ADMIN, ERoles.SUPERADMIN, ERoles.DOCTOR, ERoles.PARENT]), this.getDoctorById);
        this.router.put("/:id", [permission([ERoles.ADMIN, ERoles.SUPERADMIN, ERoles.DOCTOR]), upload.single("photo")], this.editDoctor);
        this.router.patch("/:id", permission([ERoles.ADMIN, ERoles.SUPERADMIN]), this.activateDoctor);
        this.repository = doctorsDb;
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private getDoctors = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string, email: string, role: string };
        const response: IResponse<{rows: IDoctorGetDto[], count: number} | IError> = await this.repository.getDoctors(
            user.id, req.query.offset ? String(req.query.offset) : undefined, req.query.limit ? String(req.query.limit): undefined
        );
        res.status(response.status).send(response.result);
    };

    private getDoctorById = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string, email: string, role: string };
        const response: IResponse<IDoctorGetDto | IError> = await this.repository.getDoctorByUserId(
            user.id, req.params.id
        );
        res.status(response.status).send(response.result);
    };

    private editDoctor = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string, email: string, role: string };
        const doctor = req.body;
        if (req.file && req.file.filename) {
            doctor.photo = req.file.filename;
        }
        const response: IResponse<IDoctorGetDto | IError> = await this.repository.editDoctor(user.id, req.params.id, doctor);
        res.status(response.status).send(response);
    };

    private activateDoctor = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string, email: string, role: string };
        const response: IResponse<IDoctorGetDto | IError> = await this.repository.activateDoctor(user.id, req.params.id);
        res.status(response.status).send(response.result);
    };
}