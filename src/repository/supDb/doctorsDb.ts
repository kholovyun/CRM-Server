import { StatusCodes } from "http-status-codes";
import IDoctorGetDto from "../../interfaces/IDoctor/IDoctorGetDto";
import IResponse from "../../interfaces/IResponse";
import { Doctor } from "../../models/Doctor";
import { User } from "../../models/User";
import { ERoles } from "../../enums/ERoles";
import IDoctorCreateDto from "../../interfaces/IDoctor/IDoctorCreateDto";
import IDoctorUpdateDto from "../../interfaces/IDoctor/IDoctorUpdateDto";
import IError from "../../interfaces/IError";
import { errorCodesMathcher } from "../../helpers/errorCodeMatcher";
import { EErrorMessages } from "../../enums/EErrorMessages";


export class DoctorsDb {
    public getDoctors = async (userId: string, offset: string, limit: string): Promise<IResponse<IDoctorGetDto[] | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error(EErrorMessages.NO_ACCESS);
            const foundDoctors = await Doctor.findAll({
                include: {
                    model: User,
                    as: "users",
                    attributes: ["name", "patronim", "surname", "email", "phone", "isBlocked"]
                },
                order: [
                    [{ model: User, as: "users" }, "surname", "ASC"]
                ],
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            return {
                status: StatusCodes.OK,
                result: foundDoctors
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

    public getDoctorById = async (userId: string, id: string): Promise<IResponse<IDoctorGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.NOT_AUTHORIZED);
            const doctor: IDoctorGetDto | null = await Doctor.findByPk(id,
                {
                    include: {
                        model: User,
                        as: "users",
                        attributes: ["name", "patronim", "surname", "email", "phone"]
                    }
                });
            if (!doctor) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);
            if (foundUser.role === ERoles.ADMIN || String(foundUser.id) === String(doctor.userId)) {
                return {
                    status: StatusCodes.OK,
                    result: doctor
                };
            }
            if (!doctor.isActive) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);
            const doctorForParent: IDoctorGetDto | null = await Doctor.findByPk(id,
                {
                    include: {
                        model: User,
                        as: "users",
                        attributes: ["name", "patronim", "surname"]
                    }
                });
            if (!doctorForParent) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);
            return {
                status: StatusCodes.OK,
                result: doctorForParent
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


    public getDoctorByUserId = async (userId: string): Promise<IResponse<IDoctorGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error(EErrorMessages.USER_NOT_FOUND);
            const doctor: IDoctorGetDto | null = await Doctor.findOne(
                {
                    where: {userId: userId},
                    include: {
                        model: User,
                        as: "users",
                        attributes: ["name", "patronim", "surname", "email", "phone"]
                    }
                });

            if (!doctor || !doctor.isActive) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);
            return {
                status: StatusCodes.OK,
                result: doctor
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
    

    public createDoctor = async (userId: string, doctor: IDoctorCreateDto): Promise<IResponse<IDoctorGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error(EErrorMessages.NO_ACCESS);
            const exsistedDoctor = await Doctor.findOne({
                where: {
                    userId: doctor.userId
                }
            });
            if (exsistedDoctor) throw new Error(EErrorMessages.DOCTOR_TABLE_ALREADY_EXISTS);
            if (doctor.photo === "") {
                doctor.photo = "default_doctor_photo.jpg";
            }
            const newDoctor: IDoctorGetDto = await Doctor.create({ ...doctor });
            return {
                status: StatusCodes.CREATED,
                result: newDoctor
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

    public editDoctor = async (userId: string, searchId: string, doctor: IDoctorUpdateDto): Promise<IResponse<IDoctorGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error(EErrorMessages.NO_ACCESS);
            const foundDoctor: IDoctorGetDto | null = await Doctor.findByPk(searchId);
            if (!foundDoctor) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);
            if (foundUser.role === ERoles.DOCTOR && String(foundUser.id) !== String(foundDoctor.userId)) {
                throw new Error(EErrorMessages.NO_ACCESS);
            }
            if (doctor.photo === "") {
                doctor.photo = "default-photo.svg";
            }
            const updatedDoctor = await Doctor.update(
                { ...doctor },
                {
                    where: { id: foundDoctor.id },
                    returning: true
                }).then((result) => { return result[1][0]; });
            return {
                status: StatusCodes.OK,
                result: updatedDoctor
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

    public activateDoctor = async (userId: string, doctorId: string): Promise<IResponse<IDoctorGetDto | IError>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) 
                throw new Error(EErrorMessages.NO_ACCESS);
            const foundDoctor: IDoctorGetDto | null = await Doctor.findByPk(doctorId);
            if (!foundDoctor) throw new Error(EErrorMessages.DOCTOR_NOT_FOUND);
            const updatedDoctor = await Doctor.update(
                { isActive: foundDoctor.isActive ? false : true},
                { 
                    where: {id: foundDoctor.id },
                    returning: true 
                }).then((result) => { return result[1][0]; });
            return {
                status: StatusCodes.OK,
                result: updatedDoctor
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

export const doctorsDb = new DoctorsDb();