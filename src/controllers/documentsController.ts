import express, { Request, Response, Router } from "express";
import multer from "multer";
import { config } from "../index.config";
import shortid from "shortid";
import { DocumentsDb, documentsDb } from "../repository/subDb/documentsDb";
import { permission } from "../middleware/permission";
import { ERoles } from "../enums/ERoles";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import IResponse from "../interfaces/IResponse";
import IDocumentGetDto from "../interfaces/IDocument/IDocumentGetDto";
import IError from "../interfaces/IError";

const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, config.childrenDocuments);
    },
    filename(req, file, callback) {
        callback(null, `${shortid()}${file.originalname}`);
    },
});

const upload = multer({ storage });

export class DocumentsControllers {
    private repository: DocumentsDb;
    private router: Router;

    constructor() {
        this.repository = documentsDb;
        this.router = express.Router();
        this.router.post("/", [permission([ERoles.DOCTOR, ERoles.ADMIN, ERoles.SUPERADMIN]), upload.single("url")], this.createDocument);
    }

    public getRouter = (): Router => {
        return this.router;
    };

    private createDocument = async (expressReq: Request, res: Response): Promise<void> => {
        const req = expressReq as IRequestWithTokenData;
        const user = req.dataFromToken as { id: string; email: string, role: string };
        const document = req.body;
        document.url = req.file ? req.file.filename : "";
        const response: IResponse<IDocumentGetDto | IError> = await this.repository.createDocument(user.id, document);
        res.status(response.status).send(response.result);
    };


}