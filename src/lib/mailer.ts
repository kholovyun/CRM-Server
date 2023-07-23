import { NodemailerExpressHandlebarsOptions } from "nodemailer-express-handlebars";
import hbs from "nodemailer-express-handlebars";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { IMail } from "../interfaces/IMail";

dotenv.config();

const myEmail = "testteamtest22@mail.ru";
// const myEmail = "bumer_boy86@mail.ru";

const sendMail = async (data: IMail) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.mail.ru",
        port: 465,
        secure: true,
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