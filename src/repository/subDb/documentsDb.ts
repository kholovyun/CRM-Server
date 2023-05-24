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
import { Doctor } from "../../models/Doctor";
import { Parent } from "../../models/Parent";
import { Child } from "../../models/Child";

export class DocumentsDb {
    public createDocument = async (userId: string, document: IDocumentCreateDto): Promise<IResponse<IDocumentGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);

            const foundChild = await Child.findByPk(document.childId);

            if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctor = await Doctor.findOne({where: {user_id: userId}});
                const foundParent = await Parent.findOne({where: {id: foundChild?.parentId}});
                if (foundDoctor?.id !== foundParent?.doctorId) throw new Error(EErrorMessages.NO_ACCESS);
            }

            if (foundUser.role === ERoles.PARENT) {
                const foundParent = await Parent.findOne({where: {user_id: userId}});
                if (foundChild?.parentId !== foundParent?.id) throw new Error(EErrorMessages.NO_ACCESS);
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
    public deleteDocument = async (userId: string, documentId: string): Promise<IResponse<string | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) throw new Error(EErrorMessages.NO_ACCESS);

            const document = await Document.findByPk(documentId);
            if (!document) throw new Error(EErrorMessages.DOCUMENT_NOT_FOUND);

            const foundChild = await Child.findOne({where: {id: document.childId}});
            
            if (foundUser.role === ERoles.PARENT) {
                const foundParent = await Parent.findOne({where: {user_id: userId}});
                if (foundChild?.parentId !== foundParent?.id) throw new Error(EErrorMessages.NO_ACCESS);
            }

            if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctor = await Doctor.findOne({where: {user_id: userId}});
                const foundParent = await Parent.findOne({where: {id: foundChild?.parentId}});
                if (foundParent?.doctorId !== foundDoctor?.id) throw new Error(EErrorMessages.NO_ACCESS);
            }

            await Document.destroy({where: {id: documentId}});
            return {
                status: StatusCodes.OK,
                result: "Документ удален!"
            };

        } catch (err: unknown) {
            const error = err as Error;
            const status = errorCodesMathcher[error.message] || StatusCodes.INTERNAL_SERVER_ERROR;
            return {
                status,
                result: {
                    status: "error",
                    message: error.message
                }
            };
        }
    };

    public getDocumentsByChildId = async (userId: string, childId: string): Promise<IResponse<IDocumentGetDto[] | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.NO_ACCESS);

            const foundChild = await Child.findByPk(childId);
            if (!foundChild) throw new Error(EErrorMessages.CHILD_NOT_FOUND);

            if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctor = await Doctor.findOne({where: {user_id: userId}});
                const foundParent = await Parent.findOne({where: {id: foundChild.parentId}});
                if (foundDoctor?.id !== foundParent?.doctorId) throw new Error(EErrorMessages.NO_ACCESS);
            }

            if (foundUser.role === ERoles.PARENT) {
                const foundParent = await Parent.findOne({where: {user_id: userId}});
                if (foundChild.parentId !== foundParent?.id) throw new Error(EErrorMessages.NO_ACCESS);
            }

            const documents = await Document.findAll({
                where: {childId},
                raw: true
            });            
            return {
                status: StatusCodes.OK,
                result: documents
            };

        } catch (err: unknown) {
            const error = err as Error;
            const status = errorCodesMathcher[error.message] || StatusCodes.INTERNAL_SERVER_ERROR;
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