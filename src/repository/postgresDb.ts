import dotenv from "dotenv";
import path from "path";
import { Sequelize } from "sequelize-typescript";
import IResponse from "../interfaces/IResponse";
import IUserGetDto from "../interfaces/IUser/IUserGetDto";
import IUserCreateDto  from "../interfaces/IUser/IUserCreateDto";
import { User } from "../models/User";
import { generateJWT } from "../helpers/generateJWT";
dotenv.config();

export class PostgresDB {

    private sequelize: Sequelize;

    constructor() {
        this.sequelize = new Sequelize({
            database: process.env.PG_DB,
            dialect: "postgres",
            host: process.env.PG_HOST,
            username: process.env.PG_USER,
            password: process.env.PG_PASS,
            storage: ":memory",
            models: [path.join(__dirname, "../models")]
        });
    }

    public getSequelize = (): Sequelize => {
        return this.sequelize;
    };

    public close = async (): Promise<void> => {
        await this.sequelize.close();
    };

    public init = async (): Promise<void> => {
        try {
            await this.sequelize.authenticate();
            await this.sequelize.sync({
                alter: true
            });
            console.log("DB postgres is connected");
        } catch (err: unknown) {
            const error = err as Error;
            console.log(error.message);
        }
    };

    public register = async (userDto: IUserCreateDto): Promise<IResponse<IUserGetDto | undefined>> => {
        try {
            console.log(userDto);
            const user = await User.create({...userDto});
            const userWithToken: IUserGetDto = {...user.dataValues, token: generateJWT({email: userDto.email, password: userDto.password})};
            return {
                status: "Created",
                message: "New user created",
                result: userWithToken,
            };
        } catch (err: unknown) {
            const error = err as Error;
            return {
                status: "Bad Request",
                message: error.message,
                result: undefined,
            };
        }
    };
}

export const postgresDB = new PostgresDB();