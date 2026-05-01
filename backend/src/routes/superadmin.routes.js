const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { superadminOnly } = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

const masjid = require("../controllers/superadmin/masjid.controller");
const takmir = require("../controllers/superadmin/takmir.controller");
const berita = require("../controllers/superadmin/berita.controller");
const program = require("../controllers/superadmin/program.controller");
const kegiatan = require("../controllers/superadmin/kegiatan.controller");
const kepengurusan = require("../controllers/superadmin/kepengurusan.controller");
const keuangan = require("../controllers/superadmin/keuangan.masjid.controller");
const inventaris = require("../controllers/superadmin/inventaris.controller");
const jamaah = require("../controllers/superadmin/jamaah.controller");
const audit = require("../controllers/superadmin/audit.controller");
const kategoriProgram = require("../controllers/superadmin/kategoriProgram.controller"); 
const strukturOrganisasi = require("../controllers/takmir/strukturOrganisasi.controller");

router.get("/audit-log", auth, superadminOnly, audit.getAll);

router.post("/masjid", auth, superadminOnly, upload.single("logo_foto"), masjid.create);
router.put("/masjid/:id", auth, superadminOnly, upload.single("logo_foto"), masjid.update);
router.get("/masjid", auth, superadminOnly, masjid.getAll);
router.get("/masjid/:id", auth, superadminOnly, masjid.getById);
router.delete("/masjid/:id", auth, superadminOnly, masjid.delete);

router.get("/user", auth, superadminOnly, takmir.getAllUser);

router.post("/takmir", auth, superadminOnly, takmir.create);
router.get("/takmir", auth, superadminOnly, takmir.getAll);
router.get("/takmir/:id", auth, superadminOnly, takmir.getById);
router.put("/takmir/:id", auth, superadminOnly, takmir.update);
router.delete("/takmir/:id", auth, superadminOnly, takmir.delete);

router.post("/berita", auth, superadminOnly, upload.array("gambar", 10), berita.create);
router.put("/berita/:id", auth, superadminOnly, upload.array("gambar", 10), berita.update);
router.get("/berita", auth, superadminOnly, berita.getAll);
router.get("/berita/:id", auth, superadminOnly, berita.getById);
router.delete("/berita/:id", auth, superadminOnly, berita.delete);
router.patch("/berita/:id/status", auth, superadminOnly, berita.updateStatus);

router.post("/kategori-program", auth, superadminOnly, kategoriProgram.createKategoriProgram);
router.get("/kategori-program", auth, superadminOnly, kategoriProgram.getAllKategoriProgram);
router.put("/kategori-program/:id", auth, superadminOnly, kategoriProgram.updateKategoriProgram);
router.delete("/kategori-program/:id", auth, superadminOnly, kategoriProgram.deleteKategoriProgram);

router.post("/program", auth, superadminOnly, upload.single("gambar"), program.createProgram);
router.get("/program", auth, superadminOnly, program.getAllProgram);
router.get("/program/:id", auth, superadminOnly, program.getById);
router.put("/program/:id", auth, superadminOnly, upload.single("gambar"), program.updateProgram);
router.delete("/program/:id", auth, superadminOnly, program.deleteProgram);

router.post("/kegiatan", auth, superadminOnly, upload.single("poster"), kegiatan.createKegiatan);
router.get("/kegiatan", auth, superadminOnly, kegiatan.getAllKegiatan);
router.get("/kegiatan/:id", auth, superadminOnly, kegiatan.getById);
router.put("/kegiatan/:id", auth, superadminOnly, upload.single("poster"), kegiatan.updateKegiatan);
router.delete("/kegiatan/:id", auth, superadminOnly, kegiatan.deleteKegiatan);

router.post("/kepengurusan", auth, superadminOnly, upload.single("foto_pengurus"), kepengurusan.create);
router.put("/kepengurusan/:id", auth, superadminOnly, upload.single("foto_pengurus"), kepengurusan.update);
router.get("/kepengurusan", auth, superadminOnly, kepengurusan.getAll);
router.get("/kepengurusan/:id", auth, superadminOnly, kepengurusan.getById);
router.delete("/kepengurusan/:id", auth, superadminOnly, kepengurusan.delete);

router.get("/struktur-organisasi", auth, superadminOnly, strukturOrganisasi.getAllStruktur);

router.get("/keuangan", auth, superadminOnly, keuangan.getAll);
router.get("/inventaris", auth, superadminOnly, inventaris.getAll);
router.get("/jamaah", auth, superadminOnly, jamaah.getAll);

module.exports = router;