const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/User");
const MasjidTakmir = require("../../models/masjid_takmir");
const { secret } = require("../../config/jwt");
const { logActivity } = require("../../services/auditLog.service");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

exports.register = async (req, res) => {
    try {
        const { nama, email, password, role } = req.body;

        if (!nama || !email || !password || !role) {
            return res.status(400).json({ message: "Semua field wajib diisi" });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: "Email sudah terdaftar" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            nama,
            email,
            password: hashedPassword,
            role
        });

        await logActivity({
            req,
            action: "REGISTER",
            nama_tabel: "user_app",
            data_baru: newUser,
            record_id: newUser.user_id
        });

        res.status(201).json({ message: "Register berhasil" });
    } catch (error) {
        res.status(500).json({ message: "Terjadi kesalahan server" });
    }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email dan password wajib diisi"
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        message: "User tidak ditemukan"
      });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({
        message: "Password salah"
      });
    }

    let masjid_id = null;

    if (user.role === "takmir") {
      const mapping = await MasjidTakmir.findOne({
        where: { user_id: user.user_id }
      });

      if (!mapping) {
        return res.status(403).json({
          message: "Takmir belum punya masjid"
        });
      }

      masjid_id = mapping.masjid_id;
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
        masjid_id
      },
      secret,
      {
        expiresIn: "2d" 
      }
    );

    await logActivity({
      req,
      action: "LOGIN",
      nama_tabel: "user_app",
      data_baru: {
        email: user.email,
        role: user.role
      },
      record_id: user.user_id
    });

    res.status(200).json({
      message: "Login berhasil",
      token,
      expires_in: "2 hari"
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Terjadi kesalahan server"
    });
  }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.user_id, {
            attributes: ['nama', 'email', 'role', 'foto_tanda_tangan']
        });

        const mapping = await MasjidTakmir.findOne({
            where: { user_id: req.user.user_id }
        });

        res.json({
            ...user.toJSON(),
            masjid_id: mapping ? mapping.masjid_id : null
        });
    } catch (error) {
        res.status(500).json({ message: "Gagal ambil profil" });
    }
};


exports.uploadTtd = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File tidak ditemukan" });
    }

    const user = await User.findByPk(req.user.user_id);
    if (!user) return res.status(404).json({ message: "User tidak ditemukan" });

    const oldData = user.toJSON();

    const uploadDir = path.join(__dirname, "../../../uploads/ttd");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (user.foto_tanda_tangan) {
    const oldPath = path.resolve(
      "uploads",
      "ttd",
      path.basename(user.foto_tanda_tangan)
    );

    if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    const filename = `ttd_${user.user_id}_${Date.now()}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(req.file.buffer)
    .resize(500)
    .toFormat("webp", { quality: 70 })
    .toFile(outputPath);

    await user.update({
      foto_tanda_tangan: `/uploads/ttd/${filename}`
    });

    const newData = user.toJSON();

    await logActivity({
      req,
      action: "UPDATE",
      nama_tabel: "user_app",
      data_lama: {
        ...oldData,
        foto_tanda_tangan: oldData.foto_tanda_tangan ? "[OLD IMAGE]" : null
      },
      data_baru: newData,
      record_id: user.user_id
    });

    res.json({
      message: "TTD berhasil disimpan",
      path: `/uploads/ttd/${filename}`
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: "Gagal upload TTD" });
  }
};


exports.deleteTtd = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const oldData = user.toJSON();

    if (user.foto_tanda_tangan) {
      const filePath = path.resolve(
        "uploads",
        "ttd",
        path.basename(user.foto_tanda_tangan)
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await user.update({ foto_tanda_tangan: null });

    await logActivity({
      req,
      action: "DELETE",
      nama_tabel: "user_app",
      data_lama: {
        ...oldData,
        foto_tanda_tangan: oldData.foto_tanda_tangan ? "[OLD IMAGE]" : null
      },
      record_id: user.user_id
    });

    res.json({ message: "TTD berhasil dihapus" });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: "Gagal hapus TTD" });
  }
};
