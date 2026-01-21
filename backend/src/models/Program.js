const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("program_masjid", {
    program_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_program: DataTypes.STRING,
    jadwal_rutin: DataTypes.STRING,
    deskripsi: DataTypes.TEXT,
    user_id: DataTypes.INTEGER
}, {
    tableName: "program_masjid",
    timestamps: false
});
