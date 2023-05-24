import { StatusCodes } from "http-status-codes";
import { errorCodesMathcher } from "../../helpers/errorCodeMatcher";
import IDocumentCreateDto from "../../interfaces/IDocument/IDocumentCreateDto";
import IError from "../../interfaces/IError";
import IResponse from "../../interfaces/IResponse";
import IDocumentGetDto from "../../interfaces/IDocument/IDocumentGetDto";
import { EErrorMessages } from "../../enums/EErrorMessages";
import { User } from "../../models/User";
import { Document } from "../../models/Document";
import { ERoles } from "../../enums/ERoles";

export class DocumentsDb {
    public createDocument = async (userId: string, document: IDocumentCreateDto): Promise<IResponse<IDocumentGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);

            if (foundUser.role === ERoles.DOCTOR) {
                console.log("hello");
            }

            if (foundUser.role === ERoles.PARENT) {
                console.log("hello");
            }

            
            
            if (document.url === "") throw new Error(EErrorMessages.IMAGE_SHOUD_BE_PRESENT);
            const newDocument: IDocumentGetDto = await Document.create({...document});
            return {
                status: StatusCodes.OK,
                result: newDocument
            };

        } catch (err: unknown) {
            const error = err as Error;
            const status = errorCodesMathcher[error.message] || StatusCodes.BAD_REQUEST;
            return {
                status,
                result: {
                    status: "error",
                    message: error.message
                }
            };
        }
    };
}

export const documentsDb = new DocumentsDb();