const Masjid = require("../../models/Masjid");
const Jamaah = require("../../models/Jamaah");
const Berita = require("../../models/Berita");
const Program = require("../../models/Program");
const Kegiatan = require("../../models/Kegiatan");
const Kepengurusan = require("../../models/Kepengurusan");
const prayerService = require("../../services/prayer.service");

/* LIST MASJID */
exports.listMasjid = async (req, res) => {
    res.json(await Masjid.findAll());
};

/* DETAIL MASJID */
exports.detailMasjid = async (req, res) => {
    const masjid_id = req.params.id;

    const masjid = await Masjid.findByPk(masjid_id);
    if (!masjid) {
        return res.status(404).json({ message: "Masjid tidak ditemukan" });
    }

    const jamaah = await Jamaah.findAll({
        where: { masjid_id },
        attributes: ["jamaah_id", "nama", "jenis_kelamin", "status"]
    });

    res.json({
        masjid,
        jamaah
    });
};

/* BERITA UMUM */
exports.getBerita = async (req, res) => {
    res.json(await Berita.findAll({ order: [["tanggal", "DESC"]] }));
};

/* PROGRAM UMUM */
exports.getProgram = async (req, res) => {
    res.json(await Program.findAll());
};

/* KEGIATAN UMUM */
exports.getKegiatan = async (req, res) => {
    res.json(await Kegiatan.findAll());
};

/* KEPENGURUSAN */
exports.getKepengurusan = async (req, res) => {
    res.json(await Kepengurusan.findAll());
};

/* JADWAL SHOLAT */
exports.getJadwalSholat = async (req, res) => {
  try {
    const kotaId = req.query.kota_id;
    const data = await prayerService.getTodayPrayerSchedule(kotaId);

    res.json({ success: true, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
