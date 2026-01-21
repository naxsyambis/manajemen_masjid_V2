const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Kepengurusan = sequelize.define("kepengurusan", {
    pengurus_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_lengkap: DataTypes.STRING,
    jabatan: DataTypes.STRING,
    periode_mulai: DataTypes.DATE,
    periode_selesai: DataTypes.DATE
}, {
    tableName: "kepengurusan",
    timestamps: false
});

module.exports = Kepengurusan;
