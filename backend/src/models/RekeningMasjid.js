const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RekeningMasjid = sequelize.define("rekening_masjid", {
    rekening_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    masjid_id: { type: DataTypes.INTEGER, allowNull: false },
    nama_bank: { type: DataTypes.STRING, allowNull: false },
    no_rekening: { type: DataTypes.STRING, allowNull: false },
    atas_nama: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
    tableName: "rekening_masjid",
    timestamps: false
});

module.exports = RekeningMasjid;