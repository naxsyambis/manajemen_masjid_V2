import QRCode from "qrcode";
import { formatTanggal } from "./formatDate";

// =================================
// HELPER: DOWNLOAD DATA URL
// =================================
const downloadDataUrl = (dataUrl, filename) => {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// =================================
// HELPER: BIKIN GAMBAR QR
// =================================
const createQrLaporanImage = async ({
  namaMasjid,
  startDate,
  endDate,
  urlLaporanPdf
}) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 900;
  canvas.height = 1100;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#006227";
  ctx.lineWidth = 10;
  ctx.strokeRect(35, 35, canvas.width - 70, canvas.height - 70);

  ctx.fillStyle = "#006227";
  ctx.font = "bold 34px Arial";
  ctx.textAlign = "center";
  ctx.fillText((namaMasjid || "-").toUpperCase(), canvas.width / 2, 120);

  ctx.fillStyle = "#006227";
  ctx.font = "bold 38px Arial";
  ctx.fillText("QR LAPORAN KEUANGAN", canvas.width / 2, 185);

  ctx.strokeStyle = "#006227";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(180, 215);
  ctx.lineTo(720, 215);
  ctx.stroke();

  ctx.fillStyle = "#333333";
  ctx.font = "24px Arial";
  ctx.fillText(
    `Periode: ${formatTanggal(startDate)} s/d ${formatTanggal(endDate)}`,
    canvas.width / 2,
    265
  );

  const qrBase64 = await QRCode.toDataURL(urlLaporanPdf, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 520
  });

  const qrImage = new Image();
  qrImage.src = qrBase64;

  await new Promise((resolve, reject) => {
    qrImage.onload = resolve;
    qrImage.onerror = reject;
  });

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#dddddd";
  ctx.lineWidth = 3;
  ctx.fillRect(185, 320, 530, 530);
  ctx.strokeRect(185, 320, 530, 530);

  ctx.drawImage(qrImage, 210, 345, 480, 480);

  ctx.fillStyle = "#000000";
  ctx.font = "bold 26px Arial";
  ctx.fillText("SCAN QR UNTUK MEMBUKA PDF LAPORAN", canvas.width / 2, 905);

  ctx.fillStyle = "#555555";
  ctx.font = "20px Arial";
  ctx.fillText(
    "QR ini mengarah ke dokumen laporan rekapitulasi keuangan",
    canvas.width / 2,
    945
  );

  ctx.fillText(
    "yang dibuat oleh sistem manajemen masjid.",
    canvas.width / 2,
    975
  );

  ctx.fillStyle = "#777777";
  ctx.font = "italic 18px Arial";
  ctx.fillText(
    "*Bukti ini sah sebagai dokumen internal masjid.",
    canvas.width / 2,
    1040
  );

  return canvas.toDataURL("image/png");
};

// =================================
// EXPORT LAPORAN KEUANGAN
// HASIL DOWNLOAD: PNG QR
// QR DIBUKA: PDF LAPORAN ASLI
// =================================
export const generateLaporanKeuanganPDF = async (
  transaksi,
  startDate,
  endDate
) => {
  const namaMasjid = localStorage.getItem("namaMasjid") || "-";
  const masjidId = localStorage.getItem("masjid_id");

  if (!masjidId) {
    alert("Masjid ID tidak ditemukan. Silakan logout lalu login ulang.");
    return;
  }

  // Kalau mau discan HP, pakai IP laptop / ngrok, jangan localhost.
  const backendUrl = "https://masjidmupundong.com";

  const urlLaporanPdf =
    `${backendUrl}/laporan-keuangan/verifikasi-pdf` +
    `?masjid_id=${encodeURIComponent(masjidId)}` +
    `&nama_masjid=${encodeURIComponent(namaMasjid)}` +
    `&startDate=${encodeURIComponent(startDate)}` +
    `&endDate=${encodeURIComponent(endDate)}`;

  try {
    const qrImagePng = await createQrLaporanImage({
      namaMasjid,
      startDate,
      endDate,
      urlLaporanPdf
    });

    downloadDataUrl(
      qrImagePng,
      `QR_Laporan_Keuangan_${startDate}_sd_${endDate}.png`
    );
  } catch (error) {
    console.error("Gagal membuat QR laporan:", error);
    alert("Gagal membuat QR laporan.");
  }
};