import request from "supertest";
import express, { Express } from "express";
import IUserCreateDto from "../interfaces/IUser/IUserCreateDto";
import { UsersController } from "../controllers/usersController";
import { ERoles } from "../enums/ERoles";
import { PostgresDB } from "../repository/postgresDb";


describe("/users registration route", () => {
    let app: Express;

    const db = PostgresDB;
    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use("/users", new UsersController().getRouter());
    });

    it("should register a new user", async () => {
        const newUser: IUserCreateDto = {
            "role": ERoles.DOCTOR,
            "email": "doct.yuncc@gmail.com",
            "phone": "877777777",
            "name": "Doc",
            "surname": "Kholov",
            "patronim": "string"
        };
        const response = await request(app)
            .post("/users")
            .send(newUser)
            .expect(201);

        expect(response.body).toEqual(expect.objectContaining(newUser));
    });
});