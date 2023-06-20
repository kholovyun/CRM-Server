import { StatusCodes } from "http-status-codes";
import { errorCodesMathcher } from "../../helpers/errorCodeMatcher";
import IQuestionCreateDto from "../../interfaces/IQuestion/IQuestionCreateDto";
import { User } from "../../models/User";
import { EErrorMessages } from "../../enums/EErrorMessages";
import IQuestionGetDto from "../../interfaces/IQuestion/IQuestionGetDto";
import { Question } from "../../models/Question";
import { Parent } from "../../models/Parent";
import { Child } from "../../models/Child";
import { Doctor } from "../../models/Doctor";
import {Subscription} from "../../models/Subscription";
import { ERoles } from "../../enums/ERoles";

export class QuestionsDb {
    public getQuestionsByChildId = async (userId: string, childId: string) => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.NO_ACCESS);
            const foundChild = await Child.findByPk(childId);
            if (!foundChild) throw new Error(EErrorMessages.CHILD_NOT_FOUND);
            if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctor = await Doctor.findOne({where: {userId}});
                const foundParent = await Parent.findOne({where: {id: foundChild.parentId}});
                if (!foundDoctor || !foundParent || foundDoctor.id !== foundParent.doctorId) throw new Error(EErrorMessages.NO_ACCESS);
            }
            if (foundUser.role === ERoles.PARENT) {
                const foundParentByUser = await Parent.findOne({where: {userId}});
                if (!foundParentByUser || foundChild.parentId !== foundParentByUser.id) throw new Error(EErrorMessages.NO_ACCESS);
            }
            const questions = await Question.findAll({
                where: {childId},
                order: [
                    ["created_at", "DESC"],
                    ["is_closed", "ASC"]
                ]
            });
            return {
                status: StatusCodes.OK,
                result: questions
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

    public getQuestionsByDoctorId = async (userId: string, doctorId: string) => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.NO_ACCESS);
            const foundDoctor = await Doctor.findByPk(doctorId);
            if (!foundDoctor) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);
            if (foundUser.role === ERoles.DOCTOR) {
                const foundDoctor = await Doctor.findOne({where: {userId}});
                if (!foundDoctor) throw new Error(EErrorMessages.NO_ACCESS);
            }
            const questions = await Question.findAll({
                where: {doctorId},
                order: [
                    ["created_at", "DESC"],
                    ["is_closed", "ASC"]
                ]
            });
            return {
                status: StatusCodes.OK,
                result: questions
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

    public createQuestion = async (userId: string, question: IQuestionCreateDto) => {
        try {
            const newDate = new Date();
            const foundUser = await User.findByPk(userId);
            const foundSubscription = await Subscription.findOne({where: {userId: foundUser?.id}});
            if (foundSubscription?.endDate) {
                const compare = foundSubscription?.endDate.getTime() < newDate.getTime();
                if (!foundUser || compare) throw new Error(EErrorMessages.NO_ACCESS);
            }
            const foundChild = await Child.findByPk(question.childId);
            if (!foundChild) throw new Error(EErrorMessages.CHILD_NOT_FOUND);

            const foundDoctor = await Doctor.findByPk(question.doctorId);
            if (!foundDoctor) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);

            const foundParent = await Parent.findOne({
                where: {userId: userId}
            });
            if (!foundParent || foundDoctor.id !== foundParent.doctorId)
                throw new Error(EErrorMessages.NO_ACCESS);
            
            const newQuestion: IQuestionGetDto = await Question.create(
                {
                    parentId: foundParent.id, 
                    doctorId: foundParent.doctorId, 
                    childId: question.childId, 
                    question: question.question
                });
            return {
                status: StatusCodes.OK,
                result: newQuestion
            };
        } catch(err: unknown) {
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
    
    public closeQuestion = async (userId: string, questionId: string) => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) 
                throw new Error(EErrorMessages.NO_ACCESS);
            const foundQuestion = await Question.findByPk(questionId);
            if (!foundQuestion) throw new Error(EErrorMessages.QUESTION_NOT_FOUND);
            const updatedQuestion: IQuestionGetDto = await Question.update(
                {isClosed: foundQuestion.isClosed ? false : true},
                { 
                    where: {id: foundQuestion.id },
                    returning: true 
                }).then((result) => { 
                return result[1][0];
            });
            return {
                status: StatusCodes.OK,
                result: updatedQuestion
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

export const questionsDb = new QuestionsDb();