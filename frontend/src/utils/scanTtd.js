import QRCode from "qrcode";

// =================================
// HELPER: URL TTD
// =================================
export const getTtdUrl = (ttd) => {
  if (!ttd) return null;
  if (ttd.startsWith("http")) return ttd;
  return `http://localhost:3000/uploads/ttd/${ttd}`;
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

  try {
    const backendUrl = "http://192.168.1.44:3000";

    // QR ini kalau discan akan membuka PDF verifikasi dari backend
    const urlVerifikasiPdf = `${backendUrl}/verifikasi-ttd/${jenisDokumen}/${nomorDokumen}/${role}?masjid_id=${masjidId}`;

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