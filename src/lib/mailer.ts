import { NodemailerExpressHandlebarsOptions } from "nodemailer-express-handlebars";
import hbs from "nodemailer-express-handlebars";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { IMail } from "../interfaces/IMail";

dotenv.config();

const myEmail = process.env.EMAIL;

const sendMail = async (data: IMail) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: 587,
        secure: false,
        auth: {
            user: myEmail,
            pass: process.env.CLIENT_SECRET
        },
    });

    const mailOptions = {
        from: `'Заботик' Мед.Сервис ${myEmail}`,
        to: data.recipient,
        subject: data.theme,
        template: "email",
        context: {
            msg: data.link,
        },
    };

    const handlebarOptions: NodemailerExpressHandlebarsOptions = {
        viewEngine: {
            partialsDir: path.resolve("./src/views/"),
            defaultLayout: false,
        },
        viewPath: path.resolve("./src/views/"),
    };

    transporter.use("compile", hbs(handlebarOptions));

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log("Сообщение отправлено: " + info.response);
        }
        transporter.close();
    });
};

export default sendMail;