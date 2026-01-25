import jsPDF from "jspdf";
import { formatRupiah } from "./formatCurrency";
import { formatTanggal } from "./formatDate";
import logoKop from "../assets/kop-surat.png"; // Pastikan path asset benar

export const generateKwitansiPDF = (data, savedTtd) => {
  const doc = new jsPDF("p", "mm", "a4");

  // Ambil Nama Masjid dan Nama Takmir dari LocalStorage
  const namaMasjid = localStorage.getItem('namaMasjid') || "MASJID MUHAMMADIYAH";
  const namaTakmir = localStorage.getItem('userName') || "Takmir Masjid";

  // Fungsi untuk memasang Background Kop (Header & Footer)
  const addPageTemplate = () => {
    try {
      doc.addImage(logoKop, "PNG", 0, 0, 210, 297);
    } catch (error) {
      console.error("Gagal memuat template kop surat:", error);
    }
  };

  addPageTemplate();

  // ==========================================
  // JUDUL KWITANSI
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 98, 39); // Hijau MU
  doc.text("BUKTI TRANSAKSI / KWITANSI", 105, 55, { align: "center" });
  
  doc.setDrawColor(0, 98, 39);
  doc.setLineWidth(0.5);
  doc.line(70, 57, 140, 57);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Nomor: ${data.id}`, 105, 63, { align: "center" });

  // ==========================================
  // KONTEN KWITANSI (DESIGN BOX)
  // ==========================================
  doc.setDrawColor(230);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(20, 75, 170, 100, 5, 5, "FD");

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");

  const startX = 30;
  let startY = 90;

  // Baris 1: Tanggal
  doc.text("Tanggal", startX, startY);
  doc.setFont("helvetica", "normal");
  doc.text(`:  ${data.tanggal}`, startX + 40, startY);

  // Baris 2: Nama Pihak
  startY += 12;
  doc.setFont("helvetica", "bold");
  doc.text(data.jenis === "PEMASUKAN" ? "Terima Dari" : "Diberikan Kepada", startX, startY);
  doc.setFont("helvetica", "normal");
  doc.text(`:  ${data.donatur.toUpperCase()}`, startX + 40, startY);

  // Baris 3: Kategori
  startY += 12;
  doc.setFont("helvetica", "bold");
  doc.text("Kategori", startX, startY);
  doc.setFont("helvetica", "normal");
  doc.text(`:  ${data.kategori}`, startX + 40, startY);

  // Baris 4: Deskripsi
  startY += 12;
  doc.setFont("helvetica", "bold");
  doc.text("Keperluan", startX, startY);
  doc.setFont("helvetica", "normal");
  const splitDeskripsi = doc.splitTextToSize(data.keterangan, 100);
  doc.text(":", startX + 40, startY);
  doc.text(splitDeskripsi, startX + 43, startY);

  // ==========================================
  // NOMINAL (Highlight Box)
  // ==========================================
  startY += 25;
  doc.setFillColor(0, 98, 39); // Background hijau untuk nominal
  doc.roundedRect(startX, startY - 7, 150, 15, 2, 2, "F");
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255); // Teks putih
  doc.text("NOMINAL :", startX + 5, startY + 3);
  doc.text(formatRupiah(Math.abs(data.nominal)), startX + 145, startY + 3, { align: "right" });

  // ==========================================
  // TANDA TANGAN (INTEGRASI OTOMATIS)
  // ==========================================
  const signY = 190;
  const signX = 150;

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
  doc.text("Yogyakarta, " + data.tanggal, signX, signY, { align: "center" });
  doc.text("Takmir,", signX, signY + 7, { align: "center" });

  // Render TTD jika ada di database/localStorage
  if (savedTtd) {
    try {
      doc.addImage(savedTtd, "PNG", signX - 15, signY + 10, 30, 20);
    } catch (e) {
      console.error("Gagal merender TTD pada kwitansi");
    }
  }

  doc.setFont("helvetica", "bold");
  doc.text(namaTakmir.toUpperCase(), signX, signY + 35, { align: "center" });
  doc.setFontSize(8);
  doc.text(namaMasjid, signX, signY + 39, { align: "center" });
  doc.line(signX - 25, signY + 36, signX + 25, signY + 36);

  // Note kecil di bawah
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150);
  doc.text("*Bukti ini sah sebagai dokumen internal masjid.", 20, 270);

  // Save PDF
  doc.save(`Kwitansi_${data.id}_${data.donatur}.pdf`);
};