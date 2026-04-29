const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads/other";

    if (req.baseUrl.includes("auth")) folder = "uploads/ttd";
    else if (req.baseUrl.includes("berita")) folder = "uploads/berita";
    else if (req.originalUrl.includes("kepengurusan") || file.fieldname === 'foto_pengurus') folder = "uploads/kepengurusan";
    else if (req.baseUrl.includes("masjid")) folder = "uploads/masjid";
    else if (file.fieldname === 'poster_kegiatan') folder = 'uploads/kegiatan'; 
    else if (file.fieldname === 'gambar_program') folder = 'uploads/program'; 

    const dir = path.join(__dirname, `../../${folder}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);   
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage, 
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File harus berupa gambar"));
    }
    cb(null, true);
  }
});

module.exports = upload;