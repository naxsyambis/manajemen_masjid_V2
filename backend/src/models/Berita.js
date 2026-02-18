const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("berita_masjid", {
  berita_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  judul: {
    type: DataTypes.STRING,
    allowNull: false
  },

  isi: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  tanggal: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },

  gambar: {
    type: DataTypes.STRING,
    allowNull: true
  },

  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  masjid_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  status: {
    type: DataTypes.ENUM(
      "draft",
      "menunggu",
      "disetujui",
      "ditolak",
      "dipublikasi"
    ),
    defaultValue: "draft"
  },

  approved_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },

  approved_at: {
    type: DataTypes.DATE,
    allowNull: true
  },

  published_at: {
    type: DataTypes.DATE,
    allowNull: true
  }

}, {
  tableName: "berita_masjid",
  timestamps: false
});
