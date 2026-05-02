const { Keuangan, KategoriKeuangan } = require("../../models");

exports.getAll = async (req, res) => {
    try {
        const { masjid_id } = req.query;

        if (!masjid_id) {
            return res.status(400).json({
                message: "masjid_id wajib diisi"
            });
        }

        const data = await Keuangan.findAll({
            where: { masjid_id },
            include: [
                {
                    model: KategoriKeuangan,
                    as: "kategori_keuangan", 
                    attributes: ["kategori_id", "nama_kategori", "jenis"]
                }
            ],
            order: [["tanggal", "DESC"]]
        });

        res.status(200).json({
            message: "Berhasil mengambil data keuangan berdasarkan masjid",
            data
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};