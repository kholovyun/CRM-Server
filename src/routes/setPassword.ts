import express, { Request, Response } from "express";
import sendMail from "../lib/mailer";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/set-password", (req: Request, res: Response) => {
    try {
        const email = req.body.email;
        const token = jwt.sign({ email }, "key1", { expiresIn: "24h" });
        const url = `http://localhost:8000/set-password?token=${token}`;
        sendMail(url, email);
        res.send(email);
    } catch (err: unknown) {
        res.status(500).send(err);
    }
});

router.get("/set-password", (req: Request, res: Response) => {
    try {
        const token = req.query.token as string;
        jwt.verify(token, "key1");

        res.status(200).send("Success");
    } catch (err: unknown) {
        res.status(500).send(err);
    }
});

export default router;
