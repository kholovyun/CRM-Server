import { IMessage } from "../interfaces/IMessage";
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

    public getUsers = async (userId: string): Promise<IResponse<IUserGetDto[] | string>> => {
        return await this.repository.getUsers(userId);
    };

    public getUserByid = async (seekerId: string, userId: string): Promise<IResponse<IUserGetDto | string>> => {
        return await this.repository.getUserByid(seekerId, userId);
    };

    public login = async (userDto: IUserLoginDto): Promise<IResponse<IUserGetDtoWithToken | IMessage>> => {
        return await this.repository.login(userDto);
    };

    public editUser = async (userDto: IUserCreateDto, userId: string): Promise<IResponse<IUserGetDto | string>> => {
        return await this.repository.editUser(userDto, userId);
    };

    public setPassword = async (data: ISetPasswordData): Promise<IResponse<IMessage>> => {
        return await this.repository.setPassword(data);
    };

    public blockUser = async (adminId: string, userId:string): Promise<IResponse<IUserGetDto | string>> => {
        return await this.repository.blockUser(adminId, userId);
    };
}

export const usersService = new UsersService();