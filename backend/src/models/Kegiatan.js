const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("kegiatan_masjid", {
    kegiatan_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_kegiatan: DataTypes.STRING,
    waktu_kegiatan: DataTypes.DATE,
    lokasi: DataTypes.STRING,
    deskripsi: DataTypes.STRING, 
    user_id: DataTypes.INTEGER
}, {
    tableName: "kegiatan_masjid",
    timestamps: false
});
