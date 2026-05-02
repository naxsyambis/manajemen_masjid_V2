const { Program, KategoriProgram } = require('../../models');
const { logActivity } = require('../../services/auditLog.service');

exports.getAllProgram = async (req, res) => {
    try {
        const program = await Program.findAll({
            include: [{ model: KategoriProgram, as: 'kategori_program' }]
        });
        res.status(200).json({ data: program });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengambil data", error: error.message });
    }
};

exports.createProgram = async (req, res) => {
    try {
        const { nama_program, jadwal_rutin, deskripsi, kategori_id } = req.body;
        const gambar = req.file ? req.file.filename : null;

        const newProgram = await Program.create({
            nama_program,
            jadwal_rutin,
            deskripsi,
            kategori_id: kategori_id || null, 
            gambar, 
            user_id: req.user.user_id
        });

        await logActivity({
            req,
            action: 'CREATE',
            nama_tabel: 'program',
            data_baru: newProgram.toJSON(),
            record_id: newProgram.program_id
        });

        res.status(201).json({ message: "Program berhasil ditambahkan", data: newProgram });
    } catch (error) {
        res.status(500).json({ message: "Gagal menambahkan program", error: error.message });
    }
};

exports.updateProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama_program, jadwal_rutin, deskripsi, kategori_id } = req.body;
        const gambarBaru = req.file ? req.file.filename : null;

        const program = await Program.findByPk(id);
        if (!program) return res.status(404).json({ message: "Program tidak ditemukan" });

        const dataLama = { ...program.toJSON() };

        program.nama_program = nama_program || program.nama_program;
        program.jadwal_rutin = jadwal_rutin || program.jadwal_rutin;
        program.deskripsi = deskripsi || program.deskripsi;
        program.kategori_id = kategori_id !== undefined ? kategori_id : program.kategori_id;
        if (gambarBaru) program.gambar = gambarBaru;

        await program.save();

        await logActivity({
            req,
            action: 'UPDATE',
            nama_tabel: 'program',
            data_lama: dataLama,
            data_baru: program.toJSON(),
            record_id: program.program_id
        });

        res.status(200).json({ message: "Program berhasil diupdate", data: program });
    } catch (error) {
        res.status(500).json({ message: "Gagal mengupdate program", error: error.message });
    }
};

exports.deleteProgram = async (req, res) => {
    try {
        const { id } = req.params;
        const program = await Program.findByPk(id);
        if (!program) return res.status(404).json({ message: "Program tidak ditemukan" });

        const dataLama = { ...program.toJSON() };
        await program.destroy();

        await logActivity({
            req,
            action: 'DELETE',
            nama_tabel: 'program',
            data_lama: dataLama,
            record_id: id
        });

        res.status(200).json({ message: "Program berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: "Gagal menghapus program", error: error.message });
    }
};

exports.getById = async (req, res) => {
  try {
    const data = await Program.findByPk(req.params.id, {
      include: [
        { 
          model: KategoriProgram, 
          as: 'kategori_program', 
          attributes: ['nama_kategori'] 
        }
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Program tidak ditemukan" });
    }

    res.json(data.toJSON()); 

  } catch (err) {
    console.error("GET PROGRAM BY ID ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};