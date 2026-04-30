const express = require("express");
const PDFDocument = require("pdfkit");

const router = express.Router();

// =====================================================
// SESUAIKAN PATH DB INI DENGAN PROJECT KAMU
// Contoh umum:
// const db = require("../config/db");
// const db = require("../config/database");
// const db = require("../database/db");
// =====================================================
const db = require("../config/database");

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
// =======================================
const getPenandatangan = async ({ role, masjidId }) => {
  const jabatanDicari = role.toLowerCase();

  // =====================================================
  // PENTING:
  // Sesuaikan nama tabel jika berbeda.
  // Di frontend endpoint kamu namanya struktur-organisasi,
  // tapi nama tabel database bisa saja:
  // struktur_organisasi / kepengurusan / takmir_struktur
  // =====================================================
  const [rows] = await db.query(
    `
    SELECT 
      struktur_id,
      nama,
      jabatan,
      ttd,
      masjid_id
    FROM struktur_organisasi
    WHERE masjid_id = ?
      AND LOWER(jabatan) LIKE ?
    LIMIT 1
    `,
    [masjidId, `%${jabatanDicari}%`]
  );

  return rows?.[0] || null;
};

// =======================================
// HELPER AMBIL DATA KWITANSI / TRANSAKSI
// =======================================
const getDataKwitansi = async ({ nomorDokumen, masjidId }) => {
  try {
    // =====================================================
    // PENTING:
    // Sesuaikan nama tabel dan kolom kalau database kamu beda.
    // Aku pakai contoh tabel: transaksi
    // =====================================================
    const [rows] = await db.query(
      `
      SELECT 
        id,
        tanggal,
        jenis,
        kategori,
        keterangan,
        nominal,
        donatur,
        masjid_id
      FROM transaksi
      WHERE id = ?
        AND masjid_id = ?
      LIMIT 1
      `,
      [nomorDokumen, masjidId]
    );

    return rows?.[0] || null;
  } catch (error) {
    console.error("Gagal mengambil data kwitansi/transaksi:", error.message);
    return null;
  }
};

// =======================================
// GET PDF VERIFIKASI TTD
//
// Contoh URL hasil scan QR:
// http://localhost:3000/verifikasi-ttd/kwitansi/12/ketua?masjid_id=1
// http://localhost:3000/verifikasi-ttd/kwitansi/12/bendahara?masjid_id=1
// =======================================
router.get("/verifikasi-ttd/:jenisDokumen/:nomorDokumen/:role", async (req, res) => {
  try {
    const { jenisDokumen, nomorDokumen, role } = req.params;
    const { masjid_id } = req.query;

    if (!masjid_id) {
      return res.status(400).send("Masjid ID tidak ditemukan pada URL verifikasi.");
    }

    const allowedRoles = ["ketua", "bendahara"];

    if (!allowedRoles.includes(role.toLowerCase())) {
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

    if (jenisDokumen.toLowerCase() === "kwitansi") {
      kwitansi = await getDataKwitansi({
        nomorDokumen,
        masjidId: masjid_id
      });
    }

    const namaMasjid = "MASJID MUHAMMADIYAH";
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
      .text("VERIFIKASI TANDA TANGAN ELEKTRONIK", {
        align: "center"
      });

    doc.moveDown(0.4);

    doc
      .font("Helvetica")
      .fontSize(11)
      .text(namaMasjid, {
        align: "center"
      });

    doc.moveDown(0.3);

    doc
      .font("Helvetica")
      .fontSize(9)
      .text("Dokumen Verifikasi Internal Sistem Manajemen Masjid", {
        align: "center"
      });

    doc.moveDown(1.5);

    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(1.5);

    // =======================================
    // PERNYATAAN
    // =======================================
    doc
      .font("Helvetica")
      .fontSize(10.5)
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
      .text(`Jenis Dokumen      : ${jenisDokumen}`)
      .text(`Nomor Dokumen      : ${nomorDokumen}`)
      .text(`Tanggal Verifikasi : ${formatTanggalIndonesia(tanggalVerifikasi)}`);

    if (kwitansi) {
      doc
        .text(`Tanggal Transaksi  : ${formatTanggalIndonesia(kwitansi.tanggal)}`)
        .text(`Jenis Transaksi    : ${kwitansi.jenis || "-"}`)
        .text(`Kategori           : ${kwitansi.kategori || "-"}`)
        .text(`Pihak Terkait      : ${kwitansi.donatur || "-"}`)
        .text(`Nominal            : ${formatRupiah(kwitansi.nominal)}`)
        .text(`Keterangan         : ${kwitansi.keterangan || "-"}`);
    } else {
      doc.text("Detail Dokumen     : Data detail dokumen tidak ditemukan atau tabel berbeda.");
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