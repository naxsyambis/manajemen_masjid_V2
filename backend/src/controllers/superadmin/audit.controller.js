const AuditLog = require("../../models/AuditLog");
const User = require("../../models/User");

exports.getAll = async (req, res) => {
    try {
        const logs = await AuditLog.findAll({
            include: [
                {
                    model: User,
                    attributes: ["user_id", "nama", "email", "role"]
                }
            ],
            order: [["created_at", "DESC"]],
            limit: 100
        });

        res.json({
            message: "Data audit log berhasil diambil",
            data: logs
        });
    } catch (error) {
        console.error("GET AUDIT LOG ERROR:", error);
        res.status(500).json({
            message: "Gagal mengambil audit log"
        });
    }
};
