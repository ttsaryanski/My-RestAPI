import jwt from "../lib/jwt.js";
import InvaliToken from "../models/InvalidToken.js";

const authMiddleware = async (req, res, next) => {
    let token;
    if (req.path.includes("/coocking")) {
        token = req.cookies["auth_coocking"]?.accessToken;
    } else {
        token = req.cookies["auth"]?.accessToken;
    }

    if (!token) {
        return res.status(401).send({ message: "Invalid token!" }).end();
    }

    try {
        const invalidToken = await InvaliToken.findOne({ token });

        if (invalidToken) {
            return res.status(403).send({ message: "Invalid token!" }).end();
        }

        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

        req.user = decodedToken;
        req.isAuthenticated = true;

        next();
    } catch (error) {
        res.clearCookie("auth")
            .clearCookie("auth_coocking")
            .status(401)
            .send({ message: "Token verification failed" })
            .end();
    }
};

export { authMiddleware };
