const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Inventaris = sequelize.define("inventaris", {
    inventaris_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_barang: DataTypes.STRING,
    jumlah: DataTypes.INTEGER,
    kondisi: DataTypes.ENUM("baik", "rusak", "hilang"),
    keterangan: DataTypes.TEXT,
    user_id: DataTypes.INTEGER,
    masjid_id: DataTypes.INTEGER
}, {
    tableName: "inventaris",
    timestamps: false
});

module.exports = Inventaris;
