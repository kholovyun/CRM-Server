import express, { Request, Response } from "express";
import sendMail from "../lib/mailer";
import jwt from "jsonwebtoken";
import morganMiddleware from "../config/morganMiddleware";

const router = express.Router();

router.use(morganMiddleware);

router.post("/send-set-password-link", (req: Request, res: Response) => {
    try {
        const email = req.body.email;
        const token = jwt.sign({ email: email }, `${process.env.MAIL_KEY}`, { expiresIn: "24h" });
        const url = `http://localhost:8000/send-set-password-link?token=${token}`;
        sendMail(url, email);
        res.status(200).send(email);
    } catch (err: unknown) {
        res.status(500).send(err);
    }
});

router.get("/send-set-password-link", (req: Request, res: Response) => {
    try {
        const token = req.query.token as string;
        jwt.verify(token, `${process.env.MAIL_KEY}`);
        res.status(200).redirect(`http://localhost:5173/reset-password?token=${token}`);
    } catch (err: unknown) {
        res.status(500).send(err);
    }
});

export default router;
