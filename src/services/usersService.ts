import IResponse from "../interfaces/IResponse";
import IUserCreateDto from "../interfaces/IUser/IUserCreateDto";
import IUserGetDto from "../interfaces/IUser/IUserGetDto";
import IUserGetDtoWithToken from "../interfaces/IUser/IUserGetDtoWithToken";
import IUserLoginDto from "../interfaces/IUser/IUserLoginDto";
import { postgresDB, PostgresDB } from "../repository/postgresDb";

export class UsersService {
    private repository: PostgresDB;
    constructor() {
        this.repository = postgresDB;
    }

    public register = async (userDto: IUserCreateDto): Promise<IResponse<IUserGetDtoWithToken | string>> => {
        return await this.repository.register(userDto);
    };

    public getUsers = async (): Promise<IResponse<IUserGetDto[] | string>> => {
        return await this.repository.getUsers();
    };

    public login = async (userDto: IUserLoginDto): Promise<IResponse<IUserGetDtoWithToken | string>> => {
        return await this.repository.login(userDto);
    };
}

export const usersService = new UsersService();