import { cookiesNames } from "../../config/constans.js";

export const getTokenFromRequest = (req) => {
    const path = req.originalUrl;

    if (path.includes("/cooking"))
        return req.cookies[cookiesNames.cookingTogether]?.accessToken;
    if (path.includes("/class"))
        return req.cookies[cookiesNames.classBook]?.accessToken;
    if (path.includes("/games_play"))
        return req.cookies[cookiesNames.gamesPlay]?.accessToken;

    return null;
};
