export function realIp(req, res, next) {
    const xForwardedFor = req.headers["x-forwarded-for"];
    const rawIp = xForwardedFor ? xForwardedFor.split(",")[0].trim() : req.ip;

    req.realIp = rawIp.replace(/^::ffff:/, "");
    next();
}
