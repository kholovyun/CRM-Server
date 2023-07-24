import Queue, { Job } from "bull";
import sendMail from "./mailer";
import { IMail } from "../interfaces/IMail";

const sendMailQueue = new Queue("sendMail", {
    redis: {
        host: "my-redis-container",
        port: 6379,
    },
});

sendMailQueue.process(async (job: Job<IMail>) => {
    await sendMail(job.data);
});

export default sendMailQueue;