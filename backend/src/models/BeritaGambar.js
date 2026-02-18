const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

module.exports = sequelize.define("berita_gambar", {
  gambar_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  berita_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  path_gambar: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: "berita_gambar",
  timestamps: false
});
