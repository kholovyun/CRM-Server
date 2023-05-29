import express, { Request, Response, Router } from "express";
import morganMiddleware from "../config/morganMiddleware";
import { permission } from "../middleware/permission";
import { ChildrenDb, childrenDb } from "../repository/subDb/childrenDb";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import IResponse from "../interfaces/IResponse";
import IError from "../interfaces/IError";
import { ERoles } from "../enums/ERoles";
import IChildCreateDto from "../interfaces/IChild/IChildCreateDto";
import IChildGetDto from "../interfaces/IChild/IChildGetDto";
import multer from "multer";
import shortid from "shortid";
import { config } from "../index.config";

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, config.childrenImgs);
    },
    filename(req, file, callback) {
        callback(null, `${shortid()}${file.originalname}`);
    },
});

const upload = multer({ storage });

export class childrenController {
    private repository: ChildrenDb;
    private router: Router;
    constructor() {
        this.router = express.Router();
        this.router.use(morganMiddleware);
        this.router.get("/parent/:id", permission([ERoles.ADMIN, ERoles.DOCTOR, ERoles.PARENT, ERoles.SUPERADMIN]), this.getChildrenByParentId);
        this.router.post("/", [permission([ERoles.ADMIN, ERoles.DOCTOR, ERoles.PARENT, ERoles.SUPERADMIN]), upload.single("photo")], this.createChild);
        this.router.get("/:id", permission([ERoles.ADMIN, ERoles.DOCTOR, ERoles.PARENT, ERoles.SUPERADMIN]), this.getChildById);
        this.router.patch("/:id", [permission([ERoles.ADMIN, ERoles.DOCTOR, ERoles.PARENT, ERoles.SUPERADMIN]), upload.single("photo")], this.editChild);
        this.repository = childrenDb;
    }

    public getRouter = (): Router => {
        return this.router;
    };
    
    private getChildrenByParentId = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string, role: string };
        const response: IResponse<IChildGetDto[] | IError> = await this.repository.getChildrenByParentId(
            req.params.id, user.id
        );
        res.status(response.status).send(response);
    };

    private getChildById = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string, role: string };
        const response: IResponse<IChildGetDto | IError> = await this.repository.getChildById(
            req.params.id, user.id
        );
        res.status(response.status).send(response);
    };

    private createChild = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string, role: string };
        const child = req.body;
        child.photo = req.file ? req.file.filename : "";
        const response: IResponse<IChildCreateDto | IError> = await this.repository.createChild(
            child, user.id
        );
        res.status(response.status).send(response);
    };

    private editChild = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string, role: string };
        const child = req.body;
        if (req.file && req.file.filename) {
            child.photo = req.file.filename;
        }
        const response: IResponse<IChildGetDto | IError> = await this.repository.editChildById(
            req.params.id,
            child,
            user.id
        );
        res.status(response.status).send(response);
    };
}