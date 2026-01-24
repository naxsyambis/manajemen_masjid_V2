const { Op } = require("sequelize");
const Keuangan = require("../../models/Keuangan");
const Kategori = require("../../models/Kategori_Keuangan");
const Masjid = require("../../models/Masjid");
const User = require("../../models/User");
const ReportService = require("../../services/generate.pdf");

exports.create = async (req, res) => {
    const data = await Keuangan.create({
        jumlah: req.body.jumlah,
        tanggal: req.body.tanggal,
        deskripsi: req.body.deskripsi,
        kategori_id: req.body.kategori_id,
        user_id: req.user.user_id,
        masjid_id: req.user.masjid_id
    });
    res.json(data);
}; ////nambahin filtering constrain
// ini di filteringnya database(kesimpulan sekarang pakai di keuangan aja ) alter tanggalnya 5 hari sblum sampai hari ini.
// controller keuangan nambahin filter.

exports.getAll = async (req, res) => {
    const data = await Keuangan.findAll({
        where: { masjid_id: req.user.masjid_id }
    });
    res.json(data);
};

exports.getById = async (req, res) => {
    const data = await Keuangan.findOne({
        where: {
            keuangan_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!data) {
        return res.status(404).json({ message: "Data keuangan tidak ditemukan" });
    }

    res.json(data);
};

exports.update = async (req, res) => {
    const updated = await Keuangan.update(req.body, {
        where: {
            keuangan_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (updated[0] === 0) {
        return res.status(404).json({ message: "Data keuangan tidak ditemukan" });
    }

    res.json({ message: "Keuangan berhasil diupdate" });
};

exports.delete = async (req, res) => {
    await Keuangan.destroy({
        where: {
            keuangan_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });
    res.json({ message: "Keuangan berhasil dihapus" });
};

// ini untuk filter dan generate yang harusnya di helper ya

const getPeriodeTanggal = (periode) => {
    const now = new Date();

    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    let start;
    let end = today;

    if (periode === "harian") {
        start = today;
    } else if (periode === "mingguan") {
        start = new Date(today);
        start.setDate(start.getDate() - 6);
    } else if (periode === "bulanan") {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
        throw new Error("Periode tidak valid");
    }

    const toYMD = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
        ).padStart(2, "0")}`;

    return {
        startDate: toYMD(start),
        endDate: toYMD(end),
    };
};

exports.generateReport = async (req, res) => {
    try {
        const { periode, kategori_id, jenis } = req.query;

        if (!periode) {
        return res.status(400).json({
            message: "Periode wajib diisi (harian | mingguan | bulanan)",
        });
        }

        const { startDate, endDate } = getPeriodeTanggal(periode);

        // ================= FILTER DB (FINAL & AMAN) =================
        const whereClause = {
        masjid_id: req.user.masjid_id,
        tanggal: {
            [Op.gte]: startDate,
            [Op.lte]: endDate,
        },
        };

        if (kategori_id) {
        whereClause.kategori_id = kategori_id;
        }

        const data = await Keuangan.findAll({
        where: whereClause,
        order: [["tanggal", "ASC"]],
        });

        if (!data || data.length === 0) {
        return res.status(404).json({
            message: "Data keuangan tidak ditemukan pada periode ini",
        });
        }

        // ================= HITUNG TOTAL =================
        let totalPemasukan = 0;
        let totalPengeluaran = 0;

        data.forEach((d) => {
        const jumlah = Number(d.jumlah);
        if (jumlah >= 0) totalPemasukan += jumlah;
        else totalPengeluaran += Math.abs(jumlah);
        });

        // ================= DATA PENDUKUNG =================
        const takmir = await User.findByPk(req.user.user_id);
        const masjid = await Masjid.findByPk(req.user.masjid_id);

        let kategori = "Semua";
        if (kategori_id) {
        const kat = await Kategori.findByPk(kategori_id);
        if (kat) kategori = kat.nama_kategori;
        }

        const label =
        periode === "harian"
            ? "Harian"
            : periode === "mingguan"
            ? "Mingguan"
            : "Bulanan";

        // ================= GENERATE PDF =================
        const file = await ReportService.generateKeuanganPDF({
        jenis,
        kategori,
        periode: `${label} (${startDate} s/d ${endDate})`,
        data,
        totalPemasukan,
        totalPengeluaran,
        takmir,
        masjid,
        });

        return res.json({
        message: "Laporan berhasil dibuat",
        file,
        });
    } catch (err) {
        console.error("GENERATE REPORT ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
};