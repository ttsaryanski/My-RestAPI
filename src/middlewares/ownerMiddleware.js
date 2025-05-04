const isOwner = (model, idParam = "id") => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params[idParam];
            const userId = req.user._id;

            const resource = await model.findById(resourceId);
            if (!resource) {
                return res.status(404).json({ message: "Resource not found" });
            }

            if (resource._ownerId.toString() !== userId) {
                return res.status(403).json({
                    message: "You are not the owner of this resource",
                });
            }

            next();
        } catch (err) {
            res.status(500).json({ message: "Server error test" });
        }
    };
};

export default isOwner;
