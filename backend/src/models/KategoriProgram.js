const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const KategoriProgram = sequelize.define("kategori_program", {
    kategori_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_kategori: { type: DataTypes.STRING, allowNull: false },
    masjid_id: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: "kategori_program",
    timestamps: false
});

module.exports = KategoriProgram;