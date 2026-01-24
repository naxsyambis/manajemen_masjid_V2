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

exports.generateReport = async (req, res) => {
    try {
        const { jenis, kategori_id, startDate, endDate } = req.query;

        // ================= VALIDASI TANGGAL =================
        const today = new Date();
        const minDate = new Date();
        minDate.setDate(today.getDate() - 5);

        if (new Date(startDate) < minDate || new Date(endDate) > today) {
        return res.status(400).json({
            message: "Tanggal hanya boleh 5 hari terakhir sampai hari ini"
        });
        }

        // ================= FILTER DB =================
        const whereClause = {
        masjid_id: req.user.masjid_id,
        tanggal: { [Op.between]: [startDate, endDate] }
        };

        if (kategori_id) whereClause.kategori_id = kategori_id;

        const data = await Keuangan.findAll({
        where: whereClause,
        order: [["tanggal", "ASC"]]
        });

        // ================= HITUNG TOTAL =================
        let totalPemasukan = 0;
        let totalPengeluaran = 0;

        data.forEach(d => {
        if (Number(d.jumlah) > 0) totalPemasukan += Number(d.jumlah);
        else totalPengeluaran += Math.abs(Number(d.jumlah));
        });

        // ================= DATA PENDUKUNG =================
        const takmir = await User.findByPk(req.user.user_id);
        const masjid = await Masjid.findByPk(req.user.masjid_id);

        let kategori = "Semua";
        if (kategori_id) {
        const kat = await Kategori.findByPk(kategori_id);
        if (kat) kategori = kat.nama_kategori;
        }

        const periode = `${startDate} s/d ${endDate}`;

        // ================= GENERATE PDF =================
        const file = await ReportService.generateKeuanganPDF({
        jenis,
        kategori,
        periode,
        data,
        totalPemasukan,
        totalPengeluaran,
        takmir,
        masjid
        });

        res.json({
        message: "Laporan berhasil dibuat",
        file
        });

    } catch (err) {
        console.error("GENERATE REPORT ERROR:", err);
        res.status(500).json({ message: "Gagal generate laporan" });
    }
};