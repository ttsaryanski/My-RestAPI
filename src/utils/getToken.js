export const getTokenFromRequest = (req) => {
    const path = req.originalUrl;

    if (path.includes("/coocking"))
        return req.cookies["auth_cooking"]?.accessToken;
    if (path.includes("/class")) return req.cookies["auth"]?.accessToken;
    if (path.includes("/games_play"))
        return req.cookies["auth_GamesPlay"]?.accessToken;

    return null;
};
