const Masjid = require("../../models/Masjid");
const Jamaah = require("../../models/Jamaah");
const Berita = require("../../models/Berita");
const Program = require("../../models/Program");
const Kegiatan = require("../../models/Kegiatan");
const Kepengurusan = require("../../models/Kepengurusan");
const Keuangan = require("../../models/Keuangan");      
const Inventaris = require("../../models/Inventaris"); 
const User = require("../../models/User"); 
const MasjidTakmir = require("../../models/masjid_takmir"); 
const prayerService = require("../../services/prayer.service");
const jadwalService = require("../../services/prayer.service");
const MasjidService = require("../../services/masjid.service");

exports.listMasjid = async (req, res) => {
  try {
    const data = await Masjid.findAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.detailMasjid = async (req, res) => {
  try {
    const masjid_id = req.params.id;

    const masjid = await Masjid.findByPk(masjid_id);
    if (!masjid) {
      return res.status(404).json({ message: "Masjid tidak ditemukan" });
    }

    const jamaah = await Jamaah.findAll({
      where: { masjid_id },
      attributes: ["jamaah_id", "nama", "jenis_kelamin", "status"]
    });

    res.json({ masjid, jamaah });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBerita = async (req, res) => {
  try {
    const where = { status: "dipublikasi" };

    if (req.query.masjid_id) {
      where.masjid_id = req.query.masjid_id;
    }

    const data = await Berita.findAll({
      where,
      include: [
        {
          model: require("../../models/BeritaGambar"),
          as: "gambar_list",
          attributes: ["gambar_id", "path_gambar"]
        },
        {
          model: Masjid,
          as: "masjid",
          attributes: ["masjid_id", "nama_masjid"]
        },
        {
          model: User,
          as: "user",
          attributes: ["user_id"],
          include: [
            {
              model: MasjidTakmir,
              as: "takmirs",
              include: [{ model: Masjid, as: "masjid", attributes: ["nama_masjid"] }]
            }
          ]
        }
      ],
      order: [["published_at", "DESC"]]
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBeritaById = async (req, res) => {
  try {
    const data = await Berita.findOne({
      where: {
        berita_id: req.params.id,
        status: "dipublikasi"
      },

      attributes: [
        "berita_id",
        "judul",
        "isi",
        "tanggal",
        "gambar",
        "youtube_url", 
        "masjid_id"
      ],

      include: [
        {
          model: require("../../models/BeritaGambar"),
          as: "gambar_list",
          attributes: ["gambar_id", "path_gambar"]
        },
        {
          model: Masjid,
          as: "masjid",
          attributes: ["masjid_id", "nama_masjid"]
        },
        {
          model: User,
          as: "user",
          attributes: ["user_id"],
          include: [
            {
              model: MasjidTakmir,
              as: "takmirs",
              include: [
                {
                  model: Masjid,
                  as: "masjid",
                  attributes: ["nama_masjid"]
                }
              ]
            }
          ]
        }
      ],

      order: [
        [
          { model: require("../../models/BeritaGambar"), as: "gambar_list" },
          "gambar_id",
          "ASC"
        ]
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Berita tidak ditemukan" });
    }

    res.json(data);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProgram = async (req, res) => {
    res.json(await Program.findAll());
};

exports.getProgramById = async (req, res) => {
  try {
    const data = await Program.findByPk(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Program tidak ditemukan" });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getKegiatan = async (req, res) => {
    res.json(await Kegiatan.findAll());
};

exports.getKegiatanById = async (req, res) => {
  try {
    const kegiatan = await Kegiatan.findByPk(req.params.id); 
    if (!kegiatan) {
      return res.status(404).json({ message: "Kegiatan tidak ditemukan" });
    }
    res.json(kegiatan);  
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data kegiatan", error: error.message });
  }
};

exports.getKepengurusan = async (req, res) => {
    res.json(await Kepengurusan.findAll());
};

exports.getKeuangan = async (req, res) => {
    try {
        const { masjid_id } = req.query;

        if (!masjid_id) {
            return res.status(400).json({
                message: "masjid_id wajib diisi"
            });
        }

        const data = await Keuangan.findAll({
            where: { masjid_id },
            order: [["tanggal", "DESC"]],
        });

        res.json({
            message: "Data keuangan berhasil diambil",
            data
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getInventaris = async (req, res) => {
    try {
        const { masjid_id } = req.query;

        if (!masjid_id) {
            return res.status(400).json({
                message: "masjid_id wajib diisi"
            });
        }

        const data = await Inventaris.findAll({
            where: { masjid_id },
            order: [["nama_barang", "ASC"]],
        });

        res.json({
            message: "Data inventaris berhasil diambil",
            data
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

exports.getJadwalSholat = async (req, res) => {
  try {
    const data = await jadwalService.getTodayPrayer();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStrukturOrganisasi = async (req, res) => {
  try {
    const { masjid_id } = req.query;

    const data = await require("../../models/StrukturOrganisasi").findAll({
      where: masjid_id ? { masjid_id } : {},
      order: [["struktur_id", "ASC"]]
    });

    res.json({
      message: "Berhasil mengambil struktur organisasi",
      data
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.getNearestMasjid = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude dan Longitude wajib diisi",
      });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Latitude dan Longitude harus berupa angka",
      });
    }

    const result = await MasjidService.getNearestMasjids(lat, lng);

    return res.json({
      success: true,
      message: "Berhasil mendapatkan masjid terdekat",
      total: result.length,
      data: result.slice(0, 5), 
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};