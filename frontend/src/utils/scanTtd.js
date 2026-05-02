import QRCode from "qrcode";

const BACKEND_URL = "https://masjidmupundong.com";

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

export const generateQrTtd = async ({
  role,
  nomorDokumen,
  jenisDokumen = "kwitansi",
  masjidId,
  ttd
}) => {

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