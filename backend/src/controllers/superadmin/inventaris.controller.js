const Inventaris = require("../../models/Inventaris");

exports.getAll = async (req, res) => {
  try {
    const { masjid_id } = req.query;

    const whereClause = {};
    if (masjid_id) {
      whereClause.masjid_id = masjid_id;
    }

    const data = await Inventaris.findAll({
      where: whereClause,
      order: [["inventaris_id", "DESC"]]
    });

    res.status(200).json({
      message: "Berhasil mengambil data inventaris",
      data
    });
  } catch (error) {
    console.error("GET INVENTARIS ERROR:", error);
    res.status(500).json({
      message: "Gagal mengambil data inventaris"
    });
  }
};
