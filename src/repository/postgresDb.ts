import dotenv from "dotenv";
import path from "path";
import { Sequelize } from "sequelize-typescript";
import IResponse from "../interfaces/IResponse";
import IUserGetDtoWithToken from "../interfaces/IUser/IUserGetDtoWithToken";
import IUserCreateDto  from "../interfaces/IUser/IUserCreateDto";
import { User } from "../models/User";
import { generateJWT } from "../helpers/generateJWT";
import IUserLoginDto from "../interfaces/IUser/IUserLoginDto";
import { StatusCodes } from "http-status-codes";
import { checkPassword } from "../helpers/checkPassword";
import IUserGetDto from "../interfaces/IUser/IUserGetDto";
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

    // ПОЛЬЗОВАТЕЛИ

    public getUsers = async (): Promise<IResponse<IUserGetDto[] | string>> => {
        try {
            const foundUsers = await User.findAll({raw: true});
            return {
                status: StatusCodes.CREATED,
                result: foundUsers
            };
        } catch (err: unknown) {
            const error = err as Error;
            return {
                status: StatusCodes.BAD_REQUEST,
                result: error.message,
            };
        }
    };

    public register = async (userDto: IUserCreateDto): Promise<IResponse<IUserGetDtoWithToken | string>> => {
        try {
            const userExists = await User.findOne({where: {
                email: userDto.email
            }});
            if (userExists) throw new Error("User by this email already exists");

            const user = await User.create({...userDto});
            delete user.dataValues.password;
            const userWithToken: IUserGetDtoWithToken = {...user.dataValues, token: generateJWT({id: user.dataValues.id, email: user.dataValues.email})};
            
            return {
                status: StatusCodes.CREATED,
                result: userWithToken
            };
        } catch (err: unknown) {
            const error = err as Error;
            return {
                status: StatusCodes.BAD_REQUEST,
                result: error.message,
            };
        }
    };

    public login = async (userDto: IUserLoginDto): Promise<IResponse<IUserGetDtoWithToken | string>> => {
        try {
            const foundUser = await User.findOne({where: {email: userDto.email}});
            
            if (!foundUser) throw new Error("User is not found!");
            
            const isMatch: boolean = await checkPassword(userDto.password, foundUser);
            if (!isMatch) throw new Error("Wrong password!");
            const user =  foundUser.dataValues;
            delete user.password;
            const userWithToken: IUserGetDtoWithToken = {...user, token: generateJWT({id: user.id, email: user.email})};
            
            return {
                status: StatusCodes.OK,
                result: userWithToken,
            };
        } catch (err: unknown) {
            const error = err as Error;
            return {
                status: StatusCodes.UNAUTHORIZED,
                result: error.message,
            };
        }
    };
}

export const postgresDB = new PostgresDB();