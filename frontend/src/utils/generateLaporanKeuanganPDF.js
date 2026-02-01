import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatRupiah } from "./formatCurrency";
import { formatTanggal } from "./formatDate";
import logoKop from "../assets/kop-surat.png"; // Pastikan file benar-benar ada di folder assets

export const generateLaporanKeuanganPDF = async (
  transaksi,
  startDate,
  endDate
) => {
  const doc = new jsPDF("p", "mm", "a4");

  // ===============================
// HELPER: URL IMAGE → BASE64
// ===============================
const imageUrlToBase64 = async (url) => {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = url;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");

  // ⬇️ INI KUNCINYA: isi background putih dulu
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(img, 0, 0);

  // Return Base64 PNG TANPA alpha
  return canvas.toDataURL("image/png");
};
  // ==========================================
  // AMBIL DATA REAL DARI LOCALSTORAGE
  // ==========================================
const ttdPath = localStorage.getItem("ttdImage"); // contoh: /uploads/ttd/xxx.webp
const ttdUrl = ttdPath
  ? `http://localhost:3000${ttdPath}`
  : null;

const namaMasjid = localStorage.getItem('namaMasjid') || "MASJID JOGOKARYAN";
const namaTakmir = localStorage.getItem('userName') || "Takmir Masjid"; 

  // ==========================================
  // HITUNG TOTAL (DIPERKUAT DENGAN PARSEFLOAT)
  // ==========================================
  const totalMasuk = transaksi
    .filter(t => parseFloat(t.jumlah) > 0)
    .reduce((sum, t) => sum + parseFloat(t.jumlah), 0);

  const totalKeluar = transaksi
    .filter(t => parseFloat(t.jumlah) < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.jumlah)), 0);

  const saldoAkhir = totalMasuk - totalKeluar;

  // Fungsi untuk memasang Kop Background (Header & Footer)
  const addPageTemplate = () => {
    try {
      // Pasang gambar full page (210x297 mm untuk A4)
      doc.addImage(logoKop, "PNG", 0, 0, 210, 297);
    } catch (error) {
      console.error("Gagal memuat template kop surat:", error);
    }
  };

  // Jalankan template pada halaman pertama
  addPageTemplate();

  // ==========================================
  // JUDUL & RINGKASAN
  // ==========================================
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("LAPORAN REKAPITULASI KEUANGAN", 105, 55, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text(
    `Periode: ${formatTanggal(startDate)} s/d ${formatTanggal(endDate)}`,
    105,
    62,
    { align: "center" }
  );

  // Box Ringkasan (FD = Fill & Draw)
  doc.setDrawColor(220);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 70, 180, 28, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 98, 39);
  doc.text("Total Pemasukan", 20, 78);
  doc.text(formatRupiah(totalMasuk), 190, 78, { align: "right" });

  doc.setTextColor(180, 0, 0);
  doc.text("Total Pengeluaran", 20, 85);
  doc.text(formatRupiah(totalKeluar), 190, 85, { align: "right" });

  doc.setTextColor(0);
  doc.line(20, 88, 190, 88);
  doc.text("SALDO AKHIR PERIODE", 20, 93);
  doc.text(formatRupiah(saldoAkhir), 190, 93, { align: "right" });

  // ==========================================
  // TABEL DATA
  // ==========================================
  const tableData = transaksi.map((item, index) => {
    let donatur = "Hamba Allah";
    let deskripsi = item.deskripsi;

    if (item.deskripsi.includes(" - Donatur: ")) {
      const parts = item.deskripsi.split(" - Donatur: ");
      deskripsi = parts[0];
      donatur = parts[1];
    }

    return [
      index + 1,
      formatTanggal(item.tanggal),
      item.jumlah > 0 ? "MASUK" : "KELUAR",
      donatur,
      formatRupiah(Math.abs(parseFloat(item.jumlah))),
      deskripsi
    ];
  });

  autoTable(doc, {
    startY: 105,
    margin: { top: 55, bottom: 40 }, 
    head: [["No", "Tanggal", "Jenis", "Pihak/Donatur", "Nominal", "Keterangan"]],
    body: tableData,
    theme: "grid",
    headStyles: { fillColor: [0, 98, 39], halign: "center" },
    styles: { fontSize: 8, cellPadding: 3, fillColor: [255, 255, 255] },
    didDrawPage: (data) => {
      // Pasang template di halaman berikutnya jika tabel panjang
      if (data.pageNumber > 1) addPageTemplate();
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 10 },
      1: { halign: "center", cellWidth: 25 },
      4: { halign: "right", cellWidth: 35 },
    }
  });

  // ==========================================
  // BAGIAN TANDA TANGAN (INTEGRASI TTD & NAMA)
  // ==========================================
  let finalY = doc.lastAutoTable.finalY + 15;
  
  if (finalY > 240) {
    doc.addPage();
    addPageTemplate();
    finalY = 60;
  }

  const posX = 150;
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  const tglSekarang = new Date();
  doc.text(`Yogyakarta, ${formatTanggal(tglSekarang)}`, posX, finalY, { align: "center" });
  doc.text("Mengetahui,", posX, finalY + 7, { align: "center" });
  doc.text("Takmir Masjid,", posX, finalY + 14, { align: "center" });

  // INTEGRASI GAMBAR TTD OTOMATIS
  if (ttdUrl) {
  try {
    const ttdBase64 = await imageUrlToBase64(ttdUrl);
    doc.addImage(ttdBase64, "PNG", posX - 15, finalY + 16, 30, 20);
  } catch (e) {
    console.error("Gagal memproses gambar TTD", e);
  }
}

  // INTEGRASI NAMA TAKMIR DARI DATABASE
  doc.setFont("helvetica", "bold");
  doc.text(namaTakmir.toUpperCase(), posX, finalY + 42, { align: "center" });
  doc.setFontSize(8);
  doc.text(namaMasjid, posX, finalY + 46, { align: "center" });
  doc.line(posX - 25, finalY + 43, posX + 25, finalY + 43); // Garis bawah nama

  doc.save(`Laporan_Keuangan_${startDate}_sd_${endDate}.pdf`);
};