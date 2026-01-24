const User = require("./User");
const AuditLog = require("./AuditLog");

AuditLog.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(AuditLog, { foreignKey: "user_id" });

module.exports = {
    User,
    AuditLog
};
