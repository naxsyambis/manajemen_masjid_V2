import QRCode from "qrcode";

// =================================
// CONFIG BACKEND URL
// Kalau discan HP, jangan pakai localhost.
// Pakai IP laptop atau ngrok.
// =================================
const BACKEND_URL = "http://192.168.1.44:3000";

// =================================
// HELPER: URL TTD
// =================================
export const getTtdUrl = (ttd) => {
  if (!ttd) return null;

  if (ttd.startsWith("http")) {
    return ttd;
  }

  if (ttd.startsWith("/uploads")) {
    return `${BACKEND_URL}${ttd}`;
  }

  return `${BACKEND_URL}/uploads/ttd/${ttd}`;
};

// =================================
// HELPER: BUAT QR TTD ELEKTRONIK
// QR BERISI LINK PDF VERIFIKASI
// =================================
export const generateQrTtd = async ({
  role,
  nomorDokumen,
  jenisDokumen = "kwitansi",
  masjidId,
  ttd
}) => {
  // Kalau belum ada TTD di struktur organisasi,
  // maka QR tidak dibuat.
  if (!ttd) return null;

  if (!role || !nomorDokumen || !masjidId) {
    console.error("Data QR TTD tidak lengkap:", {
      role,
      nomorDokumen,
      masjidId
    });

    return null;
  }

  try {
    const namaMasjid = localStorage.getItem("namaMasjid") || "-";

    // QR ini kalau discan akan membuka PDF verifikasi dari backend
    const urlVerifikasiPdf =
      `${BACKEND_URL}/verifikasi-ttd/${encodeURIComponent(jenisDokumen)}/${encodeURIComponent(nomorDokumen)}/${encodeURIComponent(role)}` +
      `?masjid_id=${encodeURIComponent(masjidId)}` +
      `&nama_masjid=${encodeURIComponent(namaMasjid)}`;

    const qrBase64 = await QRCode.toDataURL(urlVerifikasiPdf, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 300
    });

    return qrBase64;
  } catch (error) {
    console.error("Gagal membuat QR TTD:", error);
    return null;
  }
};