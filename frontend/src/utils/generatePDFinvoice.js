import jsPDF from "jspdf";
import axios from "axios";
import { formatRupiah } from "./formatCurrency";
import { formatTanggal } from "./formatDate";
import logoKop from "../assets/kop-surat.jpeg"; 

// =================================
// HELPER: URL IMAGE → BASE64
// =================================
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

// =================================
// HELPER: AMBIL KETUA & BENDAHARA
// DARI STRUKTUR ORGANISASI
// =================================
const getStrukturPenandatangan = async () => {
  try {
    const token = localStorage.getItem("token");
    const masjidId = localStorage.getItem("masjid_id");

    if (!token || !masjidId) {
      return {
        ketua: "-",
        bendahara: "-"
      };
    }

    const res = await axios.get("http://localhost:3000/takmir/struktur-organisasi", {
      params: {
        masjid_id: masjidId
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const struktur = Array.isArray(res.data.data) ? res.data.data : [];

    const ketua = struktur.find((item) =>
      item.jabatan?.toLowerCase().includes("ketua")
    );

    const bendahara = struktur.find((item) =>
      item.jabatan?.toLowerCase().includes("bendahara")
    );

    return {
      ketua: ketua?.nama || "-",
      bendahara: bendahara?.nama || "-"
    };
  } catch (error) {
    console.error("Gagal mengambil struktur organisasi:", error);

    return {
      ketua: "-",
      bendahara: "-"
    };
  }
};

// =================================
// HELPER: AMBIL REKENING MASJID
// DARI SETTINGS / REKENING MASJID
// =================================
const getRekeningMasjid = async () => {
  try {
    const token = localStorage.getItem("token");
    const masjidId = localStorage.getItem("masjid_id");

    if (!token || !masjidId) {
      return "-";
    }

    const res = await axios.get("http://localhost:3000/takmir/rekening-masjid", {
      params: {
        masjid_id: masjidId
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const rekening = Array.isArray(res.data.data) ? res.data.data : [];

    if (rekening.length === 0) {
      return "-";
    }

    return rekening
      .map((item) => {
        const namaBank = item.nama_bank || "-";
        const noRekening = item.no_rekening || "-";
        const atasNama = item.atas_nama || "-";

        return `${namaBank} ${noRekening} a.n ${atasNama}`;
      })
      .join("\n");
  } catch (error) {
    console.error("Gagal mengambil rekening masjid:", error);
    return "-";
  }
};

export const generateKwitansiPDF = async (data, savedTtd) => {
  const doc = new jsPDF("p", "mm", "a4");

  // Ambil Nama Masjid dari LocalStorage
  const namaMasjid = localStorage.getItem("namaMasjid") || "MASJID MUHAMMADIYAH";

  // Ambil nama ketua dan bendahara dari struktur organisasi
  const { ketua, bendahara } = await getStrukturPenandatangan();

  // Ambil rekening masjid dari Settings
  const rekeningMasjid = await getRekeningMasjid();

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
  // NAMA MASJID
  // ==========================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 98, 39);
  doc.text(namaMasjid.toUpperCase(), 105, 48, { align: "center" });

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
  // TANDA TANGAN 2 KOLOM
  // KIRI: KETUA
  // KANAN: BENDAHARA
  // ==========================================
  const signY = 190;
  const ketuaX = 60;
  const bendaharaX = 150;

  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");

  // Tanggal di atas tanda tangan
  doc.text("Yogyakarta, " + data.tanggal, bendaharaX, signY, { align: "center" });

  // Label jabatan tetap
  doc.text("Ketua,", ketuaX, signY + 12, { align: "center" });
  doc.text("Bendahara,", bendaharaX, signY + 12, { align: "center" });

  // Area kosong untuk tanda tangan
  doc.setFont("helvetica", "bold");

  // Garis tanda tangan Ketua
  doc.line(ketuaX - 28, signY + 42, ketuaX + 28, signY + 42);

  // Garis tanda tangan Bendahara
  doc.line(bendaharaX - 28, signY + 42, bendaharaX + 28, signY + 42);

  // Nama Ketua dan Bendahara dari struktur organisasi
  // Jika belum ada, tampil "-"
  doc.text(ketua.toUpperCase(), ketuaX, signY + 48, { align: "center" });
  doc.text(bendahara.toUpperCase(), bendaharaX, signY + 48, { align: "center" });

  doc.setFontSize(8);
  doc.text(namaMasjid, ketuaX, signY + 53, { align: "center" });
  doc.text(namaMasjid, bendaharaX, signY + 53, { align: "center" });

  // ==========================================
  // FOOTER: REKENING KIRI + CATATAN KANAN
  // ==========================================
  doc.setTextColor(80);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Rekening Masjid:", 20, 260);

  doc.setFont("helvetica", "normal");
  const splitRekening = doc.splitTextToSize(rekeningMasjid, 95);
  doc.text(splitRekening.slice(0, 4), 20, 265);

  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(150);
  doc.text(
    "*Bukti ini sah sebagai dokumen internal masjid.",
    190,
    270,
    { align: "right" }
  );

  // Save PDF
  doc.save(`Kwitansi_${data.id}_${data.donatur}.pdf`);
};