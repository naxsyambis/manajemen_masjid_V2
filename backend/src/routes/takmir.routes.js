const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { takmirOnly } = require("../middleware/role.middleware");
const upload = require("../middleware/upload.middleware");

const berita = require('../controllers/takmir/berita.controller');
const keuangan = require('../controllers/takmir/keuangan.controller');
const jamaah = require('../controllers/takmir/jamaah.controller');
const inventaris = require('../controllers/takmir/inventaris.controller');
const kategori = require('../controllers/takmir/kategoriKeuangan.controller');
const rekeningMasjid = require('../controllers/takmir/rekeningMasjid.controller');
const strukturOrganisasi = require('../controllers/takmir/strukturOrganisasi.controller');

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

router.post("/berita", auth, takmirOnly, upload.array("gambar", 10), berita.createBerita);
router.get("/berita", auth, takmirOnly, berita.getAllBerita);
router.get("/berita/:id", auth, takmirOnly, berita.getById);
router.put("/berita/:id", auth, takmirOnly, upload.array("gambar", 10), berita.updateBerita);
router.delete("/berita/:id", auth, takmirOnly, berita.deleteBerita);

router.get("/rekening-masjid", auth, takmirOnly, rekeningMasjid.getAllRekening);
router.post("/rekening-masjid", auth, takmirOnly, rekeningMasjid.createRekening);
router.put("/rekening-masjid/:id", auth, takmirOnly, rekeningMasjid.updateRekening);
router.delete("/rekening-masjid/:id", auth, takmirOnly, rekeningMasjid.deleteRekening);

router.get("/struktur-organisasi", auth, takmirOnly, strukturOrganisasi.getAllStruktur);
router.post("/struktur-organisasi", auth, takmirOnly, upload.fields([{ name: 'foto', maxCount: 1 }, { name: 'ttd', maxCount: 1 }]), strukturOrganisasi.createStruktur);
router.put("/struktur-organisasi/:id", auth, takmirOnly, upload.fields([{ name: 'foto', maxCount: 1 }, { name: 'ttd', maxCount: 1 }]), strukturOrganisasi.updateStruktur);
router.delete("/struktur-organisasi/:id", auth, takmirOnly, strukturOrganisasi.deleteStruktur);

module.exports = router;