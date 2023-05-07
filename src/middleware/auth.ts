import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import { ReasonPhrases, StatusCodes } from "http-status-codes";

export const auth = (expressReq: Request, res: Response, next: NextFunction) => {
    const req = expressReq as IRequestWithTokenData;
    if (req.method === "OPTIONS") {
        next();
    }
    try {
        const data = jwt.verify(req.get("Authorization") || "", process.env.SECRET_KEY || "");
        if (data) {
            req.dataFromToken = data;
            next();
        } else {
            res.status(StatusCodes.UNAUTHORIZED,).send(ReasonPhrases.UNAUTHORIZED);
        }
    } catch (err: unknown){
        const error = err as Error;
        res.status(StatusCodes.UNAUTHORIZED).send(error.message);
    }
};