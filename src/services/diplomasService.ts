import IDiplomaCreateDto from "../interfaces/IDiplom/IDiplomCreateDto";
import IDiplomGetDto from "../interfaces/IDiplom/IDiplomGetDto";
import IResponse from "../interfaces/IResponse";
import { PostgresDB, postgresDB } from "../repository/postgresDb";

export class DiplomasService {
    private repository: PostgresDB;
    constructor() {
        this.repository = postgresDB;
    }

    // public getDiplomasByDoctor = async (doctorId: string): Promise<IResponse<IDiplomGetDto[] | string>> => {
    //     return await this.repository.getDiplomasByDoctor(doctorId);
    // };

    public createDiploma = async (userId: string, diploma: IDiplomaCreateDto): Promise<IResponse<IDiplomGetDto | string>> => {
        return await this.repository.createDiploma(userId, diploma);
    };

    // public deleteDiploma = async(diplomId: string): Promise<IResponse<IDiplomGetDto | string | number>> => {
    //     return await this.repository.deleteDiploma(diplomId);
    // };
}

export const diplomasService = new DiplomasService();