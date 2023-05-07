import IRequestWithTokenData from "../interfaces/IRequestWithTokenData";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ERoles } from "../enums/ERoles";
import jwt from "jsonwebtoken";

export const permission = (roles?: ERoles[]) => {
    return (expressReq: Request, res: Response, next: NextFunction) => {
        const req = expressReq as IRequestWithTokenData;
        if (req.method === "OPTIONS") next();
        try {
            const data = jwt.verify(req.get("Authorization") || "", process.env.SECRET_KEY || "") as {role: ERoles};
            if (roles && !roles.includes(data.role)) throw new Error("You don't have any permission");
            req.dataFromToken = data;
            next();
        } catch (err: unknown){
            const error = err as Error;
            res.status(StatusCodes.UNAUTHORIZED).send(error.message);
        }
    };
};