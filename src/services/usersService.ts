// import IResponse from "../interfaces/IResponse";
// import IUserDto from "../interfaces/IUserDto";
// import IUserGetDto from "../interfaces/IUserGetDto";
import IResponse from "../interfaces/IResponse";
import IUserCreateDto from "../interfaces/IUser/IUserCreateDto";
import IUserGetDto from "../interfaces/IUser/IUserGetDto";
import { postgresDB, PostgresDB } from "../repository/postgresDb";

export class UsersService {
    private repository: PostgresDB;
    constructor() {
        this.repository = postgresDB;
    }

    public register = async (userDto: IUserCreateDto): Promise<IResponse<IUserGetDto | undefined>> => {
        return await this.repository.register(userDto);
    };

    // public login = async (userDto: IUserDto): Promise<IResponse<{ username: string, token: string } | undefined>> => {
    //     return await this.repository.login(userDto);
    // };
}

export const usersService = new UsersService();