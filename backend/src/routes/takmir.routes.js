const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { takmirOnly } = require("../middleware/role.middleware");

const keuangan = require("../controllers/takmir/keuangan.controller");
const jamaah = require("../controllers/takmir/jamaah.controller");
const inventaris = require("../controllers/takmir/inventaris.controller");
const kategori = require("../controllers/takmir/kategoriKeuangan.controller");
const berita = require("../controllers/takmir/berita.controller");
const upload = require("../middleware/upload.middleware");

router.post("/keuangan", auth, takmirOnly, keuangan.create);
router.get("/keuangan", auth, takmirOnly, keuangan.getAll);
router.get("/keuangan/report", auth, takmirOnly, keuangan.generateReport);
router.get("/keuangan/:id", auth, takmirOnly, keuangan.getById);
router.put("/keuangan/:id", auth, takmirOnly, keuangan.update);
router.delete("/keuangan/:id", auth, takmirOnly, keuangan.delete);


router.post("/jamaah", auth, takmirOnly, jamaah.create);
router.get("/jamaah", auth, takmirOnly, jamaah.getAll);
router.get("/jamaah/:id", auth, takmirOnly, jamaah.getById);
router.put("/jamaah/:id", auth, takmirOnly, jamaah.update);
router.delete("/jamaah/:id", auth, takmirOnly, jamaah.delete);

router.post("/inventaris", auth, takmirOnly, inventaris.create);
router.get("/inventaris", auth, takmirOnly, inventaris.getAll);
router.get("/inventaris/:id", auth, takmirOnly, inventaris.getById);
router.put("/inventaris/:id", auth, takmirOnly, inventaris.update);
router.delete("/inventaris/:id", auth, takmirOnly, inventaris.delete);

router.post("/kategori-keuangan", auth, takmirOnly, kategori.create);
router.get("/kategori-keuangan", auth, takmirOnly, kategori.getAll);
router.get("/kategori-keuangan/:id", auth, takmirOnly, kategori.getById);
router.put("/kategori-keuangan/:id", auth, takmirOnly, kategori.update);
router.delete("/kategori-keuangan/:id", auth, takmirOnly, kategori.delete);

router.post("/berita", auth, takmirOnly, upload.array("gambar", 10), berita.create);
router.get("/berita", auth, takmirOnly, berita.getAll);
router.get("/berita/:id", auth, takmirOnly, berita.getById);
router.put("/berita/:id", auth, takmirOnly, upload.array("gambar", 10), berita.update);
router.delete("/berita/:id", auth, takmirOnly, berita.delete);

module.exports = router;
