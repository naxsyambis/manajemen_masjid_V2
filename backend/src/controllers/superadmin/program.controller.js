const Program = require("../../models/Program");

exports.create = async (req, res) => {
    const data = await Program.create({
        nama_program: req.body.nama_program,
        jadwal_rutin: req.body.jadwal_rutin,
        deskripsi: req.body.deskripsi,
        user_id: req.user.user_id
    });
    res.json(data);
};

exports.getAll = async (req, res) => {
    res.json(await Program.findAll());
};

exports.getById = async (req, res) => {
    const data = await Program.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Program tidak ditemukan" });
    res.json(data);
};

exports.update = async (req, res) => {
    const program = await Program.findByPk(req.params.id);
    if (!program) return res.status(404).json({ message: "Program tidak ditemukan" });

    await program.update(req.body);
    res.json({ message: "Program berhasil diupdate" });
};

exports.delete = async (req, res) => {
    await Program.destroy({ where: { program_id: req.params.id } });
    res.json({ message: "Program berhasil dihapus" });
};
