import jsPDF from "jspdf";
import axios from "axios";
import { generateQrTtd } from "./scanTtd";
import logoMu from "../assets/logo_mu.png";

// ======================================================
// KONFIGURASI WARNA
// ======================================================
const THEME = {
  r: 0,
  g: 98,
  b: 39,
};

const GREY = {
  r: 90,
  g: 90,
  b: 90,
};

const LIGHT_GREY = {
  r: 205,
  g: 205,
  b: 205,
};

// ======================================================
// HELPER: CONVERT IMAGE URL KE BASE64
// ======================================================
const imageUrlToBase64 = async (url) => {
  try {
    const response = await axios.get(url, {
      responseType: "blob",
    });

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(response.data);
    });
  } catch (error) {
    console.error("Gagal convert logo:", error);
    return null;
  }
};

// ======================================================
// HELPER: CEK DIMENSI GAMBAR BASE64
// ======================================================
const getImageInfo = (src) => {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
        ratio: img.naturalWidth / img.naturalHeight,
      });
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
};

// ======================================================
// HELPER: TAMBAH GAMBAR DENGAN FIT-CONTAIN
// ======================================================
const addImageContain = async (doc, imageSrc, x, y, boxW, boxH, fallbackType = "PNG") => {
  if (!imageSrc) return false;

  const info = await getImageInfo(imageSrc);
  if (!info || !info.width || !info.height) return false;

  const imageRatio = info.width / info.height;
  const boxRatio = boxW / boxH;

  let drawW = boxW;
  let drawH = boxH;

  if (imageRatio > boxRatio) {
    drawW = boxW;
    drawH = boxW / imageRatio;
  } else {
    drawH = boxH;
    drawW = boxH * imageRatio;
  }

  const drawX = x + (boxW - drawW) / 2;
  const drawY = y + (boxH - drawH) / 2;

  try {
    doc.addImage(imageSrc, fallbackType, drawX, drawY, drawW, drawH);
    return true;
  } catch (error) {
    console.error("Gagal render gambar:", error);
    return false;
  }
};

// ======================================================
// HELPER: TERBILANG
// ======================================================
const terbilang = (angka) => {
  angka = Math.floor(Number(angka || 0));

  const huruf = [
    "",
    "Satu",
    "Dua",
    "Tiga",
    "Empat",
    "Lima",
    "Enam",
    "Tujuh",
    "Delapan",
    "Sembilan",
    "Sepuluh",
    "Sebelas",
  ];

  if (angka < 0) return "";
  if (angka < 12) return huruf[angka];
  if (angka < 20) return `${terbilang(angka - 10)} Belas`;
  if (angka < 100) {
    return `${terbilang(Math.floor(angka / 10))} Puluh ${terbilang(angka % 10)}`.trim();
  }
  if (angka < 200) return `Seratus ${terbilang(angka - 100)}`.trim();
  if (angka < 1000) {
    return `${terbilang(Math.floor(angka / 100))} Ratus ${terbilang(angka % 100)}`.trim();
  }
  if (angka < 2000) return `Seribu ${terbilang(angka - 1000)}`.trim();
  if (angka < 1000000) {
    return `${terbilang(Math.floor(angka / 1000))} Ribu ${terbilang(angka % 1000)}`.trim();
  }
  if (angka < 1000000000) {
    return `${terbilang(Math.floor(angka / 1000000))} Juta ${terbilang(angka % 1000000)}`.trim();
  }
  if (angka < 1000000000000) {
    return `${terbilang(Math.floor(angka / 1000000000))} Miliar ${terbilang(
      angka % 1000000000
    )}`.trim();
  }

  return "";
};

// ======================================================
// HELPER: FORMAT RUPIAH UNTUK STRIP BAWAH
// ======================================================
const formatRupiahKwitansi = (angka) => {
  const value = Math.abs(Number(angka || 0));
  return `Rp. ${value.toLocaleString("id-ID")},00`;
};

// ======================================================
// HELPER: TANGGAL NUMERIK
// ======================================================
const formatTanggalKwitansi = (tanggal) => {
  if (!tanggal) return "-";

  try {
    let date;

    if (typeof tanggal === "string" && /^\d{2}-\d{2}-\d{4}$/.test(tanggal)) {
      const [day, month, year] = tanggal.split("-");
      date = new Date(`${year}-${month}-${day}`);
    } else {
      date = new Date(tanggal);
    }

    if (isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (error) {
    return "-";
  }
};

// ======================================================
// HELPER: BULAN ROMAWI
// ======================================================
const getBulanRomawi = (tanggal) => {
  if (!tanggal) return "I";

  const date = new Date(tanggal);
  if (isNaN(date.getTime())) return "I";

  const month = date.getMonth() + 1;
  const romawi = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

  return romawi[month] || "I";
};

// ======================================================
// HELPER: TITLE CASE
// ======================================================
const toTitleCase = (text) => {
  if (!text) return "-";

  return String(text)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

// ======================================================
// HELPER: AMBIL STRUKTUR PENANDATANGAN
// ======================================================
const getStrukturPenandatangan = async () => {
  try {
    const token = localStorage.getItem("token");
    const masjidId = localStorage.getItem("masjid_id");

    if (!token || !masjidId) {
      return { bendahara: null };
    }

    const res = await axios.get("http://localhost:3000/takmir/struktur-organisasi", {
      params: { masjid_id: masjidId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const struktur = Array.isArray(res.data.data) ? res.data.data : [];

    const bendahara = struktur.find((item) =>
      String(item.jabatan || "")
        .toLowerCase()
        .includes("bendahara")
    );

    return { bendahara: bendahara || null };
  } catch (error) {
    console.error("Gagal mengambil struktur organisasi:", error);
    return { bendahara: null };
  }
};

// ======================================================
// HELPER: AMBIL DETAIL MASJID
// ======================================================
const getDetailMasjid = async () => {
  try {
    const masjidId = localStorage.getItem("masjid_id");
    if (!masjidId) return null;

    const res = await axios.get(`http://localhost:3000/public/masjid/${masjidId}`);
    return res.data.masjid || null;
  } catch (error) {
    console.error("Gagal get masjid:", error);
    return null;
  }
};

// ======================================================
// HELPER: DRAW LABEL DAN VALUE
// ======================================================
const drawInfoRow = ({
  doc,
  label,
  value,
  labelX,
  colonX,
  valueX,
  y,
  maxWidth,
  fontSize = 8.7,
  drawDashedLine = false,
  lineEndX,
}) => {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(fontSize);
  doc.setTextColor(0, 0, 0);
  doc.text(label, labelX, y);

  doc.setFont("helvetica", "normal");
  doc.text(":", colonX, y);

  const splitValue = doc.splitTextToSize(String(value || "-"), maxWidth);
  doc.text(splitValue, valueX, y);

  if (drawDashedLine) {
    doc.setDrawColor(120, 120, 120);
    doc.setLineWidth(0.25);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(valueX - 3, y + 2.4, lineEndX, y + 2.4);
    doc.setLineDashPattern([], 0);
  }

  return splitValue.length;
};

// ======================================================
// GENERATE KWITANSI PDF
// ======================================================
export const generateKwitansiPDF = async (data) => {
  const doc = new jsPDF("l", "mm", "a5");

  // ====================================================
  // DATA DASAR
  // ====================================================
  const detailMasjid = await getDetailMasjid();

  const namaMasjid =
    detailMasjid?.nama_masjid || localStorage.getItem("namaMasjid") || "MASJID";

  const alamatMasjid =
    detailMasjid?.alamat ||
    detailMasjid?.alamat_masjid ||
    detailMasjid?.lokasi ||
    "";

  const masjidId = localStorage.getItem("masjid_id");
  const isPemasukan = data.jenis === "PEMASUKAN";
  const nominalAngka = Math.abs(Number(data.nominal || 0));

  const pihak = isPemasukan
    ? data.donatur || data.penerima || "-"
    : data.penerima || data.donatur || "-";

  // Memotong kata "- Donatur: Hamba Allah" dari keterangan
  let keterangan = data.keterangan || "-";
  if (keterangan.toLowerCase().includes("- donatur:")) {
    keterangan = keterangan.split(/(?:\s-\s)?donatur:/i)[0].trim();
  }

  // ====================================================
  // PERBAIKAN: TANGGAL DINAMIS
  // Menangani property date yang mungkin berbeda untuk pengeluaran
  // ====================================================
  const rawTanggal = data.tanggal || data.tanggal_pengeluaran || data.created_at;

  // ====================================================
  // NOMOR DOKUMEN
  // ====================================================
  const stringKode = detailMasjid?.kode_surat
    ? String(detailMasjid.kode_surat).toUpperCase()
    : "PTM-MSJD";

  const bulanRomawi = getBulanRomawi(rawTanggal);
  const parsedDate = rawTanggal ? new Date(rawTanggal) : new Date();
  const tahun = isNaN(parsedDate.getTime()) ? new Date().getFullYear() : parsedDate.getFullYear();

  const nomorUrut = data.id || data.keuangan_id || data.transaksi_id || 1;
  const nomorDokumen = `${nomorUrut}/${stringKode}/${bulanRomawi}/${tahun}`;

  // ====================================================
  // LOGO DINAMIS
  // ====================================================
  let logoUrl = null;

  if (detailMasjid?.logo_foto && detailMasjid.logo_foto !== "default.jpg") {
    logoUrl = detailMasjid.logo_foto.startsWith("http")
      ? detailMasjid.logo_foto
      : `http://localhost:3000${detailMasjid.logo_foto}`;
  }

  let dynamicLogo = logoUrl ? await imageUrlToBase64(logoUrl) : null;

  const dynamicLogoInfo = dynamicLogo ? await getImageInfo(dynamicLogo) : null;
  if (dynamicLogoInfo && dynamicLogoInfo.ratio > 2.2) {
    dynamicLogo = null;
  }

  // ====================================================
  // TTD BENDAHARA
  // ====================================================
  const { bendahara } = await getStrukturPenandatangan();

  const qrBendahara = await generateQrTtd({
    role: "bendahara",
    nomorDokumen,
    jenisDokumen: "kwitansi",
    masjidId,
    ttd: bendahara?.ttd,
  });

  const namaBendahara = bendahara?.nama || "Bendahara";

  // ====================================================
  // UKURAN LAYOUT (A5 Landscape)
  // ====================================================
  const boxX = 17.2;
  const boxY = 16.15;
  const boxW = 164.0;
  const boxH = 108.75;

  const leftW = 42.1;
  const rightX = boxX + leftW;
  const rightW = boxW - leftW;
  const rightEndX = boxX + boxW;

  const labelX = rightX + 4.4;
  const colonX = rightX + 25.8;
  const valueX = rightX + 31.8;
  const valueMaxW = rightEndX - valueX - 5;

  // ====================================================
  // BACKGROUND DAN BORDER
  // ====================================================
  doc.setFillColor(THEME.r, THEME.g, THEME.b);
  doc.rect(boxX, boxY, leftW, boxH, "F");

  doc.setDrawColor(THEME.r, THEME.g, THEME.b);
  doc.setLineWidth(0.35);
  doc.rect(boxX, boxY, boxW, boxH, "S");

  // Garis vertikal pemisah panel kiri dan kanan
  doc.line(rightX, boxY, rightX, boxY + boxH);

  // ====================================================
  // PANEL KIRI (LOGO, NAMA MASJID, QUOTE)
  // ====================================================
  const logoBoxW = 25;
  const logoBoxH = 25;
  const logoBoxX = boxX + (leftW - logoBoxW) / 2;
  const logoBoxY = boxY + 6.5;

  const logoRendered = await addImageContain(
    doc,
    dynamicLogo || logoMu,
    logoBoxX,
    logoBoxY,
    logoBoxW,
    logoBoxH,
    "PNG"
  );

  if (!logoRendered) {
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.4);
    doc.circle(boxX + leftW / 2, logoBoxY + logoBoxH / 2, 10, "S");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("MASJID", boxX + leftW / 2, logoBoxY + logoBoxH / 2 + 2, {
      align: "center",
    });
  }

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.8);

  const namaMasjidLines = doc.splitTextToSize(String(namaMasjid).toUpperCase(), leftW - 7);
  doc.text(namaMasjidLines, boxX + leftW / 2, boxY + 44, {
    align: "center",
    lineHeightFactor: 1.05,
  });

  if (alamatMasjid) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.2);
    const alamatLines = doc.splitTextToSize(String(alamatMasjid), leftW - 8);
    doc.text(alamatLines.slice(0, 3), boxX + leftW / 2, boxY + 59, {
      align: "center",
      lineHeightFactor: 1.05,
    });
  }

  const quote =
    "Dan barang apa saja yang kamu nafkahkan, maka Allah akan menggantinya dan Dia-lah Pemberi rezeki yang sebaik-baiknya";

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  const quoteLines = doc.splitTextToSize(`"${quote}"`, leftW - 8);

  doc.text(quoteLines, boxX + leftW / 2, boxY + 76, {
    align: "center",
    lineHeightFactor: 1.05,
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.4);
  doc.text("(QS. Saba: 39)", boxX + leftW / 2, boxY + 96, {
    align: "center",
  });

  // ====================================================
  // HEADER KANAN (TANGGAL, NOMOR, KUITANSI, GARIS)
  // ====================================================
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.7);

  doc.text("Tanggal", labelX, boxY + 12);
  doc.text("Nomor", labelX, boxY + 18);

  doc.setFont("helvetica", "normal");
  doc.text(":", colonX, boxY + 12);
  doc.text(":", colonX, boxY + 18);
  doc.text(formatTanggalKwitansi(rawTanggal), valueX, boxY + 12);
  doc.text(nomorDokumen, valueX, boxY + 18);

  // KUITANSI diletakan sejajar dengan Tanggal & Nomor (Rata Kanan)
  doc.setTextColor(THEME.r, THEME.g, THEME.b);
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("KUITANSI", rightEndX - 8, boxY + 15, { align: "right" });

  // Garis Bawah Header
  doc.setDrawColor(GREY.r, GREY.g, GREY.b);
  doc.setLineWidth(0.25);
  doc.line(rightX, boxY + 23, rightEndX, boxY + 23);

  // ====================================================
  // BODY UTAMA
  // ====================================================
  const row1Y = boxY + 33; // Sedikit dinaikkan dari 36 agar lebih proporsional
  const rowGap = 8;

  drawInfoRow({
    doc,
    label: isPemasukan ? "Diterima dari" : "Dibayarkan kpd",
    value: toTitleCase(pihak),
    labelX,
    colonX,
    valueX,
    y: row1Y,
    maxWidth: valueMaxW,
    fontSize: 8.7,
    drawDashedLine: true,
    lineEndX: rightEndX,
  });

  drawInfoRow({
    doc,
    label: "Jumlah",
    value: `${terbilang(nominalAngka)} Rupiah`,
    labelX,
    colonX,
    valueX,
    y: row1Y + rowGap,
    maxWidth: valueMaxW,
    fontSize: 8.7,
    drawDashedLine: true,
    lineEndX: rightEndX,
  });

  drawInfoRow({
    doc,
    label: "Keterangan",
    value: keterangan,
    labelX,
    colonX,
    valueX,
    y: row1Y + rowGap * 2,
    maxWidth: valueMaxW,
    fontSize: 8.7,
    drawDashedLine: false,
    lineEndX: rightEndX,
  });

  // ====================================================
  // GARIS PEMBATAS CATATAN DAN TTD (DIPERBAIKI DISINI)
  // ====================================================
  // Mengubah posisi dari boxY + 71.5 ke boxY + 63.0 untuk memangkas space kosong berlebih
  const bottomSectionLineY = boxY + 63.0;

  doc.setDrawColor(GREY.r, GREY.g, GREY.b);
  doc.setLineWidth(0.25);
  doc.line(rightX, bottomSectionLineY, rightEndX, bottomSectionLineY);

  // ====================================================
  // CATATAN & STRIP NOMINAL (KIRI) -> MENGIKUTI POSISI BARU
  // ====================================================
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("Catatan", labelX, bottomSectionLineY + 5.5);

  const amountBarX = rightX;
  const amountBarY = boxY + 93.6; // Tetap di bawah agar sejajar dengan posisi aman nominal
  const amountBarW = 58.9;
  const amountBarH = 7.4;

  doc.setFillColor(205, 224, 255);
  doc.rect(amountBarX, amountBarY, amountBarW, amountBarH, "F");

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bolditalic");
  doc.setFontSize(9.2);
  doc.text(formatRupiahKwitansi(nominalAngka), amountBarX + amountBarW - 2.2, amountBarY + 5.2, {
    align: "right",
  });

  // ====================================================
  // TTD DINAMIS (KANAN BAWAH) -> DISERASI-KAN JARAKNYA
  // ====================================================
  const signCenterX = rightX + 90.5; 
  const signTitleY = bottomSectionLineY + 6.0; // Teks "Penerima" diletakkan pas di bawah garis baru
  const nameY = boxY + 100.0; // Menyesuaikan agar nama pas diletakkan di bawah barcode tanpa berhimpitan

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);

  doc.text("Penerima", signCenterX, signTitleY, { align: "center" });

  if (isPemasukan) {
    // JENIS PEMASUKAN: Penerima -> Scan Barcode -> Nama Bendahara -> Bendahara
    if (qrBendahara) {
      // Barcode diletakkan pas di bawah judul "Penerima" (signTitleY + 2)
      doc.addImage(qrBendahara, "PNG", signCenterX - 11, signTitleY + 2.5, 21, 21);
    } else {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.line(signCenterX - 16, nameY - 3, signCenterX + 16, nameY - 3);
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    // Menampilkan Nama Bendahara di posisi nameY yang sudah pas
    doc.text(toTitleCase(namaBendahara), signCenterX, nameY, { align: "center" });

    doc.setFont("helvetica", "bold");
    // Jarak dari Nama ke Tulisan "Bendahara" dirapatkan menjadi +3.8 (tidak kejauhan lagi)
    doc.text("Bendahara", signCenterX, nameY + 3.8, { align: "center" });

  } else {
    // JENIS PENGELUARAN: Penerima -> Space TTD -> Nama Penerima/Donatur
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(signCenterX - 18, nameY - 3, signCenterX + 18, nameY - 3);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.text(toTitleCase(pihak), signCenterX, nameY, { align: "center" });
  }

  // ====================================================
  // SAVE PDF
  // ====================================================
  const cleanNomorDokumen = nomorDokumen.replace(/\//g, "-");
  doc.save(`Kwitansi_${cleanNomorDokumen}.pdf`);
};