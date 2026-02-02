// backend/controllers/public/public.controller.js
const Masjid = require("../../models/Masjid");
const Jamaah = require("../../models/Jamaah");
const Berita = require("../../models/Berita");
const Program = require("../../models/Program");
const Kegiatan = require("../../models/Kegiatan");
const Kepengurusan = require("../../models/Kepengurusan");
const Keuangan = require("../../models/Keuangan");      
const Inventaris = require("../../models/Inventaris"); 
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

exports.getKeuangan = async (req, res) => {
    try {
        const { masjid_id } = req.query;

        if (!masjid_id) {
            return res.status(400).json({
                message: "masjid_id wajib diisi"
            });
        }

        const data = await Keuangan.findAll({
            where: { masjid_id },
            order: [["tanggal", "DESC"]],
        });

        res.json({
            message: "Data keuangan berhasil diambil",
            data
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getInventaris = async (req, res) => {
    try {
        const { masjid_id } = req.query;

        if (!masjid_id) {
            return res.status(400).json({
                message: "masjid_id wajib diisi"
            });
        }

        const data = await Inventaris.findAll({
            where: { masjid_id },
            order: [["nama_barang", "ASC"]],
        });

        res.json({
            message: "Data inventaris berhasil diambil",
            data
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
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

// Tambah fungsi getBeritaById untuk detail berita
exports.getBeritaById = async (req, res) => {
    const data = await Berita.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Berita tidak ditemukan" });
    res.json(data);
};