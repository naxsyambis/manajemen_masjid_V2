const Kepengurusan = require("../../models/Kepengurusan");
const { logActivity } = require("../../services/auditLog.service");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

exports.create = async (req, res) => {
  try {
    let fotoPath = null;

    if (req.file) {
      const dir = path.join(__dirname, "../../../uploads/kepengurusan");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `pengurus_${Date.now()}.webp`;
      const filepath = path.join(dir, filename);

      await sharp(req.file.path)
        .resize(500)
        .toFormat("webp", { quality: 70 })
        .toFile(filepath);

      fotoPath = `/uploads/kepengurusan/${filename}`;
    }

    const data = await Kepengurusan.create({
      ...req.body,
      foto_pengurus: fotoPath,
      masjid_id: req.user.role === 'super admin' ? null : req.user.masjid_id  // Super admin bisa set null jika tidak ada masjid_id
    });

    await logActivity({
      req,
      action: "CREATE",
      nama_tabel: "kepengurusan",
      data_baru: data,
      record_id: data.pengurus_id
    });

    res.json(data);
  } catch (error) {
    console.error("CREATE KEPENGURUSAN ERROR:", error);
    res.status(500).json({ message: "Gagal tambah pengurus" });
  }
};

exports.update = async (req, res) => {
  try {
    const kep = await Kepengurusan.findOne({
      where: { pengurus_id: req.params.id }  // Cari berdasarkan ID saja, tanpa filter masjid_id untuk super admin
    });

    if (!kep) return res.status(404).json({ message: "Pengurus tidak ditemukan" });

    const oldData = kep.toJSON();
    let fotoPath = kep.foto_pengurus;

    if (req.file) {
      if (kep.foto_pengurus) {
        const oldFile = path.join(__dirname, "../../../", kep.foto_pengurus);
        if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
      }

      const dir = path.join(__dirname, "../../../uploads/kepengurusan");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filename = `pengurus_${Date.now()}.webp`;
      const filepath = path.join(dir, filename);

      await sharp(req.file.path)
        .resize(500)
        .toFormat("webp", { quality: 70 })
        .toFile(filepath);

      fotoPath = `/uploads/kepengurusan/${filename}`;
    }

    await kep.update({
      ...req.body,
      foto_pengurus: fotoPath
    });

    await logActivity({
      req,
      action: "UPDATE",
      nama_tabel: "kepengurusan",
      data_lama: oldData,
      data_baru: kep.toJSON(),
      record_id: kep.pengurus_id
    });

    res.json({ message: "Pengurus berhasil diupdate" });
  } catch (error) {
    console.error("UPDATE KEPENGURUSAN ERROR:", error);
    res.status(500).json({ message: "Gagal update pengurus" });
  }
};

exports.delete = async (req, res) => {
  try {
    const oldData = await Kepengurusan.findOne({
      where: { pengurus_id: req.params.id }  // Cari berdasarkan ID saja
    });

    if (!oldData) return res.status(404).json({ message: "Pengurus tidak ditemukan" });

    if (oldData.foto_pengurus) {
      const filePath = path.join(__dirname, "../../../", oldData.foto_pengurus);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Kepengurusan.destroy({
      where: { pengurus_id: req.params.id }
    });

    await logActivity({
      req,
      action: "DELETE",
      nama_tabel: "kepengurusan",
      data_lama: oldData.toJSON(),
      record_id: req.params.id
    });

    res.json({ message: "Pengurus berhasil dihapus" });
  } catch (error) {
    console.error("DELETE KEPENGURUSAN ERROR:", error);
    res.status(500).json({ message: "Gagal hapus pengurus" });
  }
};

exports.getAll = async (req, res) => {
  try {
    // Kondisi berdasarkan role: super admin ambil semua, takmir filter berdasarkan masjid_id
    const whereCondition = req.user.role === 'super admin' ? {} : { masjid_id: req.user.masjid_id };
    const data = await Kepengurusan.findAll({
      where: whereCondition
    });
    res.json(data);
  } catch (error) {
    console.error("GET ALL KEPENGURUSAN ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil data kepengurusan" });
  }
};

exports.getById = async (req, res) => {
  try {
    // Kondisi berdasarkan role: super admin cari berdasarkan ID saja, takmir tambah filter masjid_id
    const whereCondition = req.user.role === 'super admin' 
      ? { pengurus_id: req.params.id } 
      : { pengurus_id: req.params.id, masjid_id: req.user.masjid_id };
    const data = await Kepengurusan.findOne({
      where: whereCondition
    });

    if (!data) return res.status(404).json({ message: "Pengurus tidak ditemukan" });
    res.json(data);
  } catch (error) {
    console.error("GET BY ID KEPENGURUSAN ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil detail pengurus" });
  }
};