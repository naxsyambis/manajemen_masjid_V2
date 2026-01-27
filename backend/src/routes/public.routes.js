const express = require("express");
const router = express.Router();
const publicController = require("../controllers/public/public.controller");

router.get("/masjid", publicController.listMasjid);
router.get("/masjid/:id", publicController.detailMasjid);

router.get("/berita", publicController.getBerita);
router.get("/program", publicController.getProgram);
router.get("/kegiatan", publicController.getKegiatan);
router.get("/kepengurusan", publicController.getKepengurusan);
router.get("/keuangan", publicController.getKeuangan);
router.get("/inventaris", publicController.getInventaris);
router.get("/jadwal-sholat", publicController.getJadwalSholat);

module.exports = router;
