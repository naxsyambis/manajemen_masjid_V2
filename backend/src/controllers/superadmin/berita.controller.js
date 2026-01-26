const Berita = require("../../models/Berita");
const { logActivity } = require("../../services/auditLog.service");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

exports.create = async (req, res) => {
  try {
    let gambarPath = null;

    if (req.file) {
      const dir = path.join(__dirname, "../../../uploads/berita");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `berita_${Date.now()}.webp`;
      const filepath = path.join(dir, filename);

      await sharp(req.file.path)
        .resize(800)
        .toFormat("webp", { quality: 70 })
        .toFile(filepath);

      gambarPath = `/uploads/berita/${filename}`;
    }

    const data = await Berita.create({
      judul: req.body.judul,
      isi: req.body.isi,
      tanggal: new Date(),
      gambar: gambarPath,
      user_id: req.user.user_id
    });

    await logActivity({
      req,
      action: "CREATE",
      nama_tabel: "berita_masjid",
      data_baru: data.toJSON(),
      record_id: data.berita_id
    });

    res.json(data);
  } catch (error) {
    console.error("CREATE BERITA ERROR:", error);
    res.status(500).json({ message: "Gagal tambah berita" });
  }
};

exports.update = async (req, res) => {
  try {
    const berita = await Berita.findByPk(req.params.id);
    if (!berita) return res.status(404).json({ message: "Berita tidak ditemukan" });

    const oldData = berita.toJSON();
    let gambarPath = berita.gambar;

    if (req.file) {
      if (berita.gambar) {
        const oldFile = path.join(__dirname, "../../../", berita.gambar);
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }

      const dir = path.join(__dirname, "../../../uploads/berita");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `berita_${Date.now()}.webp`;
      const filepath = path.join(dir, filename);

      await sharp(req.file.path)
        .resize(800)
        .toFormat("webp", { quality: 70 })
        .toFile(filepath);

      gambarPath = `/uploads/berita/${filename}`;
    }

    await berita.update({
      judul: req.body.judul,
      isi: req.body.isi,
      gambar: gambarPath
    });

    await logActivity({
      req,
      action: "UPDATE",
      nama_tabel: "berita_masjid",
      data_lama: oldData,
      data_baru: berita.toJSON(),
      record_id: berita.berita_id
    });

    res.json({ message: "Berita berhasil diupdate" });
  } catch (error) {
    console.error("UPDATE BERITA ERROR:", error);
    res.status(500).json({ message: "Gagal update berita" });
  }
};

exports.delete = async (req, res) => {
  try {
    const oldData = await Berita.findByPk(req.params.id);
    if (!oldData) return res.status(404).json({ message: "Berita tidak ditemukan" });

    if (oldData.gambar) {
      const filePath = path.join(__dirname, "../../../", oldData.gambar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Berita.destroy({ where: { berita_id: req.params.id } });

    await logActivity({
      req,
      action: "DELETE",
      nama_tabel: "berita_masjid",
      data_lama: oldData.toJSON(),
      record_id: req.params.id
    });

    res.json({ message: "Berita berhasil dihapus" });
  } catch (error) {
    console.error("DELETE BERITA ERROR:", error);
    res.status(500).json({ message: "Gagal hapus berita" });
  }
};

exports.getAll = async (req, res) => {
  res.json(await Berita.findAll());
};

exports.getById = async (req, res) => {
  const data = await Berita.findByPk(req.params.id);
  if (!data) return res.status(404).json({ message: "Berita tidak ditemukan" });
  res.json(data);
};
