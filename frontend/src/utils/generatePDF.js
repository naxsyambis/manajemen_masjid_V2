import jsPDF from 'jspdf';
import 'jspdf-autotable';

const formatRupiahPDF = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export const generateKwitansiPDF = (data, ttdImage) => {
  const doc = new jsPDF();
  const namaMasjid = localStorage.getItem('namaMasjid') || "Masjid Jami' Ranting Panjangrejo";
  const namaKetua = localStorage.getItem('namaKetua') || "H. Ahmad Fauzi";
  const isPemasukan = data.nominal >= 0;
  const judulKwitansi = isPemasukan ? "KWITANSI PEMASUKAN" : "BUKTI PENGELUARAN KAS";
  const labelPihak = isPemasukan ? "Telah Terima Dari" : "Dibayarkan Kepada";

  doc.setFontSize(18);
  doc.setTextColor(0, 98, 39); // mu-green
  doc.text(judulKwitansi, 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${namaMasjid}, Pundong, Bantul`, 105, 27, { align: "center" });
  doc.line(20, 32, 190, 32); 

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Nomor Transaksi : ${data.id || 'TX-AUTO'}`, 20, 45);
  doc.text(`Tanggal         : ${data.tanggal}`, 20, 52);
  doc.text(`${labelPihak}: ${data.donatur || 'Hamba Allah'}`, 20, 59);

  doc.autoTable({
    startY: 70,
    head: [['Kategori', 'Keterangan', 'Jumlah']],
    body: [
      [data.kategori, data.keterangan || '-', formatRupiahPDF(Math.abs(data.nominal))]
    ],
    headStyles: { fillStyle: 'f', fillColor: [0, 98, 39] },
  });

  const finalY = doc.lastAutoTable.finalY + 20;
  doc.text("Penerima (Takmir),", 150, finalY, { align: "center" });

  if (ttdImage) {
    try {
      doc.addImage(ttdImage, 'PNG', 135, finalY + 5, 30, 20);
    } catch (e) {
      console.error("Format gambar TTD tidak didukung");
    }
  } else {
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("(Belum ada tanda tangan)", 150, finalY + 15, { align: "center" });
  }

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(namaKetua, 150, finalY + 35, { align: "center" }); 
  doc.save(`Kwitansi_${data.donatur}_${data.id}.pdf`);
};