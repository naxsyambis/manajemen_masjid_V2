const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("berita_masjid", {
    berita_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    judul: DataTypes.STRING,
    isi: DataTypes.TEXT,
    tanggal: DataTypes.DATE,
    gambar: DataTypes.STRING,
    user_id: DataTypes.INTEGER
}, {
    tableName: "berita_masjid",
    timestamps: false
});
