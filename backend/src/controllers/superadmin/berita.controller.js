const Berita = require("../../models/Berita");
const { logActivity } = require("../../services/auditLog.service");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const BeritaGambar = require("../../models/BeritaGambar");

exports.create = async (req, res) => {
  try {
    let gambarList = [];

    if (req.files?.length) {
      const dir = path.join(__dirname, "../../../uploads/berita");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      for (const file of req.files) {
        const filename = `berita_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.webp`;

        const filepath = path.join(dir, filename);

        await sharp(file.buffer)
          .resize(800)
          .webp({ quality: 70 })
          .toFile(filepath);

        gambarList.push(`/uploads/berita/${filename}`);
      }
    }

    const thumbnail = gambarList[0] || null;

    const data = await Berita.create({
      judul: req.body.judul,
      isi: req.body.isi,
      tanggal: new Date(),
      gambar: thumbnail,
      user_id: req.user.user_id,
      masjid_id: null,
      status: "dipublikasi",
      published_at: new Date()
    });

    if (gambarList.length) {
      await BeritaGambar.bulkCreate(
        gambarList.map(p => ({
          berita_id: data.berita_id,
          path_gambar: p
        }))
      );
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
    if (!berita)
      return res.status(404).json({ message: "Berita tidak ditemukan" });

    const oldData = berita.toJSON();
    let gambarPath = berita.gambar;

    if (req.body.deletedImages) {
      const deletedIds = JSON.parse(req.body.deletedImages);

      if (deletedIds.length > 0) {
        const imagesToDelete = await BeritaGambar.findAll({
          where: { gambar_id: deletedIds }
        });

        for (const img of imagesToDelete) {
          const filePath = path.join(
            __dirname,
            "../../../",
            img.path_gambar
          );

          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }

        await BeritaGambar.destroy({
          where: { gambar_id: deletedIds }
        });
      }
    }

    if (req.files?.length) {
      const dir = path.join(__dirname, "../../../uploads/berita");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const newImages = [];

      for (const file of req.files) {
        const filename = `berita_${Date.now()}_${Math.random()
          .toString(36)
          .slice(2)}.webp`;

        const filepath = path.join(dir, filename);

        await sharp(file.buffer)
          .resize(800)
          .webp({ quality: 70 })
          .toFile(filepath);

        newImages.push(`/uploads/berita/${filename}`);
      }

      await BeritaGambar.bulkCreate(
        newImages.map(p => ({
          berita_id: berita.berita_id,
          path_gambar: p
        }))
      );
    }

    const remainingImages = await BeritaGambar.findAll({
      where: { berita_id: berita.berita_id },
      order: [["gambar_id", "ASC"]]
    });

    gambarPath = remainingImages.length
      ? remainingImages[0].path_gambar
      : null;

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
    const berita = await Berita.findByPk(req.params.id);
    if (!berita)
      return res.status(404).json({ message: "Berita tidak ditemukan" });

    if (berita.gambar) {
      const filePath = path.join(__dirname, "../../../", berita.gambar);
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
      data_lama: berita.toJSON(),
      record_id: req.params.id
    });

    res.json({ message: "Berita berhasil dihapus" });
  } catch (error) {
    console.error("DELETE BERITA ERROR:", error);
    res.status(500).json({ message: "Gagal hapus berita" });
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
      ],
      order: [[{ model: BeritaGambar, as: "gambar_list" }, "gambar_id", "ASC"]]
    });

    if (!data)
      return res.status(404).json({ message: "Berita tidak ditemukan" });

    res.json(data);
  } catch (error) {
    console.error("GET BY ID ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await Berita.findAll({
      include: [
        {
          model: BeritaGambar,
          as: "gambar_list",
          attributes: ["gambar_id", "path_gambar"]
        }
      ],
      order: [["tanggal", "DESC"]]
    });

    res.json(data);
  } catch (error) {
    console.error("GET ALL BERITA ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const berita = await Berita.findByPk(req.params.id);
    if (!berita) {
      return res.status(404).json({ message: "Berita tidak ditemukan" });
    }

    const oldData = berita.toJSON();

    let publishedAt = berita.published_at;

    if (req.body.status === "dipublikasi") {
      publishedAt = new Date();
    }

    await berita.update({
      status: req.body.status,
      approved_by: req.user.user_id,
      approved_at: new Date(),
      published_at: publishedAt
    });

    await logActivity({
      req,
      action: "APPROVAL",
      nama_tabel: "berita_masjid",
      data_lama: oldData,
      data_baru: berita.toJSON(),
      record_id: berita.berita_id
    });

    res.json({ message: "Status berita berhasil diupdate" });
  } catch (error) {
    console.error("UPDATE STATUS ERROR:", error);
    res.status(500).json({ message: "Gagal update status" });
  }
};
