const Masjid = require("../../models/Masjid");
const { logActivity } = require("../../services/auditLog.service");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

exports.create = async (req, res) => {
  try {
    let logoPath = null;

    if (req.file) {
      const dir = path.join(__dirname, "../../../uploads/masjid");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `masjid_${Date.now()}.webp`;
      const filepath = path.join(dir, filename);

      await sharp(req.file.buffer)
        .resize(500)
        .toFormat("webp", { quality: 70 })
        .toFile(filepath);

      logoPath = `/uploads/masjid/${filename}`;
    }

    const data = await Masjid.create({
      ...req.body,
      logo_foto: logoPath
    });

    await logActivity({
      req,
      action: "CREATE",
      nama_tabel: "masjid",
      data_baru: data,
      record_id: data.masjid_id
    });

    res.json(data);
  } catch (error) {
    console.error("CREATE MASJID ERROR:", error);
    res.status(500).json({ message: "Gagal tambah masjid" });
  }
};

exports.update = async (req, res) => {
  try {
    const masjid = await Masjid.findByPk(req.params.id);
    if (!masjid) return res.status(404).json({ message: "Masjid tidak ditemukan" });

    const oldData = masjid.toJSON();
    let logoPath = masjid.logo_foto;

    if (req.file) {
      if (masjid.logo_foto) {
        const oldFile = path.join(__dirname, "../../../", masjid.logo_foto);
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }

      const dir = path.join(__dirname, "../../../uploads/masjid");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `masjid_${Date.now()}.webp`;
      const filepath = path.join(dir, filename);

      await sharp(req.file.buffer)
        .resize(500)
        .toFormat("webp", { quality: 70 })
        .toFile(filepath);

      logoPath = `/uploads/masjid/${filename}`;
    }

    await masjid.update({
      ...req.body,
      logo_foto: logoPath
    });

    await logActivity({
      req,
      action: "UPDATE",
      nama_tabel: "masjid",
      data_lama: oldData,
      data_baru: masjid.toJSON(),
      record_id: masjid.masjid_id
    });

    res.json({ message: "Masjid berhasil diupdate" });
  } catch (error) {
    console.error("UPDATE MASJID ERROR:", error);
    res.status(500).json({ message: "Gagal update masjid" });
  }
};

exports.delete = async (req, res) => {
  try {
    const oldData = await Masjid.findByPk(req.params.id);
    if (!oldData) return res.status(404).json({ message: "Masjid tidak ditemukan" });

    if (oldData.logo_foto) {
      const filePath = path.join(__dirname, "../../../", oldData.logo_foto);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Masjid.destroy({ where: { masjid_id: req.params.id } });

    await logActivity({
      req,
      action: "DELETE",
      nama_tabel: "masjid",
      data_lama: oldData,
      record_id: req.params.id
    });

    res.json({ message: "Masjid berhasil dihapus" });
  } catch (error) {
    console.error("DELETE MASJID ERROR:", error);
    res.status(500).json({ message: "Gagal hapus masjid" });
  }
};

exports.getAll = async (req, res) => {
  res.json(await Masjid.findAll());
};

exports.getById = async (req, res) => {
  const masjid = await Masjid.findByPk(req.params.id);
  if (!masjid) return res.status(404).json({ message: "Masjid tidak ditemukan" });
  res.json(masjid);
};
