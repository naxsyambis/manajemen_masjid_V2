const { Op } = require("sequelize");
const { Keuangan, KategoriKeuangan } = require("../../models"); 
const { logActivity } = require("../../services/auditLog.service");

exports.create = async (req, res) => {
    try {
        const data = await Keuangan.create({
            jumlah: req.body.jumlah,
            tanggal: req.body.tanggal,
            deskripsi: req.body.deskripsi, 
            nama_donatur: req.body.nama_donatur || 'Hamba Allah', 
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

        res.status(201).json({ message: "Data keuangan berhasil ditambahkan", data });
    } catch (error) {
        res.status(500).json({ message: "Gagal menambahkan data keuangan", error: error.message });
    }
};

exports.getAll = async (req, res) => {
    try {
        const data = await Keuangan.findAll({
            where: { masjid_id: req.user.masjid_id },
            include: [{ model: KategoriKeuangan, as: 'kategori_keuangan' }],
            order: [['tanggal', 'DESC']]
        });
        
        res.status(200).json({ data }); 
    } catch (error) {
        console.error("GET ALL KEUANGAN ERROR:", error);
        res.status(500).json({ message: "Gagal mengambil data keuangan", error: error.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const data = await Keuangan.findOne({
            where: {
                keuangan_id: req.params.id,
                masjid_id: req.user.masjid_id
            }
        });

        if (!data) return res.status(404).json({ message: "Data keuangan tidak ditemukan" });
        res.json({ data });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data keuangan", error: error.message });
    }
};

exports.update = async (req, res) => {
    try {
        const keuangan = await Keuangan.findOne({
            where: {
                keuangan_id: req.params.id,
                masjid_id: req.user.masjid_id
            }
        });

        if (!keuangan) return res.status(404).json({ message: "Data keuangan tidak ditemukan" });

        const oldData = keuangan.toJSON();

        await keuangan.update({
            jumlah: req.body.jumlah || keuangan.jumlah,
            tanggal: req.body.tanggal || keuangan.tanggal,
            deskripsi: req.body.deskripsi || keuangan.deskripsi,
            nama_donatur: req.body.nama_donatur !== undefined ? req.body.nama_donatur : keuangan.nama_donatur,
            kategori_id: req.body.kategori_id || keuangan.kategori_id
        });

        await logActivity({
            req,
            action: "UPDATE",
            nama_tabel: "keuangan",
            data_lama: oldData,
            data_baru: keuangan,
            record_id: req.params.id
        });

        res.json({ message: "Keuangan berhasil diupdate", data: keuangan });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengupdate data", error: error.message });
    }
};

exports.delete = async (req, res) => {
    try {
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
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus data", error: error.message });
    }
};

const getPeriodeTanggal = (periode) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
        const { periode, kategori_id } = req.query;

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

        return res.json({
            message: "Data laporan berhasil diambil",
            startDate,
            endDate,
            data
        });
    } catch (err) {
        console.error("GENERATE REPORT ERROR:", err);
        return res.status(500).json({ message: err.message });
    }
};