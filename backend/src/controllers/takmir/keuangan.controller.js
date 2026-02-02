const { Op } = require("sequelize");
const Keuangan = require("../../models/Keuangan");
const Kategori = require("../../models/Kategori_Keuangan");
const Masjid = require("../../models/Masjid");
const User = require("../../models/User");
const { logActivity } = require("../../services/auditLog.service");

exports.create = async (req, res) => {
    const data = await Keuangan.create({
        jumlah: req.body.jumlah,
        tanggal: req.body.tanggal,
        deskripsi: req.body.deskripsi,
        kategori_id: req.body.kategori_id,
        user_id: req.user.user_id,
        masjid_id: req.user.masjid_id
    });

    await logActivity({
        req,
        action: "CREATE",
        nama_tabel: "keuangan",
        data_baru: data,
        record_id: data.keuangan_id
    });

    res.json(data);
};

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

    if (!data) return res.status(404).json({ message: "Data keuangan tidak ditemukan" });
    res.json(data);
};

exports.update = async (req, res) => {
    const keuangan = await Keuangan.findOne({
        where: {
            keuangan_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!keuangan) return res.status(404).json({ message: "Data keuangan tidak ditemukan" });

    const oldData = keuangan.toJSON();

    await keuangan.update(req.body);

    await logActivity({
        req,
        action: "UPDATE",
        nama_tabel: "keuangan",
        data_lama: oldData,
        data_baru: keuangan,
        record_id: req.params.id
    });

    res.json({ message: "Keuangan berhasil diupdate" });
};

exports.delete = async (req, res) => {
    const oldData = await Keuangan.findOne({
        where: {
            keuangan_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    if (!oldData) return res.status(404).json({ message: "Data keuangan tidak ditemukan" });

    await Keuangan.destroy({
        where: {
            keuangan_id: req.params.id,
            masjid_id: req.user.masjid_id
        }
    });

    await logActivity({
        req,
        action: "DELETE",
        nama_tabel: "keuangan",
        data_lama: oldData,
        record_id: req.params.id
    });

    res.json({ message: "Keuangan berhasil dihapus" });
};



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

        let totalPemasukan = 0;
        let totalPengeluaran = 0;

        data.forEach((d) => {
            const jumlah = Number(d.jumlah);
            if (jumlah >= 0) totalPemasukan += jumlah;
            else totalPengeluaran += Math.abs(jumlah);
        });

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