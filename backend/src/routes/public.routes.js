const express = require("express");
const router = express.Router();
const publicController = require("../controllers/public/public.controller");

router.get("/masjid/nearest", publicController.getNearestMasjid);
router.get("/masjid", publicController.listMasjid);
router.get("/masjid/:id", publicController.detailMasjid);

router.get("/berita", publicController.getBerita);
router.get("/berita/:id", publicController.getBeritaById);
router.get("/program", publicController.getProgram);
router.get("/kegiatan", publicController.getKegiatan);
router.get("/kepengurusan", publicController.getKepengurusan);
router.get("/keuangan", publicController.getKeuangan);
router.get("/inventaris", publicController.getInventaris);
router.get("/jadwal-sholat", publicController.getJadwalSholat);
router.get("/struktur-organisasi", publicController.getStrukturOrganisasi);
router.get("/kegiatan/:id", publicController.getKegiatanById);
router.get("/program/:id", publicController.getProgramById);

module.exports = router;
