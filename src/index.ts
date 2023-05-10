import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";
import Logger from "./lib/logger";
import router from "./routes/setPassword";
import { postgresDB } from "./repository/postgresDb";
import { UsersController } from "./controllers/usersController";
import { DoctorsController } from "./controllers/doctorsController";
import { ParentsController } from "./controllers/parentsController";
import { DiplomasControllers } from "./controllers/diplomasController";

dotenv.config();

class App {
    private app: Express;

    constructor() {
        this.app = express();
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static("public"));
        this.app.use(express.json());
        this.app.use(cors());
        this.app.use(router);
    }

    public init = async (): Promise<void> => {
        try {
            this.app.listen(process.env.APP_PORT, () => {
                Logger.info(`Server is running on port ${process.env.APP_PORT}`);
            });
            postgresDB.init();
            this.app.use("/users", new UsersController().getRouter());
            this.app.use("/doctors", new DoctorsController().getRouter());
            this.app.use("/parents", new ParentsController().getRouter());
            this.app.use("/diplomas", new DiplomasControllers().getRouter());
        } catch (err: unknown) {
            const error = err as Error;
            Logger.error(`Server error: ${error.message}`);
        }
    };
}

const app = new App();

app.init()
    .then(() => {
        Logger.info("Server is OK");
    })
    .catch(() => {
        Logger.error("Server is NOT OK");
    });
