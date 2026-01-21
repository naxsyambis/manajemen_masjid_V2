const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("jamaah", {
    jamaah_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama: DataTypes.STRING,
    alamat: DataTypes.TEXT,
    no_hp: DataTypes.STRING,
    jenis_kelamin: DataTypes.STRING,
    peran: DataTypes.STRING,
    status: DataTypes.ENUM("aktif", "tidak aktif"),
    masjid_id: DataTypes.INTEGER
}, {
    tableName: "jamaah",
    timestamps: false
});

