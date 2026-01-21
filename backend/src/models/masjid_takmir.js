const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MasjidTakmir = sequelize.define("masjid_takmir", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: DataTypes.INTEGER,
    masjid_id: DataTypes.INTEGER,
    pembuatakun: DataTypes.INTEGER,
    created_at: DataTypes.DATE
}, {
    tableName: "masjid_takmir",
    timestamps: false
});

module.exports = MasjidTakmir;
