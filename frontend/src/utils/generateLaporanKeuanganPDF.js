import QRCode from "qrcode";
import jsPDF from "jspdf";
import { formatTanggal } from "./formatDate";

const createQrImage = async (urlLaporanPdf) => {
  return await QRCode.toDataURL(urlLaporanPdf, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 520,
  });
};

// TERIMA PARAMETER BARU: selectedKategori
export const generateLaporanKeuanganPDF = async (
  transaksi,
  startDate,
  endDate,
  selectedKategori = "" 
) => {
  const namaMasjid = localStorage.getItem("namaMasjid") || "-";
  const masjidId = localStorage.getItem("masjid_id");

  if (!masjidId) {
    alert("Masjid ID tidak ditemukan. Silakan logout lalu login ulang.");
    return;
  }

  // Sesuaikan dengan IP/Domain Backend-mu
  const backendUrl = "http://localhost:3000";

  // SISIPKAN KATEGORI ID KE URL (Bila ada)
  let urlLaporanPdf =
    `${backendUrl}/laporan-keuangan/verifikasi-pdf` +
    `?masjid_id=${encodeURIComponent(masjidId)}` +
    `&nama_masjid=${encodeURIComponent(namaMasjid)}` +
    `&startDate=${encodeURIComponent(startDate)}` +
    `&endDate=${encodeURIComponent(endDate)}`;

  if (selectedKategori) {
    urlLaporanPdf += `&kategori_id=${encodeURIComponent(selectedKategori)}`;
  }

  try {
    const qrImage = await createQrImage(urlLaporanPdf);

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setDrawColor(0, 98, 39);
    doc.setLineWidth(1.5);
    doc.rect(10, 10, 190, 277);

    doc.setTextColor(0, 98, 39);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text((namaMasjid || "-").toUpperCase(), pageWidth / 2, 28, {
      align: "center",
    });

    doc.setFontSize(22);
    doc.text("QR LAPORAN KEUANGAN", pageWidth / 2, 42, {
      align: "center",
    });

    doc.setDrawColor(0, 98, 39);
    doc.setLineWidth(0.8);
    doc.line(45, 49, 165, 49);

    doc.setTextColor(50, 50, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    
    // Tampilkan label kategori di QR Code (Opsional, asumsikan "Semua Kategori" jika kosong)
    const kategoriLabel = selectedKategori ? "Laporan Terfilter" : "Semua Kategori";
    
    doc.text(
      `Periode: ${formatTanggal(startDate)} s/d ${formatTanggal(endDate)}\n(${kategoriLabel})`,
      pageWidth / 2,
      60,
      { align: "center" }
    );

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.rect(50, 77, 110, 110);

    doc.addImage(qrImage, "PNG", 55, 82, 100, 100);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SCAN QR UNTUK MEMBUKA PDF LAPORAN", pageWidth / 2, 204, {
      align: "center",
    });

    doc.setTextColor(0, 98, 39);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Atau klik link berikut:", pageWidth / 2, 218, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);

    const splitUrl = doc.splitTextToSize(urlLaporanPdf, 160);

    let linkY = 228;

    splitUrl.forEach((line, index) => {
      doc.textWithLink(line, pageWidth / 2, linkY + index * 6, {
        url: urlLaporanPdf,
        align: "center",
      });
    });

    const buttonY = linkY + splitUrl.length * 6 + 10;

    doc.setFillColor(0, 98, 39);
    doc.roundedRect(55, buttonY, 100, 13, 3, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.textWithLink("BUKA PDF LAPORAN", pageWidth / 2, buttonY + 8.5, {
      url: urlLaporanPdf,
      align: "center",
    });

    doc.setTextColor(85, 85, 85);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(
      "QR ini mengarah ke dokumen laporan rekapitulasi keuangan",
      pageWidth / 2,
      buttonY + 28,
      { align: "center" }
    );

    doc.text(
      "yang dibuat oleh sistem manajemen masjid.",
      pageWidth / 2,
      buttonY + 35,
      { align: "center" }
    );

    doc.setTextColor(120, 120, 120);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text(
      "*Bukti ini sah sebagai dokumen internal masjid.",
      pageWidth / 2,
      274,
      { align: "center" }
    );

    doc.save(`QR_Laporan_Keuangan_${startDate}_sd_${endDate}.pdf`);
  } catch (error) {
    console.error("Gagal membuat QR laporan:", error);
    alert("Gagal membuat QR laporan.");
  }
};