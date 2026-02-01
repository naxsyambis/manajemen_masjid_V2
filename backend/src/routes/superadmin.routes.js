const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { superadminOnly, takmirOnly } = require("../middleware/role.middleware");
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

router.get("/audit-log", auth, superadminOnly, audit.getAll);

router.post("/masjid", auth, superadminOnly, upload.single("logo_foto"), masjid.create);
router.put("/masjid/:id", auth, superadminOnly, upload.single("logo_foto"), masjid.update);
router.get("/masjid", auth, superadminOnly, masjid.getAll);
router.get("/masjid/:id", auth, superadminOnly, masjid.getById);
router.delete("/masjid/:id", auth, superadminOnly, masjid.delete);

router.post("/takmir", auth, superadminOnly, takmir.create);
router.get("/takmir", auth, superadminOnly, takmir.getAll);
router.get("/takmir/:id", auth, superadminOnly, takmir.getById);
router.put("/takmir/:id", auth, superadminOnly, takmir.update);
router.delete("/takmir/:id", auth, superadminOnly, takmir.delete);

router.post("/berita", auth, superadminOnly, upload.single("gambar"), berita.create);
router.put("/berita/:id", auth, superadminOnly, upload.single("gambar"), berita.update);
router.get("/berita", auth, superadminOnly, berita.getAll);
router.get("/berita/:id", auth, superadminOnly, berita.getById);
router.delete("/berita/:id", auth, superadminOnly, berita.delete);

router.post("/program", auth, superadminOnly, program.create);
router.get("/program", auth, superadminOnly, program.getAll);
router.get("/program/:id", auth, superadminOnly, program.getById);
router.put("/program/:id", auth, superadminOnly, program.update);
router.delete("/program/:id", auth, superadminOnly, program.delete);

router.post("/kegiatan", auth, superadminOnly, kegiatan.create);
router.get("/kegiatan", auth, superadminOnly, kegiatan.getAll);
router.get("/kegiatan/:id", auth, superadminOnly, kegiatan.getById);
router.put("/kegiatan/:id", auth, superadminOnly, kegiatan.update);
router.delete("/kegiatan/:id", auth, superadminOnly, kegiatan.delete);

router.post("/kepengurusan", auth, superadminOnly, upload.single("foto_pengurus"), kepengurusan.create);
router.put("/kepengurusan/:id", auth, superadminOnly, upload.single("foto_pengurus"), kepengurusan.update);
router.get("/kepengurusan", auth, superadminOnly, kepengurusan.getAll);
router.get("/kepengurusan/:id", auth, superadminOnly, kepengurusan.getById);
router.delete("/kepengurusan/:id", auth, superadminOnly, kepengurusan.delete);

router.get("/keuangan", auth, superadminOnly, keuangan.getAll);
router.get("/inventaris", auth, superadminOnly, inventaris.getAll);
router.get("/jamaah", auth, superadminOnly, jamaah.getAll);
module.exports = router;
