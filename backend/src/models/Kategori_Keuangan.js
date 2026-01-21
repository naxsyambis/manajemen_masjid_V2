const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("kategori_keuangan", {
    kategori_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_kategori: DataTypes.STRING,
    jenis: DataTypes.ENUM("pemasukan", "pengeluaran"),
    masjid_id: DataTypes.INTEGER
}, {
    tableName: "kategori_keuangan",
    timestamps: false
});

