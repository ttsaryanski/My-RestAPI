import Visit from "../../models/gamesPlay/Visit.js";

export const visitService = {
    async create(page, ip) {
        const alreadyVisited = await Visit.findOne({
            page,
            ip,
            timestamp: { $gte: getTodayStart() },
        });

        if (!alreadyVisited) {
            await Visit.create({ page, ip });
        }

        const count = await Visit.countDocuments({ page });
        return count;
    },

    async getStats(query = {}) {
        const page = parseInt(query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const [visits, totalCount] = await Promise.all([
            Visit.find({ page: "home" })
                .sort({ timestamp: -1 })
                .select("ip timestamp")
                .skip(skip)
                .limit(limit),
            Visit.countDocuments(),
        ]);

        const filtered = visits.filter(
            (v) =>
                v.ip !== "::1" &&
                v.ip !== "127.0.0.1" &&
                !v.ip.startsWith("192.168.")
        );

        return { filtered, totalCount };
    },
};

function getTodayStart() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
