const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("user_app", {
  user_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nama: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  role: DataTypes.ENUM("super admin", "takmir"),
  foto_tanda_tangan: DataTypes.STRING
}, {
  tableName: "user_app",
  timestamps: false
});

module.exports = User;
