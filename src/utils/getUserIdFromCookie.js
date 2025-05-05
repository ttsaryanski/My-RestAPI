import jwt from "../lib/jwt.js";

export const getUserIdFromCookie = async (req) => {
    const token =
        req.cookies["auth_cooking"]?.accessToken ||
        req.cookies["auth"]?.accessToken ||
        req.cookies["auth_GamesPlay"]?.accessToken;

    if (!token) return null;

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        return decoded._id || null;
    } catch (err) {
        return null;
    }
};
