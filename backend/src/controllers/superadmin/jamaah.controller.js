const Jamaah = require("../../models/Jamaah");

exports.getAll = async (req, res) => {
  try {
    const { masjid_id, status } = req.query;

    const whereClause = {};
    if (masjid_id) {
      whereClause.masjid_id = masjid_id;
    }
    if (status) {
      whereClause.status = status;
    }

    const data = await Jamaah.findAll({
      where: whereClause,
      order: [["jamaah_id", "DESC"]]
    });

    res.status(200).json({
      message: "Berhasil mengambil data jamaah",
      data
    });
  } catch (error) {
    console.error("GET JAMAAH ERROR:", error);
    res.status(500).json({
      message: "Gagal mengambil data jamaah"
    });
  }
};
