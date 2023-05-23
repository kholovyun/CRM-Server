import { StatusCodes } from "http-status-codes";
import { EErrorMessages } from "../enums/EErrorMessages";

interface ErrorObject {
    [key: string]: number;
  }


export const errorCodesMathcher: ErrorObject = {
    [EErrorMessages.DIPLOMA_NOT_FOUND] : StatusCodes.NOT_FOUND,
    [EErrorMessages.DOCTOR_NOT_FOUND] : StatusCodes.NOT_FOUND,
    [EErrorMessages.PARENT_NOT_FOUND] : StatusCodes.NOT_FOUND,
    [EErrorMessages.USER_NOT_FOUND_BY_ID] : StatusCodes.NOT_FOUND,
    [EErrorMessages.USER_NOT_FOUND] : StatusCodes.NOT_FOUND,
    [EErrorMessages.NO_ACCESS] : StatusCodes.FORBIDDEN,
    [EErrorMessages.NOT_AUTHORIZED] : StatusCodes.FORBIDDEN,
    [EErrorMessages.WRONG_PASSWORD] : StatusCodes.BAD_REQUEST,
    [EErrorMessages.PASSWORD_LENGTH_FAILED] : StatusCodes.BAD_REQUEST,
    [EErrorMessages.PASSWORD_CAPITAL_LETTER_FAILED] : StatusCodes.BAD_REQUEST,
    [EErrorMessages.PASSWORD_SMALL_LETTER_FAILED] : StatusCodes.BAD_REQUEST,
    [EErrorMessages.PASSWORD_NUMBER_FAILED] : StatusCodes.BAD_REQUEST,
    [EErrorMessages.WRONG_MAIL_FOTMAT] : StatusCodes.BAD_REQUEST,
    [EErrorMessages.DOCTOR_TABLE_ALREADY_EXISTS] : StatusCodes.BAD_REQUEST,
    [EErrorMessages.PARENT_TABLE_ALREADY_EXISTS] : StatusCodes.BAD_REQUEST,
    [EErrorMessages.USER_ALREADY_EXISTS] : StatusCodes.BAD_REQUEST,
    [EErrorMessages.SUPERADMIN_CANT_BE_DELETED] : StatusCodes.BAD_REQUEST,
    [EErrorMessages.NO_PASSWORD] : StatusCodes.BAD_REQUEST,
    [EErrorMessages.DOCTOR_DIPLOMA_NOT_FOUND] : StatusCodes.NOT_FOUND,
    [EErrorMessages.IMAGE_SHOUD_BE_PRESENT] : StatusCodes.BAD_REQUEST,
    [EErrorMessages.NO_RECOMENDATIONS_FOUND] : StatusCodes.NOT_FOUND,
};