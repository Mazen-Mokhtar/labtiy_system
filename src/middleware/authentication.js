import { messageSystem, verifyToken } from "../utils/index.js";

export const authorization = (req, res, next) => {
    try {
        let { authorization } = req.headers
        if (!authorization) {
            return next(new Error("authorization is required", { cause: 400 }));
        }
        authorization = authorization.split(" ")
        if (authorization[0] === "admin") {
            authorization = verifyToken({ token: authorization[1], signature: process.env.SIGNATURE_ADMIN });
        } else if (authorization[0] === "restCode") {
            authorization = verifyToken({ token: authorization[1], signature: process.env.SIGNATURE_REST_CODE });
        } else {
            authorization = verifyToken({ token: authorization[1] })
        }
        if (authorization.error) return next(new Error(messageSystem.user.token, { cause: 400 }))
        req.data = authorization;
        return next();
    } catch (error) {
        return next(error);
    }

}