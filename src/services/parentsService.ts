import IParentCreateDto from "../interfaces/IParent/IParentCreateDto";
import IParentGetDto from "../interfaces/IParent/IParentGetDto";
import IResponse from "../interfaces/IResponse";
import { postgresDB, PostgresDB } from "../repository/postgresDb";

export class ParentsService {
    private repository: PostgresDB;
    constructor() {
        this.repository = postgresDB;
    }

    public getParents = async (userId: string): Promise<IResponse<IParentGetDto[] | string>> => {
        return await this.repository.getParents(userId);
    };

    public getParentById = async (userId: string, id: string): Promise<IResponse<IParentGetDto | string>> => {
        return await this.repository.getParentById(userId, id);
    };

    public createParent = async (userId: string, parent: IParentCreateDto): Promise<IResponse<IParentGetDto | string>> => {
        return await this.repository.createParent(userId, parent);
    };
}

export const parentsService = new ParentsService();