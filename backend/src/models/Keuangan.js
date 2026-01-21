const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Keuangan = sequelize.define("keuangan", {
    keuangan_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    jumlah: DataTypes.DECIMAL,
    tanggal: DataTypes.DATE,
    deskripsi: DataTypes.TEXT,
    user_id: DataTypes.INTEGER,
    kategori_id: DataTypes.INTEGER,
    masjid_id: DataTypes.INTEGER
}, {
    tableName: "keuangan",
    timestamps: false
});

module.exports = Keuangan;
