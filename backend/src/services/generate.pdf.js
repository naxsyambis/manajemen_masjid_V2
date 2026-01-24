const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

exports.generateKeuanganPDF = async ({
    jenis,
    kategori,
    periode,
    data,
    totalPemasukan,
    totalPengeluaran,
    takmir,
    masjid
    }) => {
    const doc = new PDFDocument({ margin: 40 });
    const fileName = `laporan-keuangan-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../files", fileName);

    doc.pipe(fs.createWriteStream(filePath));

    // ================= KOP SURAT =================
    const kopPath = path.join(__dirname, "../assets/kop_surat.png");
    doc.image(kopPath, 40, 20, { width: 520 });
    doc.moveDown(4);

    // ================= JUDUL =================
    doc.fontSize(14).font("Helvetica-Bold")
        .text(`LAPORAN ${jenis.toUpperCase()}`, { align: "center" });

    doc.moveDown(0.5);
    doc.fontSize(10).font("Helvetica")
        .text(`Kategori : ${kategori || "Semua"}`, { align: "center" })
        .text(`Periode  : ${periode}`, { align: "center" });

    doc.moveDown(1.5);

    // ================= TABLE HEADER =================
    doc.font("Helvetica-Bold").fontSize(10);
    doc.text("No", 40);
    doc.text("Tanggal", 70);
    doc.text("Deskripsi", 150);
    doc.text("Nominal", 420);
    doc.moveDown(0.5);
    doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

    // ================= TABLE BODY =================
    doc.font("Helvetica");
    data.forEach((item, i) => {
        doc.moveDown(0.5);
        doc.text(i + 1, 40);
        doc.text(item.tanggal, 70);
        doc.text(item.deskripsi, 150, { width: 250 });
        doc.text(`Rp${Number(item.jumlah).toLocaleString("id-ID")}`, 420);
    });

    doc.moveDown(1.5);

    // ================= TOTAL =================
    doc.font("Helvetica-Bold");
    doc.text(`Total Pemasukan  : Rp${totalPemasukan.toLocaleString("id-ID")}`);
    doc.text(`Total Pengeluaran: Rp${totalPengeluaran.toLocaleString("id-ID")}`);

    doc.moveDown(2);

    // ================= TTD =================
    doc.font("Helvetica");
    doc.text(`Takmir ${masjid.nama_masjid}`, { align: "right" });
    doc.moveDown(0.5);

    if (takmir.foto_tanda_tangan) {
    const base64Data = takmir.foto_tanda_tangan.replace(
        /^data:image\/\w+;base64,/,
        ""
    );

    const buffer = Buffer.from(base64Data, "base64");

    doc.image(buffer, {
        width: 120,
        align: "right"
    });
    }

doc.moveDown(0.5);
doc.text(takmir.nama, { align: "right" });

    doc.end();

    return `/files/${fileName}`;
    };
