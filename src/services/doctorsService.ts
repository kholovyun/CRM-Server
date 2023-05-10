import IDoctorCreateDto from "../interfaces/IDoctor/IDoctorCreateDto";
import IDoctorGetDto from "../interfaces/IDoctor/IDoctorGetDto";
import IDoctorUpdateDto from "../interfaces/IDoctor/IDoctorUpdateDto";
import IResponse from "../interfaces/IResponse";

import { postgresDB, PostgresDB } from "../repository/postgresDb";

export class DoctorsService {
    private repository: PostgresDB;
    constructor() {
        this.repository = postgresDB;
    }

    public getDoctors = async (userId: string): Promise<IResponse<IDoctorGetDto[] | string>> => {
        return await this.repository.getDoctors(userId);
    };

    public getDoctorById = async (userId: string, id: string): Promise<IResponse<IDoctorGetDto | string>> => {
        return await this.repository.getDoctorById(userId, id);
    };

    public createDoctor = async (userId: string, doctor: IDoctorCreateDto): Promise<IResponse<IDoctorGetDto | string>> => {
        return await this.repository.createDoctor(userId, doctor);
    };

    public editDoctor = async (userId: string, searchId: string, doctor: IDoctorUpdateDto): Promise<IResponse<IDoctorGetDto | string>> => {
        return await this.repository.editDoctor(userId, searchId, doctor);
    };
}

export const doctorsService = new DoctorsService();