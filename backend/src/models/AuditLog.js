const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AuditLog = sequelize.define("audit_log", {
    log_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: DataTypes.INTEGER,
    action: DataTypes.STRING,
    nama_tabel: DataTypes.STRING,
    data_lama: DataTypes.JSON,
    data_baru: DataTypes.JSON,
    record_id: DataTypes.INTEGER,
    ip_address: DataTypes.STRING,
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "audit_log",
    timestamps: false
});

module.exports = AuditLog;
