const Berita = require("../../models/Berita");

/* CREATE */
exports.create = async (req, res) => {
    const data = await Berita.create({
        judul: req.body.judul,
        isi: req.body.isi,
        gambar: req.body.gambar,
        user_id: req.user.user_id
    });
    res.json(data);
};

/* GET ALL */
exports.getAll = async (req, res) => {
    res.json(await Berita.findAll());
};

/* GET BY ID */
exports.getById = async (req, res) => {
    const data = await Berita.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Berita tidak ditemukan" });
    res.json(data);
};

/* UPDATE */
exports.update = async (req, res) => {
    const berita = await Berita.findByPk(req.params.id);
    if (!berita) return res.status(404).json({ message: "Berita tidak ditemukan" });

    await berita.update(req.body);
    res.json({ message: "Berita berhasil diupdate" });
};

/* DELETE */
exports.delete = async (req, res) => {
    await Berita.destroy({ where: { berita_id: req.params.id } });
    res.json({ message: "Berita berhasil dihapus" });
};
