import morganMiddleware from "../config/morganMiddleware";
import express, { Request, Response } from "express";
import sendMail from "../lib/mailer";
import jwt from "jsonwebtoken";

const router = express.Router();

router.use(morganMiddleware);

router.post("/send-set-password-link", (req: Request, res: Response) => {
    try {
        const email = { email: req.body.email };
        const token = jwt.sign(email, `${process.env.MAIL_KEY}`, { expiresIn: "24h" });
        const url = `http://localhost:5173/reset-password?token=${token}`;
        sendMail(url, email);
        res.status(200).send(email);
    } catch (err: unknown) {
        const error = err as Error;
        res.status(500).send(error);
    }
});

router.get("/send-set-password-link", (req: Request, res: Response) => {
    try {
        const token = req.query.token as string;
        jwt.verify(token, `${process.env.MAIL_KEY}`);
        res.status(200).send("Доступ разрешен");
    } catch (err: unknown) {
        res.status(500).send(err);
    }
});

export default router;