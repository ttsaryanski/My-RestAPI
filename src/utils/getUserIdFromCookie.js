import jwt from "../lib/jwt.js";

export const getUserIdFromCookie = async (req, cookieName) => {
    const token = req.cookies[cookieName]?.accessToken;

    if (!token) return null;

    try {
        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        return decoded._id || null;
    } catch (err) {
        return null;
    }
};
