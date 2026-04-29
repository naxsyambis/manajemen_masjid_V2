const User = require("./User");
const Masjid = require("./Masjid");
const MasjidTakmir = require("./masjid_takmir");
const AuditLog = require("./AuditLog");
const Berita = require("./Berita");
const BeritaGambar = require("./BeritaGambar");
const Program = require("./Program");
const KategoriProgram = require("./KategoriProgram");
const RekeningMasjid = require("./RekeningMasjid");

Berita.hasMany(BeritaGambar, {
  foreignKey: "berita_id",
  as: "gambar_list",
  onDelete: "CASCADE"
});
BeritaGambar.belongsTo(Berita, { foreignKey: "berita_id" });

MasjidTakmir.belongsTo(User, { foreignKey: "user_id", targetKey: "user_id", as: "user" });
User.hasMany(MasjidTakmir, { foreignKey: "user_id", sourceKey: "user_id", as: "takmirs" });

MasjidTakmir.belongsTo(Masjid, { foreignKey: "masjid_id", targetKey: "masjid_id", as: "masjid" });
Masjid.hasMany(MasjidTakmir, { foreignKey: "masjid_id", sourceKey: "masjid_id", as: "takmirs" });

AuditLog.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(AuditLog, { foreignKey: "user_id" });

KategoriProgram.hasMany(Program, { foreignKey: "kategori_id", as: "programs" });
Program.belongsTo(KategoriProgram, { foreignKey: "kategori_id", as: "kategori_program" });

Masjid.hasMany(RekeningMasjid, { foreignKey: "masjid_id", as: "rekening", onDelete: "CASCADE" });
RekeningMasjid.belongsTo(Masjid, { foreignKey: "masjid_id", as: "masjid" });

Masjid.hasMany(KategoriProgram, { foreignKey: "masjid_id", as: "kategori_program_list", onDelete: "CASCADE" });
KategoriProgram.belongsTo(Masjid, { foreignKey: "masjid_id", as: "masjid" });

module.exports = {
    User,
    Masjid,
    MasjidTakmir,
    AuditLog,
    Berita,
    BeritaGambar,
    Program,
    KategoriProgram,
    RekeningMasjid
};