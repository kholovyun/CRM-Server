import IResponse from "../interfaces/IResponse";
import ISetPasswordData from "../interfaces/ISetPasswordData";
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

    public getUserByid = async (userId: string): Promise<IResponse<IUserGetDto | string>> => {
        return await this.repository.getUserByid(userId);
    };

    public login = async (userDto: IUserLoginDto): Promise<IResponse<IUserGetDtoWithToken | string>> => {
        return await this.repository.login(userDto);
    };

    public editUser = async (userDto: IUserCreateDto, userId: string): Promise<IResponse<IUserGetDto | string>> => {
        return await this.repository.editUser(userDto, userId);
    };

    public setPassword = async (data: ISetPasswordData): Promise<IResponse<string>> => {
        return await this.repository.setPassword(data);
    };
}

export const usersService = new UsersService();