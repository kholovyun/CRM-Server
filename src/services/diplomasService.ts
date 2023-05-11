import IDiplomaCreateDto from "../interfaces/IDiploma/IDiplomaCreateDto";
import IDiplomaGetDto from "../interfaces/IDiploma/IDiplomaGetDto";
import IResponse from "../interfaces/IResponse";
import { PostgresDB, postgresDB } from "../repository/postgresDb";

export class DiplomasService {
    private repository: PostgresDB;
    constructor() {
        this.repository = postgresDB;
    }

    public getDiplomasByDoctor = async (userId: string, doctorId: string): Promise<IResponse<IDiplomaGetDto[] | string>> => {
        return await this.repository.getDiplomasByDoctor(userId, doctorId);
    };

    public createDiploma = async (userId: string, diploma: IDiplomaCreateDto): Promise<IResponse<IDiplomaGetDto | string>> => {
        return await this.repository.createDiploma(userId, diploma);
    };

    public deleteDiploma = async(userId: string, diplomaId: string): Promise<IResponse<string>> => {
        return await this.repository.deleteDiploma(userId, diplomaId);
    };
}

export const diplomasService = new DiplomasService();