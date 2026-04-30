const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const StrukturOrganisasi = sequelize.define("struktur_organisasi", {
    struktur_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nama: {
        type: DataTypes.STRING,
        allowNull: false
    },
    jabatan: {
        type: DataTypes.STRING,
        allowNull: false
    },
    masjid_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    periode_mulai: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    periode_selesai: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    foto: {
        type: DataTypes.STRING,
        allowNull: true
    },
    ttd: { 
        type: DataTypes.STRING,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: "struktur_organisasi",
    timestamps: false
});

module.exports = StrukturOrganisasi;