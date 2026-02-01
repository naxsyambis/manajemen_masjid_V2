const User = require("./User");
const Masjid = require("./Masjid");
const MasjidTakmir = require("./masjid_takmir");
const AuditLog = require("./AuditLog");

MasjidTakmir.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "user_id",
  as: "user"
});

User.hasMany(MasjidTakmir, {
  foreignKey: "user_id",
  sourceKey: "user_id",
  as: "takmirs"
});

MasjidTakmir.belongsTo(Masjid, {
  foreignKey: "masjid_id",
  targetKey: "masjid_id",
  as: "masjid"
});

Masjid.hasMany(MasjidTakmir, {
  foreignKey: "masjid_id",
  sourceKey: "masjid_id",
  as: "takmirs"
});


AuditLog.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(AuditLog, { foreignKey: "user_id" });

module.exports = {
    User,
    Masjid,
    MasjidTakmir,
    AuditLog
};
