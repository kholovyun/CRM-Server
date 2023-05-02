import IResponse from "../interfaces/IResponse";
import IUserCreateDto from "../interfaces/IUser/IUserCreateDto";
import IUserGetDto from "../interfaces/IUser/IUserGetDto";
import IUserLoginDto from "../interfaces/IUser/IUserLoginDto";
import { postgresDB, PostgresDB } from "../repository/postgresDb";

export class UsersService {
    private repository: PostgresDB;
    constructor() {
        this.repository = postgresDB;
    }

    public register = async (userDto: IUserCreateDto): Promise<IResponse<IUserGetDto | string>> => {
        return await this.repository.register(userDto);
    };

    public login = async (userDto: IUserLoginDto): Promise<IResponse<IUserGetDto | string>> => {
        return await this.repository.login(userDto);
    };
}

export const usersService = new UsersService();