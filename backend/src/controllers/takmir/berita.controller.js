const Berita = require("../../models/Berita");
const { logActivity } = require("../../services/auditLog.service");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const BeritaGambar = require("../../models/BeritaGambar");

exports.create = async (req, res) => {
  try {
    let gambarList = [];

    if (req.files && req.files.length > 0) {
      const dir = path.join(__dirname, "../../../uploads/berita");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      for (const file of req.files) {
        const filename = `berita_${Date.now()}_${Math.random().toString(36).slice(2)}.webp`;
        const filepath = path.join(dir, filename);

        await sharp(file.buffer)
          .resize(800)
          .toFormat("webp", { quality: 70 })
          .toFile(filepath);

        gambarList.push(`/uploads/berita/${filename}`);
      }
    }

    const thumbnail = gambarList.length > 0 ? gambarList[0] : null;

    const data = await Berita.create({
      judul: req.body.judul,
      isi: req.body.isi,
      tanggal: new Date(),
      gambar: thumbnail,
      user_id: req.user.user_id,
      masjid_id: req.user.masjid_id,
      status: "menunggu",
      published_at: null
    });

    if (gambarList.length > 0) {
      const bulkData = gambarList.map(path => ({
        berita_id: data.berita_id,
        path_gambar: path
      }));

      await BeritaGambar.bulkCreate(bulkData);
    }

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

    if (berita.user_id !== req.user.user_id) {
    return res.status(403).json({ message: "Tidak punya akses" });
    }

    const oldData = berita.toJSON();
    let gambarPath = berita.gambar;

    if (req.files && req.files.length > 0) {
      const dir = path.join(__dirname, "../../../uploads/berita");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const newImages = [];

      for (const file of req.files) {
        const filename = `berita_${Date.now()}_${Math.random().toString(36).slice(2)}.webp`;
        const filepath = path.join(dir, filename);

        await sharp(file.buffer)
          .resize(800)
          .toFormat("webp", { quality: 70 })
          .toFile(filepath);

        newImages.push(`/uploads/berita/${filename}`);
      }

      gambarPath = newImages[0];

      const bulkData = newImages.map(p => ({
        berita_id: berita.berita_id,
        path_gambar: p
      }));
      await BeritaGambar.bulkCreate(bulkData);
    }

    await berita.update({
    judul: req.body.judul,
    isi: req.body.isi,
    gambar: gambarPath,
    status: "menunggu",
    approved_by: null,
    approved_at: null,
    published_at: null
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

    if (oldData.user_id !== req.user.user_id) {
    return res.status(403).json({ message: "Tidak punya akses" });
    }

    if (oldData.gambar) {
      const filePath = path.join(__dirname, "../../../", oldData.gambar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    const gallery = await BeritaGambar.findAll({
      where: { berita_id: req.params.id }
    });

    for (const img of gallery) {
      const filePath = path.join(__dirname, "../../../", img.path_gambar);
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
  try {
    const data = await Berita.findAll({
      where: {
        user_id: req.user.user_id
      },
      order: [["tanggal", "DESC"]]
    });

    res.json(data);
  } catch (error) {
    console.error("GET ALL BERITA TAKMIR ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await Berita.findByPk(req.params.id, {
      include: [
        {
          model: BeritaGambar,
          as: "gambar_list",
          attributes: ["gambar_id", "path_gambar"]
        }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Berita tidak ditemukan" });
    }

    res.json(data);
  } catch (error) {
    console.error("GET BY ID ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

