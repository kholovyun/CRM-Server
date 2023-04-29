import express, { Express } from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

class App {

    private app: Express;

    constructor() {
        this.app = express();
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.static("public"));
        this.app.use(express.json());
        this.app.use(cors());
    }

    public init = async (): Promise<void> => {
        try {
            this.app.listen(process.env.APP_PORT, () => {
                console.log(`Server is running on port ${process.env.APP_PORT}`);
            });
        } catch (err: unknown) {
            const error = err as Error;
            console.log(`Server error: ${error.message}`);
        }
    };
}

const app = new App();

app.init()
    .then(() => {
        console.log("Server is OK");
    }).catch(() => {
        console.log("Server is NOT OK");
    });