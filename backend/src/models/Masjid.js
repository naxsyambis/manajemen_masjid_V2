const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Masjid = sequelize.define("masjid", {
    masjid_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_masjid: DataTypes.STRING,
    alamat: DataTypes.TEXT,
    no_hp: DataTypes.STRING,
    deskripsi: DataTypes.TEXT,
    logo_foto: DataTypes.STRING
}, {
    tableName: "masjid",
    timestamps: false
});

module.exports = Masjid;
