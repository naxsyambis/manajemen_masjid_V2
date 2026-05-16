const express = require("express");
const router = express.Router();
const publicController = require("../controllers/public/public.controller");

// Import controller keuangan dari folder takmir untuk fungsi simpanTtdPenerima
const keuanganController = require("../controllers/takmir/keuangan.controller");

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
router.put("/keuangan/:id/ttd", keuanganController.simpanTtdPenerima);

module.exports = router;