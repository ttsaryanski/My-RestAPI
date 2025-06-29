import { cookiesNames } from "../../config/constans.js";

export const getTokenFromRequest = (req) => {
    const path = req.originalUrl;

    if (path.includes("/cooking")) {
        const cookie = req.cookies[cookiesNames.cookingTogether];

        return typeof cookie === "string" ? cookie : cookie?.accessToken;
    }

    if (path.includes("/class")) {
        const cookie = req.cookies[cookiesNames.classBook];

        return typeof cookie === "string" ? cookie : cookie?.accessToken;
    }
    if (path.includes("/games_play")) {
        const cookie = req.cookies[cookiesNames.gamesPlay];

        return typeof cookie === "string" ? cookie : cookie?.accessToken;
    }

    return null;
};
