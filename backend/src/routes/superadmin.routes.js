const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { superadminOnly, takmirOnly } = require("../middleware/role.middleware");

const masjid = require("../controllers/superadmin/masjid.controller");
const takmir = require("../controllers/superadmin/takmir.controller");
const berita = require("../controllers/superadmin/berita.controller");
const program = require("../controllers/superadmin/program.controller");
const kegiatan = require("../controllers/superadmin/kegiatan.controller");
const kepengurusan = require("../controllers/superadmin/kepengurusan.controller");


/* MASJID */
router.post("/masjid", auth, superadminOnly, masjid.create);
router.get("/masjid", auth, superadminOnly, masjid.getAll);
router.get("/masjid/:id", auth, superadminOnly, masjid.getById);
router.put("/masjid/:id", auth, superadminOnly, masjid.update);
router.delete("/masjid/:id", auth, superadminOnly, masjid.delete);

/* TAKMIR */
router.post("/takmir", auth, superadminOnly, takmir.create);

/* BERITA */
router.post("/berita", auth, superadminOnly, berita.create);
router.get("/berita", auth, superadminOnly, berita.getAll);
router.get("/berita/:id", auth, superadminOnly, berita.getById);
router.put("/berita/:id", auth, superadminOnly, berita.update);
router.delete("/berita/:id", auth, superadminOnly, berita.delete);

/* PROGRAM */
router.post("/program", auth, superadminOnly, program.create);
router.get("/program", auth, superadminOnly, program.getAll);
router.get("/program/:id", auth, superadminOnly, program.getById);
router.put("/program/:id", auth, superadminOnly, program.update);
router.delete("/program/:id", auth, superadminOnly, program.delete);

/* KEGIATAN */
router.post("/kegiatan", auth, superadminOnly, kegiatan.create);
router.get("/kegiatan", auth, superadminOnly, kegiatan.getAll);
router.get("/kegiatan/:id", auth, superadminOnly, kegiatan.getById);
router.put("/kegiatan/:id", auth, superadminOnly, kegiatan.update);
router.delete("/kegiatan/:id", auth, superadminOnly, kegiatan.delete);

/* ===================== KEPENGURUSAN ===================== */
router.post("/kepengurusan", auth, superadminOnly, kepengurusan.create);
router.get("/kepengurusan", auth, takmirOnly, kepengurusan.getAll);
router.get("/kepengurusan/:id", auth, takmirOnly, kepengurusan.getById);
router.put("/kepengurusan/:id", auth, takmirOnly, kepengurusan.update);
router.delete("/kepengurusan/:id", auth, takmirOnly, kepengurusan.delete);

module.exports = router;
