const Program = require("../../models/Program");
const { logActivity } = require("../../services/auditLog.service");

exports.create = async (req, res) => {
  try {
    const { nama_program, jadwal_rutin, deskripsi } = req.body;

    if (!nama_program || !jadwal_rutin) {
      return res.status(400).json({ message: "Nama program dan jadwal wajib diisi" });
    }

    const data = await Program.create({
      nama_program,
      jadwal_rutin,
      deskripsi,
      user_id: req.user.user_id  
    });

    await logActivity({
      req,
      action: "CREATE",
      nama_tabel: "program",
      data_baru: data.toJSON(),
      record_id: data.program_id
    });

    res.status(201).json({
      message: "Program berhasil ditambahkan",
      data
    });

  } catch (err) {
    console.error("CREATE PROGRAM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.getAll = async (req, res) => {
  try {
    const data = await Program.findAll();
    res.json(data);
  } catch (err) {
    console.error("GET ALL PROGRAM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.getById = async (req, res) => {
  try {
    const data = await Program.findByPk(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Program tidak ditemukan" });
    }

    res.json(data);

  } catch (err) {
    console.error("GET PROGRAM BY ID ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.update = async (req, res) => {
  try {
    const program = await Program.findByPk(req.params.id);

    if (!program) {
      return res.status(404).json({ message: "Program tidak ditemukan" });
    }

    const oldData = program.toJSON();

    await program.update(req.body);

    await logActivity({
      req,
      action: "UPDATE",
      nama_tabel: "program",
      data_lama: oldData,
      data_baru: program.toJSON(),
      record_id: program.program_id
    });

    res.json({ message: "Program berhasil diupdate" });

  } catch (err) {
    console.error("UPDATE PROGRAM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.delete = async (req, res) => {
  try {
    const oldData = await Program.findByPk(req.params.id);

    if (!oldData) {
      return res.status(404).json({ message: "Program tidak ditemukan" });
    }

    await Program.destroy({
      where: { program_id: req.params.id }
    });

    await logActivity({
      req,
      action: "DELETE",
      nama_tabel: "program",
      data_lama: oldData.toJSON(),
      record_id: req.params.id
    });

    res.json({ message: "Program berhasil dihapus" });

  } catch (err) {
    console.error("DELETE PROGRAM ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};