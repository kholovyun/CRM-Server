import { StatusCodes } from "http-status-codes";
import IDoctorGetDto from "../../interfaces/IDoctor/IDoctorGetDto";
import IResponse from "../../interfaces/IResponse";
import { Doctor } from "../../models/Doctor";
import { User } from "../../models/User";
import { ERoles } from "../../enums/ERoles";
import IDoctorCreateDto from "../../interfaces/IDoctor/IDoctorCreateDto";
import IDoctorUpdateDto from "../../interfaces/IDoctor/IDoctorUpdateDto";


export class DoctorsDb {
    public getDoctors = async (userId: string, offset: string, limit: string): Promise<IResponse<IDoctorGetDto[] | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error("У Вас нет прав доступа.");
            const foundDoctors = await Doctor.findAll({
                include: {
                    model: User,
                    as: "users",
                    attributes: ["name", "patronim", "surname", "email", "phone", "isBlocked"]
                },
                order: [
                    [{ model: User, as: "users" }, "surname", "ASC"]
                ],
                raw: true,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
            return {
                status: StatusCodes.OK,
                result: foundDoctors
            };
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else {
                return {
                    status: StatusCodes.INTERNAL_SERVER_ERROR,
                    result: error.message
                };
            }
        }
    };

    public getDoctorById = async (userId: string, id: string): Promise<IResponse<IDoctorGetDto | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser) throw new Error("Вы не идентифицированы.");
            const doctor: IDoctorGetDto | null = await Doctor.findByPk(id,
                {
                    include: {
                        model: User,
                        as: "users",
                        attributes: ["name", "patronim", "surname", "email", "phone"]
                    }
                });
            if (!doctor) throw new Error("Врач не найден.");
            if (foundUser.role === ERoles.ADMIN || String(foundUser.id) === String(doctor.userId)) {
                return {
                    status: StatusCodes.OK,
                    result: doctor
                };
            }
            if (!doctor.isActive) throw new Error("Врач не найден.");
            const doctorForParent: IDoctorGetDto | null = await Doctor.findByPk(id,
                {
                    include: {
                        model: User,
                        as: "users",
                        attributes: ["name", "patronim", "surname"]
                    }
                });
            if (!doctorForParent) throw new Error("Врач не найден.");
            return {
                status: StatusCodes.OK,
                result: doctorForParent
            };
        } catch (err: unknown) {
            const error = err as Error;
            if (error.message === "Вы не идентифицированы.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else if (error.message === "Врач не найден.") {
                return {
                    status: StatusCodes.NOT_FOUND,
                    result: error.message
                };
            } else {
                return {
                    status: StatusCodes.INTERNAL_SERVER_ERROR,
                    result: error.message
                };
            }
        }
    };

    public createDoctor = async (userId: string, doctor: IDoctorCreateDto): Promise<IResponse<IDoctorGetDto | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error("У Вас нет прав доступа.");
            const exsistedDoctor = await Doctor.findOne({
                where: {
                    userId: doctor.userId
                }
            });
            if (exsistedDoctor) throw new Error("Таблица врач для этого пользователя уже создана.");
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
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else {
                return {
                    status: StatusCodes.BAD_REQUEST,
                    result: error.message
                };
            }
        }
    };

    public editDoctor = async (userId: string, searchId: string, doctor: IDoctorUpdateDto): Promise<IResponse<IDoctorGetDto | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked)
                throw new Error("У Вас нет прав доступа.");
            const foundDoctor: IDoctorGetDto | null = await Doctor.findByPk(searchId);
            if (!foundDoctor) throw new Error("Врач не найден.");
            if (foundUser.role === ERoles.DOCTOR && String(foundUser.id) !== String(foundDoctor.userId)) {
                throw new Error("У Вас нет прав доступа.");
            }
            if (doctor.photo === "") {
                doctor.photo = "default_doctor_photo.jpg";
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
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else if (error.message === "Врач не найден.") {
                return {
                    status: StatusCodes.NOT_FOUND,
                    result: error.message
                };
            } else {
                return {
                    status: StatusCodes.BAD_REQUEST,
                    result: error.message
                };
            }
        }
    };

    public activateDoctor = async (userId: string, doctorId: string): Promise<IResponse<IDoctorGetDto | string>> => {
        try {
            const foundUser = await User.findByPk(userId);
            if (!foundUser || foundUser.isBlocked) 
                throw new Error("У Вас нет прав доступа.");
            const foundDoctor: IDoctorGetDto | null = await Doctor.findByPk(doctorId);
            if (!foundDoctor) throw new Error("Врач не найден.");
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
            if (error.message === "У Вас нет прав доступа.") {
                return {
                    status: StatusCodes.FORBIDDEN,
                    result: error.message
                };
            } else if (error.message === "Врач не найден.") {
                return {
                    status: StatusCodes.NOT_FOUND,
                    result: error.message
                };
            } else {
                return {
                    status: StatusCodes.BAD_REQUEST,
                    result: error.message
                };
            }
        }
    };
}

export const doctorsDb = new DoctorsDb();