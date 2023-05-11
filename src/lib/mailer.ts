import { NodemailerExpressHandlebarsOptions } from "nodemailer-express-handlebars";
import { IEmailFromTokem } from "../interfaces/IEmailFromTokem";
import hbs from "nodemailer-express-handlebars";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const myEmail = "testteamtest22@mail.ru";

const sendMail = async (link: string, recipient: IEmailFromTokem) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.mail.ru",
        port: 465,
        secure: true,
        auth: {
            user: myEmail,
            pass: "yVvG2Z8nA7vJCPnjFGt2"
        },
    });

    const mailOptions = {
        from: `Doctors Service ${myEmail}`,
        to: recipient.email,
        subject: "Восстановление пароля",
        template: "email",
        context: {
            msg: `Ссылка для установки пароля2: ${link}`,
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