const express = require("express");
const PDFDocument = require("pdfkit");
const { Op } = require("sequelize");

const {
  StrukturOrganisasi,
  Keuangan,
  KategoriKeuangan
} = require("../models");

const router = express.Router();

// =======================================
// HELPER FORMAT RUPIAH
// =======================================
const formatRupiah = (angka) => {
  const number = Number(angka || 0);

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(number);
};

// =======================================
// HELPER FORMAT TANGGAL INDONESIA
// =======================================
const formatTanggalIndonesia = (tanggal) => {
  if (!tanggal) return "-";

  try {
    return new Date(tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch (error) {
    return tanggal;
  }
};

// =======================================
// HELPER AMBIL PENANDATANGAN
// role: ketua / bendahara
// Ambil dari StrukturOrganisasi sesuai masjid_id
// =======================================
const getPenandatangan = async ({ role, masjidId }) => {
  try {
    const jabatanDicari = String(role || "").toLowerCase();

    const penandatangan = await StrukturOrganisasi.findOne({
      where: {
        masjid_id: masjidId,
        jabatan: {
          [Op.like]: `%${jabatanDicari}%`
        }
      },
      order: [["struktur_id", "ASC"]]
    });

    return penandatangan ? penandatangan.get({ plain: true }) : null;
  } catch (error) {
    console.error("Gagal mengambil penandatangan:", error.message);
    return null;
  }
};

// =======================================
// HELPER AMBIL DATA KWITANSI / KEUANGAN
// Sesuai controller keuangan kamu:
// model Keuangan, primary key: keuangan_id
// =======================================
const getDataKwitansi = async ({ nomorDokumen, masjidId }) => {
  try {
    const kwitansi = await Keuangan.findOne({
      where: {
        keuangan_id: nomorDokumen,
        masjid_id: masjidId
      },
      include: [
        {
          model: KategoriKeuangan,
          as: "kategori_keuangan",
          required: false
        }
      ]
    });

    return kwitansi ? kwitansi.get({ plain: true }) : null;
  } catch (error) {
    console.error("Gagal mengambil data kwitansi/keuangan:", error.message);
    return null;
  }
};

// =======================================
// HELPER AMBIL KATEGORI
// =======================================
const getKategoriText = (item) => {
  if (!item) return "-";

  const kategori = item.kategori_keuangan || {};

  return (
    kategori.nama_kategori ||
    kategori.nama ||
    kategori.kategori ||
    kategori.jenis ||
    kategori.tipe ||
    "-"
  );
};

// =======================================
// HELPER AMBIL JENIS TRANSAKSI
// =======================================
const getJenisTransaksi = (item) => {
  if (!item) return "-";

  const jumlah = Number(item.jumlah || 0);
  const kategoriText = String(getKategoriText(item) || "").toLowerCase();

  if (jumlah < 0) return "KELUAR";

  if (
    kategoriText.includes("pengeluaran") ||
    kategoriText.includes("keluar") ||
    kategoriText.includes("out")
  ) {
    return "KELUAR";
  }

  if (
    kategoriText.includes("pemasukan") ||
    kategoriText.includes("masuk") ||
    kategoriText.includes("in")
  ) {
    return "MASUK";
  }

  return jumlah < 0 ? "KELUAR" : "MASUK";
};

// =======================================
// HELPER NOMINAL
// =======================================
const getNominal = (item) => {
  if (!item) return 0;
  return Number(item.jumlah || item.nominal || 0);
};

// =======================================
// TEST ROUTE
// =======================================
router.get("/verifikasi-ttd/test", (req, res) => {
  res.send("Route verifikasi TTD aktif ✅");
});

// =======================================
// GET PDF VERIFIKASI TTD
//
// Contoh URL hasil scan QR:
// /verifikasi-ttd/kwitansi/12/ketua?masjid_id=1&nama_masjid=MASJID%20AHMAD%20DAHLAN
// /verifikasi-ttd/kwitansi/12/bendahara?masjid_id=1&nama_masjid=MASJID%20AHMAD%20DAHLAN
// =======================================
router.get("/verifikasi-ttd/:jenisDokumen/:nomorDokumen/:role", async (req, res) => {
  try {
    const { jenisDokumen, nomorDokumen, role } = req.params;
    const { masjid_id, nama_masjid } = req.query;

    if (!masjid_id) {
      return res
        .status(400)
        .send("Masjid ID tidak ditemukan pada URL verifikasi.");
    }

    const allowedRoles = ["ketua", "bendahara"];

    if (!allowedRoles.includes(String(role || "").toLowerCase())) {
      return res.status(400).send("Role penandatangan tidak valid.");
    }

    const penandatangan = await getPenandatangan({
      role,
      masjidId: masjid_id
    });

    if (!penandatangan) {
      return res.status(404).send("Data penandatangan tidak ditemukan.");
    }

    if (!penandatangan.ttd) {
      return res.status(404).send("Penandatangan belum memiliki TTD elektronik.");
    }

    let kwitansi = null;

    if (String(jenisDokumen || "").toLowerCase() === "kwitansi") {
      kwitansi = await getDataKwitansi({
        nomorDokumen,
        masjidId: masjid_id
      });
    }

    const namaMasjid =
      nama_masjid && nama_masjid !== "-"
        ? nama_masjid
        : "-";

    const tanggalVerifikasi = new Date();

    const doc = new PDFDocument({
      size: "A4",
      margin: 50
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=Verifikasi_TTD_${jenisDokumen}_${nomorDokumen}_${role}.pdf`
    );

    doc.pipe(res);

    // =======================================
    // HEADER
    // =======================================
    doc
      .font("Helvetica-Bold")
      .fontSize(17)
      .fillColor("#006227")
      .text("VERIFIKASI TANDA TANGAN ELEKTRONIK", {
        align: "center"
      });

    doc.moveDown(0.4);

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#006227")
      .text(String(namaMasjid || "-").toUpperCase(), {
        align: "center"
      });

    doc.moveDown(0.3);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("black")
      .text("Dokumen Verifikasi Internal Sistem Manajemen Masjid", {
        align: "center"
      });

    doc.moveDown(1.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke("#006227");

    doc.moveDown(1.5);

    // =======================================
    // PERNYATAAN AWAL
    // =======================================
    doc
      .font("Helvetica")
      .fontSize(10.5)
      .fillColor("black")
      .text(
        "Dokumen ini merupakan PDF verifikasi tanda tangan elektronik yang dibuat oleh sistem berdasarkan data tanda tangan yang tersimpan pada Struktur Organisasi Takmir Masjid.",
        {
          align: "justify"
        }
      );

    doc.moveDown(1);

    // =======================================
    // DATA PENANDATANGAN
    // =======================================
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("black")
      .text("A. DATA PENANDATANGAN");

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Nama Penandatangan : ${penandatangan.nama || "-"}`)
      .text(`Jabatan            : ${penandatangan.jabatan || "-"}`)
      .text(`ID Struktur        : ${penandatangan.struktur_id || "-"}`)
      .text("Status TTD         : Tersedia pada data struktur organisasi")
      .text(`Masjid ID          : ${penandatangan.masjid_id || masjid_id}`);

    doc.moveDown(1);

    // =======================================
    // DATA DOKUMEN
    // =======================================
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("B. DATA DOKUMEN");

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Jenis Dokumen      : ${jenisDokumen || "-"}`)
      .text(`Nomor Dokumen      : ${nomorDokumen || "-"}`)
      .text(`Tanggal Verifikasi : ${formatTanggalIndonesia(tanggalVerifikasi)}`);

    if (kwitansi) {
      doc
        .text(`Tanggal Transaksi  : ${formatTanggalIndonesia(kwitansi.tanggal)}`)
        .text(`Jenis Transaksi    : ${getJenisTransaksi(kwitansi)}`)
        .text(`Kategori           : ${getKategoriText(kwitansi)}`)
        .text(`Pihak Terkait      : ${kwitansi.nama_donatur || "Hamba Allah"}`)
        .text(`Nominal            : ${formatRupiah(Math.abs(getNominal(kwitansi)))}`)
        .text(`Keterangan         : ${kwitansi.deskripsi || "-"}`);
    } else {
      doc.text("Detail Dokumen     : Data detail dokumen tidak ditemukan.");
    }

    doc.moveDown(1);

    // =======================================
    // STATUS VERIFIKASI
    // =======================================
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("C. STATUS VERIFIKASI");

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(10)
      .text("Status             : VALID SECARA INTERNAL")
      .text("Keterangan         : QR berasal dari dokumen yang dibuat oleh sistem dan mengarah ke halaman PDF verifikasi ini.");

    doc.moveDown(1.5);

    // =======================================
    // PERNYATAAN RESMI INTERNAL
    // =======================================
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("D. PERNYATAAN");

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(10)
      .text(
        "Dengan ini dinyatakan bahwa tanda tangan elektronik pada dokumen terkait telah diverifikasi berdasarkan data penandatangan yang tersimpan di sistem manajemen masjid. Keabsahan dokumen dapat dicocokkan berdasarkan nomor dokumen, nama penandatangan, jabatan, dan data transaksi yang tercantum.",
        {
          align: "justify"
        }
      );

    doc.moveDown(2);

    // =======================================
    // PENUTUP
    // =======================================
    doc
      .font("Helvetica")
      .fontSize(10)
      .text(`Diverifikasi pada: ${tanggalVerifikasi.toLocaleString("id-ID")}`, {
        align: "right"
      });

    doc.moveDown(1.5);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .text("Sistem Manajemen Masjid", {
        align: "right"
      });

    doc.moveDown(3);

    doc
      .font("Helvetica-Oblique")
      .fontSize(8)
      .fillColor("gray")
      .text(
        "Catatan: Verifikasi ini berlaku sebagai validasi internal sistem, bukan TTE tersertifikasi dari Penyelenggara Sertifikasi Elektronik.",
        {
          align: "center"
        }
      );

    doc.end();
  } catch (error) {
    console.error("Gagal membuat PDF verifikasi TTD:", error);
    res.status(500).send("Gagal membuat PDF verifikasi TTD.");
  }
});

module.exports = router;