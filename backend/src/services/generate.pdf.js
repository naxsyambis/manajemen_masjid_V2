const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateKeuanganPDF = async ({
    kategori,
    periode,
    data,
    totalPemasukan,
    totalPengeluaran,
    takmir,
    masjid
}) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    const fileName = `laporan-keuangan-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../files", fileName);
    doc.pipe(fs.createWriteStream(filePath));

    const kopPath = path.join(__dirname, "../assets/kop.png");
    if (fs.existsSync(kopPath)) {
        doc.image(kopPath, 50, 30, { width: 500 });
    }

    doc.moveDown(5);

    doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("LAPORAN KEUANGAN MASJID", { align: "center" });

    doc.moveDown(1);

    doc.font("Helvetica").fontSize(11);
    doc.text(`Masjid   : ${masjid?.nama_masjid}`);
    doc.text(`Periode  : ${periode}`);
    doc.text(`Kategori : ${kategori}`);

    doc.moveDown(1.5);

    const tableTop = doc.y;
    const colX = {
        no: 50,
        tanggal: 90,
        deskripsi: 170,
        jumlah: 430
    };

    doc.font("Helvetica-Bold");
    doc.text("No", colX.no, tableTop);
    doc.text("Tanggal", colX.tanggal, tableTop);
    doc.text("Deskripsi", colX.deskripsi, tableTop);
    doc.text("Jumlah (Rp)", colX.jumlah, tableTop, { align: "right" });

    doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke();

    let y = tableTop + 25;
    doc.font("Helvetica");

    data.forEach((item, i) => {
        doc.text(i + 1, colX.no, y);
        doc.text(item.tanggal, colX.tanggal, y);
        doc.text(item.deskripsi, colX.deskripsi, y, { width: 240 });

        doc.text(
            Number(item.jumlah).toLocaleString("id-ID"),
            colX.jumlah,
            y,
            { align: "right" }
        );

        y += 20;
    });

    doc.moveDown(2);

    doc.font("Helvetica-Bold");
    doc.text(`Total Pemasukan  : Rp ${totalPemasukan.toLocaleString("id-ID")}`);
    doc.text(`Total Pengeluaran: Rp ${totalPengeluaran.toLocaleString("id-ID")}`);

    doc.moveDown(3);

    const ttdX = 350;
    const ttdY = doc.y;

    doc.font("Helvetica");
    doc.text("Takmir Masjid,", ttdX, ttdY);

    if (
        takmir?.foto_tanda_tangan &&
        takmir.foto_tanda_tangan.startsWith("data:image")
    ) {
        try {
            const base64 = takmir.foto_tanda_tangan.split(",")[1];
            const buffer = Buffer.from(base64, "base64");

            doc.image(buffer, ttdX, ttdY + 20, { width: 120 });
        } catch (_) { }
    }

    doc.text(takmir?.nama || "-", ttdX, ttdY + 90);

    doc.end();

    return `/files/${fileName}`;
};
