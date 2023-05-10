import express, { Request, Response, Router } from "express";
import IResponse from "../interfaces/IResponse";
import multer from "multer";
import shortid from "shortid";
import { config } from "../index.config";
import { auth } from "../middleware/auth";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import IDoctorGetDto from "../interfaces/IDoctor/IDoctorGetDto";
import { DoctorsService, doctorsService } from "../services/doctorsService";
import morganMiddleware from "../config/morganMiddleware";

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
    private service: DoctorsService;
    private router: Router;

    constructor() {
        this.router = express.Router();
        this.router.use(morganMiddleware);
        this.router.get("/", auth, this.getDoctors);
        this.router.get("/:id", auth, this.getDoctorById);
        this.router.post("/", [auth, upload.single("photo")], this.createDoctor);
        this.router.put("/:id", [auth, upload.single("photo")], this.editDoctor);
        // this.router.patch("/:id", auth, this.activateDoctor);
        this.service = doctorsService;
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private getDoctors = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const response: IResponse<IDoctorGetDto[] | string> = await this.service.getDoctors(
            user.id
        );
        res.status(response.status).send(response.result);
    };

    private getDoctorById = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const response: IResponse<IDoctorGetDto | string> = await this.service.getDoctorById(
            user.id,
            req.params.id
        );
        res.status(response.status).send(response.result);
    };

    private createDoctor = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const doctor = req.body;
        doctor.photo = req.file ? req.file.filename : "";
        const response = await this.service.createDoctor(user.id, doctor);
        res.send(response);
    };

    private editDoctor = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string };
        const doctor = req.body;
        if (req.file && req.file.filename) {
            doctor.photo = req.file.filename;
        }
        const response = await this.service.editDoctor(user.id, req.params.id, doctor);
        res.send(response);
    };

    // private activateDoctor = async (expressReq: Request, res: Response): Promise<void> => {
    //     const req = expressReq as IRequestWithTokenData;
    //     const user = req.dataFromToken as {id: string, email: string};
    //     const response = await this.service.activateDoctor(user.id, req.params.id);
    //     res.send(response);
    // };
}