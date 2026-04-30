const express = require("express");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");
const { Op } = require("sequelize");

const {
  Keuangan,
  KategoriKeuangan,
  StrukturOrganisasi,
  RekeningMasjid
} = require("../models");

const router = express.Router();

// =======================================
// PATH KOP SURAT BACKEND
// Path ini mengambil kop dari frontend.
// Pastikan file ini benar-benar ada:
// frontend/src/assets/kop-surat.jpeg
// =======================================
const KOP_SURAT_PATH = path.join(
  __dirname,
  "../../../frontend/src/assets/kop-surat.jpeg"
);

// =======================================
// FORMAT RUPIAH
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
// FORMAT TANGGAL
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
// AMBIL TRANSAKSI KEUANGAN PERIODE
// =======================================
const getTransaksiPeriode = async ({ masjidId, startDate, endDate }) => {
  try {
    const data = await Keuangan.findAll({
      where: {
        masjid_id: masjidId,
        tanggal: {
          [Op.gte]: startDate,
          [Op.lte]: endDate
        }
      },
      include: [
        {
          model: KategoriKeuangan,
          as: "kategori_keuangan",
          required: false
        }
      ],
      order: [["tanggal", "ASC"]]
    });

    return data.map((item) => item.get({ plain: true }));
  } catch (error) {
    console.error("Gagal mengambil data keuangan periode:", error.message);
    return [];
  }
};

// =======================================
// AMBIL KETUA & BENDAHARA DARI STRUKTUR ORGANISASI
// =======================================
const getStrukturPenandatangan = async (masjidId) => {
  try {
    const struktur = await StrukturOrganisasi.findAll({
      where: {
        masjid_id: masjidId
      },
      order: [["struktur_id", "ASC"]]
    });

    const data = struktur.map((item) => item.get({ plain: true }));

    const ketua = data.find((item) =>
      item.jabatan?.toLowerCase().includes("ketua")
    );

    const bendahara = data.find((item) =>
      item.jabatan?.toLowerCase().includes("bendahara")
    );

    return {
      ketua: ketua || null,
      bendahara: bendahara || null
    };
  } catch (error) {
    console.error("Gagal mengambil struktur organisasi:", error.message);

    return {
      ketua: null,
      bendahara: null
    };
  }
};

// =======================================
// AMBIL REKENING MASJID
// =======================================
const getRekeningMasjid = async (masjidId) => {
  try {
    const rekening = await RekeningMasjid.findAll({
      where: {
        masjid_id: masjidId
      }
    });

    const data = rekening.map((item) => item.get({ plain: true }));

    if (data.length === 0) {
      return "-";
    }

    return data
      .map((item) => {
        const namaBank = item.nama_bank || "-";
        const noRekening = item.no_rekening || "-";
        const atasNama = item.atas_nama || "-";

        return `${namaBank} ${noRekening} a.n ${atasNama}`;
      })
      .join("\n");
  } catch (error) {
    console.error("Gagal mengambil rekening masjid:", error.message);
    return "-";
  }
};

// =======================================
// AMBIL NOMINAL ASLI DARI KEUANGAN
// =======================================
const getNominalRaw = (item) => {
  return Number(item.jumlah || 0);
};

// =======================================
// AMBIL INFO KATEGORI
// =======================================
const getKategoriText = (item) => {
  const kategori = item.kategori_keuangan || {};

  return String(
    kategori.nama_kategori ||
      kategori.nama ||
      kategori.kategori ||
      kategori.jenis ||
      kategori.tipe ||
      item.kategori ||
      item.jenis ||
      item.tipe ||
      ""
  ).toLowerCase();
};

// =======================================
// NOMINAL BERTANDA
// =======================================
const getNominalSigned = (item) => {
  const rawNumber = getNominalRaw(item);

  if (rawNumber < 0) {
    return rawNumber;
  }

  const raw = Math.abs(rawNumber);
  const kategoriText = getKategoriText(item);

  if (
    kategoriText.includes("pengeluaran") ||
    kategoriText.includes("keluar") ||
    kategoriText.includes("out")
  ) {
    return -raw;
  }

  if (
    kategoriText.includes("pemasukan") ||
    kategoriText.includes("masuk") ||
    kategoriText.includes("in")
  ) {
    return raw;
  }

  return rawNumber;
};

// =======================================
// JENIS TRANSAKSI
// =======================================
const getJenisTransaksi = (item) => {
  const signed = getNominalSigned(item);
  return signed < 0 ? "KELUAR" : "MASUK";
};

// =======================================
// DESKRIPSI
// =======================================
const getDeskripsi = (item) => {
  return item.deskripsi || "-";
};

// =======================================
// PIHAK / DONATUR
// =======================================
const getPihak = (item) => {
  return item.nama_donatur || "Hamba Allah";
};

// =======================================
// PATH FILE TTD
// Upload controller menyimpan di backend/uploads/ttd
// Field DB hanya nama file: ttd
// =======================================
const getTtdImagePath = (ttd) => {
  if (!ttd) return null;

  if (ttd.startsWith("http")) {
    return null;
  }

  const cleanPath = ttd.replace(/^\/+/, "");

  if (cleanPath.startsWith("uploads/")) {
    return path.join(__dirname, "../..", cleanPath);
  }

  return path.join(__dirname, "../../uploads/ttd", cleanPath);
};

// =======================================
// GAMBAR KOP FULL PAGE
// =======================================
const drawPageTemplate = (doc) => {
  try {
    if (fs.existsSync(KOP_SURAT_PATH)) {
      doc.image(KOP_SURAT_PATH, 0, 0, {
        width: doc.page.width,
        height: doc.page.height
      });
    } else {
      console.error("Kop surat tidak ditemukan di:", KOP_SURAT_PATH);
    }
  } catch (error) {
    console.error("Gagal memuat kop surat:", error.message);
  }
};

// =======================================
// HEADER PDF
// =======================================
const drawHeader = ({ doc, namaMasjid, startDate, endDate }) => {
  drawPageTemplate(doc);

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor("#006227")
    .text((namaMasjid || "-").toUpperCase(), 40, 135, {
      width: 515,
      align: "center"
    });

  doc
    .font("Helvetica-Bold")
    .fontSize(17)
    .fillColor("#006227")
    .text("LAPORAN REKAPITULASI KEUANGAN", 40, 158, {
      width: 515,
      align: "center"
    });

  doc
    .moveTo(155, 184)
    .lineTo(440, 184)
    .stroke("#006227");

  doc
    .font("Helvetica-Oblique")
    .fontSize(10)
    .fillColor("black")
    .text(
      `Periode: ${formatTanggalIndonesia(startDate)} s/d ${formatTanggalIndonesia(endDate)}`,
      40,
      194,
      {
        width: 515,
        align: "center"
      }
    );
};

// =======================================
// RINGKASAN
// =======================================
const drawRingkasan = ({ doc, totalMasuk, totalKeluar, saldoAkhir }) => {
  doc
    .roundedRect(40, 220, 515, 70, 8)
    .fillAndStroke("#ffffff", "#dddddd");

  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor("#006227")
    .text("Total Pemasukan", 55, 237);

  doc.text(formatRupiah(totalMasuk), 430, 237, {
    width: 100,
    align: "right"
  });

  doc
    .fillColor("#b00000")
    .text("Total Pengeluaran", 55, 255);

  doc.text(formatRupiah(totalKeluar), 430, 255, {
    width: 100,
    align: "right"
  });

  doc
    .moveTo(55, 269)
    .lineTo(535, 269)
    .stroke("#dddddd");

  doc
    .fillColor("black")
    .text("SALDO AKHIR PERIODE", 55, 275);

  doc.text(formatRupiah(saldoAkhir), 430, 275, {
    width: 100,
    align: "right"
  });
};

// =======================================
// DEFINISI KOLOM TABEL
// =======================================
const getTableColumns = () => {
  return {
    tableX: 40,
    tableWidth: 515,
    no: { x: 40, width: 35 },
    tanggal: { x: 75, width: 80 },
    jenis: { x: 155, width: 70 },
    pihak: { x: 225, width: 105 },
    nominal: { x: 330, width: 95 },
    keterangan: { x: 425, width: 130 }
  };
};

// =======================================
// TABLE HEADER
// =======================================
const drawTableHeader = (doc, y) => {
  const col = getTableColumns();
  const headerHeight = 20;
  const textY = y + 6;

  doc.rect(col.tableX, y, col.tableWidth, headerHeight).fill("#006227");

  doc.font("Helvetica-Bold").fontSize(8).fillColor("white");

  doc.text("No", col.no.x, textY, {
    width: col.no.width,
    align: "center"
  });

  doc.text("Tanggal", col.tanggal.x, textY, {
    width: col.tanggal.width,
    align: "center"
  });

  doc.text("Jenis", col.jenis.x, textY, {
    width: col.jenis.width,
    align: "center"
  });

  doc.text("Pihak/Donatur", col.pihak.x, textY, {
    width: col.pihak.width,
    align: "center"
  });

  doc.text("Nominal", col.nominal.x, textY, {
    width: col.nominal.width,
    align: "center"
  });

  doc.text("Keterangan", col.keterangan.x, textY, {
    width: col.keterangan.width,
    align: "center"
  });

  doc.fillColor("black");

  return y + headerHeight;
};

// =======================================
// TABLE ROW
// =======================================
const drawTableRow = (doc, item, index, y) => {
  const signedNominal = getNominalSigned(item);
  const jenis = getJenisTransaksi(item);
  const deskripsi = getDeskripsi(item);
  const pihak = getPihak(item);
  const col = getTableColumns();

  const paddingX = 4;
  const paddingY = 7;

  doc.font("Helvetica").fontSize(7).fillColor("black");

  const deskripsiHeight = doc.heightOfString(deskripsi, {
    width: col.keterangan.width - paddingX * 2,
    align: "left"
  });

  const rowHeight = Math.max(28, deskripsiHeight + 14);

  // Border row
  doc.rect(col.tableX, y, col.tableWidth, rowHeight).stroke("#dddddd");

  // Garis vertikal antar kolom
  doc
    .moveTo(col.tanggal.x, y)
    .lineTo(col.tanggal.x, y + rowHeight)
    .stroke("#eeeeee");

  doc
    .moveTo(col.jenis.x, y)
    .lineTo(col.jenis.x, y + rowHeight)
    .stroke("#eeeeee");

  doc
    .moveTo(col.pihak.x, y)
    .lineTo(col.pihak.x, y + rowHeight)
    .stroke("#eeeeee");

  doc
    .moveTo(col.nominal.x, y)
    .lineTo(col.nominal.x, y + rowHeight)
    .stroke("#eeeeee");

  doc
    .moveTo(col.keterangan.x, y)
    .lineTo(col.keterangan.x, y + rowHeight)
    .stroke("#eeeeee");

  const centerTextY = y + rowHeight / 2 - 4;

  doc.fillColor("black").font("Helvetica").fontSize(7);

  doc.text(String(index + 1), col.no.x, centerTextY, {
    width: col.no.width,
    align: "center"
  });

  doc.text(formatTanggalIndonesia(item.tanggal), col.tanggal.x, centerTextY, {
    width: col.tanggal.width,
    align: "center"
  });

  doc.text(jenis, col.jenis.x, centerTextY, {
    width: col.jenis.width,
    align: "center"
  });

  // INI SUDAH DI-TENGAHKAN
  doc.text(pihak, col.pihak.x + paddingX, centerTextY, {
    width: col.pihak.width - paddingX * 2,
    align: "center"
  });

  // INI SUDAH DI-TENGAHKAN
  doc.text(formatRupiah(Math.abs(signedNominal)), col.nominal.x + paddingX, centerTextY, {
    width: col.nominal.width - paddingX * 2,
    align: "center"
  });

  doc.text(deskripsi, col.keterangan.x + paddingX, y + paddingY, {
    width: col.keterangan.width - paddingX * 2,
    align: "left"
  });

  return y + rowHeight;
};

// =======================================
// TANDA TANGAN BIASA
// KIRI: KETUA
// KANAN: BENDAHARA
// =======================================
const drawTandaTangan = ({
  doc,
  y,
  ketua,
  bendahara,
  namaMasjid,
  tanggalCetak
}) => {
  const ketuaX = 105;
  const bendaharaX = 380;

  doc.font("Helvetica").fontSize(10).fillColor("black");

  doc.text(`Yogyakarta, ${formatTanggalIndonesia(tanggalCetak)}`, bendaharaX, y, {
    width: 120,
    align: "center"
  });

  doc.text("Ketua,", ketuaX, y + 16, {
    width: 120,
    align: "center"
  });

  doc.text("Bendahara,", bendaharaX, y + 16, {
    width: 120,
    align: "center"
  });

  // TTD Ketua
  if (ketua?.ttd) {
    try {
      const ketuaTtdPath = getTtdImagePath(ketua.ttd);

      if (ketuaTtdPath && fs.existsSync(ketuaTtdPath)) {
        doc.image(ketuaTtdPath, ketuaX + 35, y + 29, {
          width: 50,
          height: 28
        });
      } else {
        doc.moveTo(ketuaX + 25, y + 61).lineTo(ketuaX + 95, y + 61).stroke();
      }
    } catch (error) {
      console.error("Gagal memuat TTD Ketua:", error.message);
      doc.moveTo(ketuaX + 25, y + 61).lineTo(ketuaX + 95, y + 61).stroke();
    }
  } else {
    doc.moveTo(ketuaX + 25, y + 61).lineTo(ketuaX + 95, y + 61).stroke();
  }

  // TTD Bendahara
  if (bendahara?.ttd) {
    try {
      const bendaharaTtdPath = getTtdImagePath(bendahara.ttd);

      if (bendaharaTtdPath && fs.existsSync(bendaharaTtdPath)) {
        doc.image(bendaharaTtdPath, bendaharaX + 35, y + 29, {
          width: 50,
          height: 28
        });
      } else {
        doc
          .moveTo(bendaharaX + 25, y + 61)
          .lineTo(bendaharaX + 95, y + 61)
          .stroke();
      }
    } catch (error) {
      console.error("Gagal memuat TTD Bendahara:", error.message);
      doc
        .moveTo(bendaharaX + 25, y + 61)
        .lineTo(bendaharaX + 95, y + 61)
        .stroke();
    }
  } else {
    doc
      .moveTo(bendaharaX + 25, y + 61)
      .lineTo(bendaharaX + 95, y + 61)
      .stroke();
  }

  doc.font("Helvetica-Bold").fontSize(9).fillColor("black");

  doc.text((ketua?.nama || "-").toUpperCase(), ketuaX, y + 67, {
    width: 120,
    align: "center"
  });

  doc.text((bendahara?.nama || "-").toUpperCase(), bendaharaX, y + 67, {
    width: 120,
    align: "center"
  });

  doc.font("Helvetica").fontSize(8).fillColor("black");

  doc.text(namaMasjid || "-", ketuaX, y + 80, {
    width: 120,
    align: "center"
  });

  doc.text(namaMasjid || "-", bendaharaX, y + 80, {
    width: 120,
    align: "center"
  });
};

// =======================================
// TEST ROUTE
// =======================================
router.get("/laporan-keuangan/test", (req, res) => {
  res.send("Route laporan keuangan aktif ✅");
});

// =======================================
// ROUTE PDF LAPORAN ASLI
// =======================================
router.get("/laporan-keuangan/verifikasi-pdf", async (req, res) => {
  try {
    const { masjid_id, nama_masjid, startDate, endDate } = req.query;

    if (!masjid_id || !startDate || !endDate) {
      return res
        .status(400)
        .send("Parameter masjid_id, startDate, dan endDate wajib diisi.");
    }

    const namaMasjid = nama_masjid && nama_masjid !== "-" ? nama_masjid : "-";

    const transaksi = await getTransaksiPeriode({
      masjidId: masjid_id,
      startDate,
      endDate
    });

    const { ketua, bendahara } = await getStrukturPenandatangan(masjid_id);
    const rekeningMasjid = await getRekeningMasjid(masjid_id);

    const totalMasuk = transaksi
      .filter((item) => getNominalSigned(item) > 0)
      .reduce((sum, item) => sum + getNominalSigned(item), 0);

    const totalKeluar = transaksi
      .filter((item) => getNominalSigned(item) < 0)
      .reduce((sum, item) => sum + Math.abs(getNominalSigned(item)), 0);

    const saldoAkhir = totalMasuk - totalKeluar;

    const doc = new PDFDocument({
      size: "A4",
      margin: 40
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=Laporan_Keuangan_${startDate}_sd_${endDate}.pdf`
    );

    doc.pipe(res);

    drawHeader({
      doc,
      namaMasjid,
      startDate,
      endDate
    });

    drawRingkasan({
      doc,
      totalMasuk,
      totalKeluar,
      saldoAkhir
    });

    let y = 315;
    y = drawTableHeader(doc, y);

    transaksi.forEach((item, index) => {
      if (y > 640) {
        doc.addPage();
        drawPageTemplate(doc);

        y = 120;

        doc
          .font("Helvetica-Bold")
          .fontSize(12)
          .fillColor("#006227")
          .text((namaMasjid || "-").toUpperCase(), 40, 70, {
            width: 515,
            align: "center"
          });

        y = drawTableHeader(doc, y);
      }

      y = drawTableRow(doc, item, index, y);
    });

    if (transaksi.length === 0) {
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("black")
        .text("Tidak ada transaksi pada periode ini.", 45, y + 10);

      y += 35;
    }

    if (y > 570) {
      doc.addPage();
      drawPageTemplate(doc);
      y = 120;
    }

    drawTandaTangan({
      doc,
      y: 575,
      ketua,
      bendahara,
      namaMasjid,
      tanggalCetak: new Date()
    });

    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("black")
      .text("Rekening Masjid:", 40, 705);

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor("black")
      .text(
        rekeningMasjid && rekeningMasjid !== "-"
          ? rekeningMasjid
          : "Rekening masjid belum diatur.",
        40,
        720,
        {
          width: 260
        }
      );

    doc
      .font("Helvetica-Oblique")
      .fontSize(8)
      .fillColor("gray")
      .text("*Bukti ini sah sebagai dokumen internal masjid.", 40, 780, {
        width: 515,
        align: "right"
      });

    doc.end();
  } catch (error) {
    console.error("Gagal membuat laporan keuangan PDF:", error);
    res.status(500).send("Gagal membuat laporan keuangan PDF.");
  }
});

module.exports = router;