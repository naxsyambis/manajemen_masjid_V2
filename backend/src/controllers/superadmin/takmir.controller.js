const bcrypt = require("bcrypt");
const { User, Masjid, MasjidTakmir } = require("../../models"); 
const sequelize = require("../../config/database"); 
const { logActivity } = require("../../services/auditLog.service");

exports.create = async (req, res) => {
  try {
    const { nama, email, password, masjid_id } = req.body;

    if (!nama || !email || !password || !masjid_id) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      nama,
      email,
      password: hash,
      role: "takmir"
    });

    const takmir = await MasjidTakmir.create({
      user_id: user.user_id,
      masjid_id,
      pembuatakun: req.user.user_id
    });

    await logActivity({
      req,
      action: "CREATE",
      nama_tabel: "takmir",
      data_baru: { user, takmir },
      record_id: takmir.id
    });

    res.status(201).json({ message: "Takmir berhasil dibuat" });

  } catch (err) {
    console.error("CREATE TAKMIR ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.getAll = async (req, res) => {
  try {
        const data = await MasjidTakmir.findAll({
        include: [
            { model: User, as: "user", attributes: ["user_id", "nama", "email"] },
            { model: Masjid, as: "masjid", attributes: ["masjid_id", "nama_masjid"] }
        ]
        });


    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


exports.getById = async (req, res) => {
  try {
    const data = await MasjidTakmir.findByPk(req.params.id, {
        include: [
        { model: User, as: "user", attributes: ["user_id", "nama", "email"] },
        { model: Masjid, as: "masjid", attributes: ["masjid_id", "nama_masjid"] }
        ]
    });

    if (!data) return res.status(404).json({ message: "Takmir tidak ditemukan" });
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


exports.update = async (req, res) => {
  try {
    const { nama, email, password, masjid_id } = req.body;

    const takmir = await MasjidTakmir.findByPk(req.params.id);
    if (!takmir) return res.status(404).json({ message: "Takmir tidak ditemukan" });

    const user = await User.findByPk(takmir.user_id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const oldData = {
      user: user.toJSON(),
      masjid_id: takmir.masjid_id
    };

    if (password && password !== "") {
      const hash = await bcrypt.hash(password, 10);
      await user.update({ nama, email, password: hash });
    } else {
      await user.update({ nama, email });
    }

    await takmir.update({ masjid_id });

    const newData = { nama, email, masjid_id };

    await logActivity({
      req,
      action: "UPDATE",
      nama_tabel: "takmir",
      data_lama: oldData,
      data_baru: newData,
      record_id: req.params.id
    });

    res.json({ message: "Takmir berhasil diperbarui" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id } = req.params;

    const takmir = await MasjidTakmir.findByPk(id);
    if (!takmir) {
      await t.rollback();
      return res.status(404).json({ message: "Data Takmir tidak ditemukan" });
    }

    const targetUserId = takmir.user_id;
    
    const oldData = takmir.toJSON();

    await takmir.destroy({ transaction: t });

    if (targetUserId) {
      await User.destroy({ 
        where: { user_id: targetUserId }, 
        transaction: t 
      });
    }

    await t.commit();

    await logActivity({
      req,
      action: "DELETE",
      nama_tabel: "takmir & user_app",
      record_id: id,
      data_lama: oldData
    });

    res.json({ message: "Takmir dan akun login user_app berhasil dihapus secara permanen" });

  } catch (err) {
    if (t) await t.rollback();
    console.error("DELETE TAKMIR ERROR:", err);
    res.status(500).json({ message: "Gagal menghapus data: " + err.message });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["user_id", "nama", "email", "role"]
    });
    res.json({ data: users });
  } catch (err) {
    console.error("GET ALL USER ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};