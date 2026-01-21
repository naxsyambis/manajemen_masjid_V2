exports.superadminOnly = (req, res, next) => {
    if (req.user.role !== "super admin")
        return res.status(403).json({ message: "Akses ditolak" });
    next();
};

exports.takmirOnly = (req, res, next) => {
    if (req.user.role !== "takmir")
        return res.status(403).json({ message: "Akses ditolak" });
    next();
};
