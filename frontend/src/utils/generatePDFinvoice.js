import jsPDF from "jspdf";
import axios from "axios";
import { formatRupiah } from "./formatCurrency";
import { generateQrTtd } from "./scanTtd";
import logoKop from "../assets/kop-surat.jpeg";

// ================= LOAD IMAGE =================
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

// ================= TERBILANG =================
const terbilang = (angka) => {
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

  let hasil = "";

  if (angka < 12) hasil = " " + huruf[angka];
  else if (angka < 20)
    hasil = terbilang(angka - 10) + " Belas";
  else if (angka < 100)
    hasil =
      terbilang(Math.floor(angka / 10)) +
      " Puluh" +
      terbilang(angka % 10);
  else if (angka < 200)
    hasil = " Seratus" + terbilang(angka - 100);
  else if (angka < 1000)
    hasil =
      terbilang(Math.floor(angka / 100)) +
      " Ratus" +
      terbilang(angka % 100);
  else if (angka < 2000)
    hasil = " Seribu" + terbilang(angka - 1000);
  else if (angka < 1000000)
    hasil =
      terbilang(Math.floor(angka / 1000)) +
      " Ribu" +
      terbilang(angka % 1000);
  else if (angka < 1000000000)
    hasil =
      terbilang(Math.floor(angka / 1000000)) +
      " Juta" +
      terbilang(angka % 1000000);

  return hasil;
};

// ================= BULAN ROMAWI =================
const getBulanRomawi = (tanggal) => {
  if (!tanggal) return "I";

  const month = new Date(tanggal).getMonth() + 1;

  const romawi = [
    "",
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
  ];

  return romawi[month] || "I";
};

const formatTanggalIndonesia = (tanggal) => {
  if (!tanggal) return "-";

  try {
    // support format:
    // 2026-05-13
    // 2026-05-13T00:00:00.000Z
    // 13-05-2026

    let date;

    if (typeof tanggal === "string") {
      // kalau format DD-MM-YYYY
      if (/^\d{2}-\d{2}-\d{4}$/.test(tanggal)) {
        const [day, month, year] = tanggal.split("-");
        date = new Date(`${year}-${month}-${day}`);
      } else {
        date = new Date(tanggal);
      }
    } else {
      date = new Date(tanggal);
    }

    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch (error) {
    return "-";
  }
};

// ================= GET STRUKTUR =================
const getStrukturPenandatangan = async () => {
  try {
    const token = localStorage.getItem("token");
    const masjidId = localStorage.getItem("masjid_id");

    if (!token || !masjidId) {
      return { bendahara: null };
    }

    const res = await axios.get(
      "http://localhost:3000/takmir/struktur-organisasi",
      {
        params: { masjid_id: masjidId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const struktur = Array.isArray(res.data.data)
      ? res.data.data
      : [];

    const bendahara = struktur.find((item) =>
      item.jabatan
        ?.toLowerCase()
        .includes("bendahara")
    );

    return {
      bendahara: bendahara || null,
    };
  } catch (error) {
    console.error(error);

    return {
      bendahara: null,
    };
  }
};

// ================= GET DETAIL MASJID =================
const getDetailMasjid = async () => {
  try {
    const masjidId = localStorage.getItem("masjid_id");

    if (!masjidId) return null;

    const res = await axios.get(
      `http://localhost:3000/public/masjid/${masjidId}`
    );

    return res.data.masjid;
  } catch (error) {
    console.error("Gagal get masjid:", error);
    return null;
  }
};

// ================= GENERATE PDF =================
export const generateKwitansiPDF = async (data) => {
  const doc = new jsPDF("l", "mm", "a5");

  // ================= GET DATA =================
  const detailMasjid = await getDetailMasjid();

  const namaMasjid =
    detailMasjid?.nama_masjid ||
    localStorage.getItem("namaMasjid") ||
    "MASJID";

  const masjidId = localStorage.getItem("masjid_id");

  const isPemasukan =
    data.jenis === "PEMASUKAN";

  // ================= NOMOR SURAT =================
  const stringKode = detailMasjid?.kode_surat
    ? detailMasjid.kode_surat.toUpperCase()
    : "PTM-MSJD";

  const bulanRomawi = getBulanRomawi(
    data.tanggal
  );

  const parsedDate = data.tanggal
    ? new Date(data.tanggal)
    : new Date();

  const tahun = isNaN(parsedDate.getTime())
    ? new Date().getFullYear()
    : parsedDate.getFullYear();

  const nomorUrut =
    data.id ||
    data.keuangan_id ||
    data.transaksi_id ||
    1;

  const nomorDokumen = `${nomorUrut}/${stringKode}/${bulanRomawi}/${tahun}`;

  // ================= LOGO =================
  let logoUrl = null;

  if (
    detailMasjid?.logo_foto &&
    detailMasjid.logo_foto !== "default.jpg"
  ) {
    logoUrl = detailMasjid.logo_foto.startsWith(
      "http"
    )
      ? detailMasjid.logo_foto
      : `http://localhost:3000${detailMasjid.logo_foto}`;
  }

  const dynamicLogo = logoUrl
    ? await imageUrlToBase64(logoUrl)
    : null;

  // ================= TTD =================
  const { bendahara } =
    await getStrukturPenandatangan();

  const qrBendahara = await generateQrTtd({
    role: "bendahara",
    nomorDokumen,
    jenisDokumen: "kwitansi",
    masjidId,
    ttd: bendahara?.ttd,
  });

  // ================= STYLE =================
  const r = 0;
  const g = 98;
  const b = 39;

  const boxX = 10;
  const boxY = 10;
  const boxW = 190;
  const boxH = 128;

  const leftW = 60;
  const rightX = boxX + leftW;
  const rightW = boxW - leftW;

  // ================= BACKGROUND =================
  doc.setFillColor(r, g, b);
  doc.rect(boxX, boxY, leftW, boxH, "F");

  doc.setDrawColor(r, g, b);
  doc.setLineWidth(0.5);
  doc.rect(boxX, boxY, boxW, boxH, "S");

  // ================= LOGO =================
  try {
    if (dynamicLogo) {
    doc.addImage(
      dynamicLogo,
      undefined,
      boxX + 15,
      boxY + 15,
      26,
      26
    );
    } else {
    doc.addImage(
      logoKop,
      "JPEG",
      boxX + 15,
      boxY + 15,
      26,
      26
    );
    }
  } catch (e) {
    console.log("Logo gagal render");
  }

  // ================= SIDEBAR =================
  doc.setTextColor(255, 255, 255);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);

  const splitNama = doc.splitTextToSize(
    namaMasjid.toUpperCase(),
    leftW - 10
  );

  doc.text(
    splitNama,
    boxX + leftW / 2,
    boxY + 55,
    {
      align: "center",
    }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const quote =
    '"Dan barang apa saja yang kamu nafkahkan, maka Allah akan menggantinya dan Dia-lah Pemberi rezeki yang sebaik-baiknya" (QS. Saba: 39)';

  const splitQuote = doc.splitTextToSize(
    quote,
    leftW - 10
  );

  doc.text(
    splitQuote,
    boxX + leftW / 2,
    boxY + 85,
    {
      align: "center",
    }
  );

  // ================= HEADER =================
  doc.setTextColor(r, g, b);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);

  doc.text(
    "KUITANSI",
    rightX + rightW - 10,
    boxY + 15,
    {
      align: "right",
    }
  );

  // ================= INFO =================
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(10);

  doc.setFont("helvetica", "bold");
  doc.text("Tanggal", rightX + 10, boxY + 15);

  doc.setFont("helvetica", "normal");
  doc.text(
    `: ${formatTanggalIndonesia(data.tanggal)}`,
    rightX + 35,
    boxY + 15
  );

  doc.setFont("helvetica", "bold");
  doc.text("Nomor", rightX + 10, boxY + 22);

  doc.setFont("helvetica", "normal");
  doc.text(
    `: ${nomorDokumen}`,
    rightX + 35,
    boxY + 22
  );

  doc.setDrawColor(200, 200, 200);

  doc.line(
    rightX + 5,
    boxY + 28,
    rightX + rightW - 5,
    boxY + 28
  );

  // ================= BODY =================
const bodyY = boxY + 40;

doc.setFont("helvetica", "bold");

doc.text(
  isPemasukan
    ? "Diterima dari"
    : "Diberikan kepada",
  rightX + 10,
  bodyY
);

doc.setFont("helvetica", "normal");

doc.text(
  `: ${(data.donatur ||
    data.penerima ||
    "-").toUpperCase()}`,
  rightX + 45,
  bodyY
);

// ================= NOMINAL =================
const nominalAngka = Math.abs(
  data.nominal || 0
);

doc.setFont("helvetica", "bold");
doc.setFontSize(10);

doc.setTextColor(0, 0, 0);

doc.text(
  "Nominal",
  rightX + 10,
  bodyY + 12
);

doc.setTextColor(r, g, b);

doc.text(
  `: ${formatRupiah(nominalAngka)}`,
  rightX + 45,
  bodyY + 12
);

// ================= JUMLAH =================
doc.setTextColor(0, 0, 0);

doc.setFont("helvetica", "bold");

doc.text(
  "Jumlah",
  rightX + 10,
  bodyY + 22
);

doc.setFont("helvetica", "normal");

const terbilangText =
  terbilang(nominalAngka).trim() +
  " Rupiah";

const splitTerbilang =
  doc.splitTextToSize(
    `: ${terbilangText}`,
    rightW - 55
  );

doc.text(
  splitTerbilang,
  rightX + 45,
  bodyY + 22
);

// tinggi text jumlah
const tHeight =
  splitTerbilang.length * 5;

const currentY =
  bodyY + 22 + tHeight;

// ================= KETERANGAN =================
doc.setFont("helvetica", "bold");

doc.text(
  "Keterangan",
  rightX + 10,
  currentY
);

doc.setFont("helvetica", "normal");

const splitKeterangan =
  doc.splitTextToSize(
    `: ${data.keterangan || "-"}`,
    rightW - 55
  );

doc.text(
  splitKeterangan,
  rightX + 45,
  currentY
);

const kHeight =
  splitKeterangan.length * 5;

// ================= GARIS =================
const lineY =
  currentY + kHeight + 10;

doc.setDrawColor(200, 200, 200);

doc.line(
  rightX + 5,
  lineY,
  rightX + rightW - 5,
  lineY
);

  // ================= TTD =================
  doc.setTextColor(0, 0, 0);

  const signY = lineY + 10;

  const bendaharaX =
    rightX + rightW - 25;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text(
    "Bendahara",
    bendaharaX,
    signY,
    {
      align: "center",
    }
  );

  if (qrBendahara) {
    doc.addImage(
      qrBendahara,
      "PNG",
      bendaharaX - 12,
      signY + 3,
      24,
      24
    );
  } else {
    doc.line(
      bendaharaX - 15,
      signY + 20,
      bendaharaX + 15,
      signY + 20
    );
  }

  doc.text(
    (
      bendahara?.nama || "Bendahara"
    ).toUpperCase(),
    bendaharaX,
    signY + 30,
    {
      align: "center",
    }
  );

  // ================= PENERIMA =================
  if (!isPemasukan) {
    const penerimaX = rightX + 40;

    doc.text(
      "Penerima",
      penerimaX,
      signY,
      {
        align: "center",
      }
    );

    doc.line(
      penerimaX - 15,
      signY + 20,
      penerimaX + 15,
      signY + 20
    );

    const namaPenerima = (
      data.donatur ||
      data.penerima ||
      "Penerima"
    ).toUpperCase();

    doc.text(
      namaPenerima,
      penerimaX,
      signY + 30,
      {
        align: "center",
      }
    );
  }

  const cleanNomorDokumen =
    nomorDokumen.replace(/\//g, "-");

  doc.save(
    `Kwitansi_${cleanNomorDokumen}.pdf`
  );
};