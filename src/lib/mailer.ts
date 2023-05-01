import nodemailer from "nodemailer";
import path from "path";
import { google } from "googleapis";
import hbs from "nodemailer-express-handlebars";
import * as SMTPTransport from "nodemailer/lib/smtp-transport";
import { NodemailerExpressHandlebarsOptions } from "nodemailer-express-handlebars";
import dotenv from "dotenv";

dotenv.config();

const oAuth2 = google.auth.OAuth2;
const oAuth2_client = new oAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
const myGmail = "bolatovalen@gmail.com";

oAuth2_client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN,
});

const sendMail = (name: string, recipient: string) => {
    const accessToken: any = oAuth2_client.getAccessToken();

    const nodemailerOptions: SMTPTransport.Options = {
        service: "gmail",
        auth: {
            type: "OAuth2",
            user: myGmail,
            clientId: process.env.CLIENT_ID,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken,
            clientSecret: process.env.CLIENT_SECRET,
        },
    };

    const transport = nodemailer.createTransport(nodemailerOptions);

    const mail_options = {
        from: `From Alen Bolatov ${myGmail}`,
        to: recipient,
        subject: "Сообщение от меня",
        template: "email",
        context: {
            name: "Ваше имя будет тут",
        },
    };

    const handlebarOptions: NodemailerExpressHandlebarsOptions = {
        viewEngine: {
            partialsDir: path.resolve("./src/views/"),
            defaultLayout: false,
        },
        viewPath: path.resolve("./src/views/"),
    };

    transport.use("compile", hbs(handlebarOptions));

    transport.sendMail(mail_options, (error, result) => {
        if (error) {
            console.log(error);
        } else {
            console.log(result);
        }
        transport.close();
    });
};

export default sendMail;
