const Masjid = require("../../models/Masjid");
const Jamaah = require("../../models/Jamaah");
const Berita = require("../../models/Berita");
const Program = require("../../models/Program");
const Kegiatan = require("../../models/Kegiatan");
const Kepengurusan = require("../../models/Kepengurusan");
const prayerService = require("../../services/prayer.service");

exports.listMasjid = async (req, res) => {
    res.json(await Masjid.findAll());
};


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


exports.getBerita = async (req, res) => {
    res.json(await Berita.findAll({ order: [["tanggal", "DESC"]] }));
};


exports.getProgram = async (req, res) => {
    res.json(await Program.findAll());
};


exports.getKegiatan = async (req, res) => {
    res.json(await Kegiatan.findAll());
};


exports.getKepengurusan = async (req, res) => {
    res.json(await Kepengurusan.findAll());
};


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
