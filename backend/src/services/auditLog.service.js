const AuditLog = require("../models/AuditLog");

exports.logActivity = async ({
  req,
  action,
  nama_tabel,
  data_lama = null,
  data_baru = null,
  record_id = null
}) => {
  try {
    await AuditLog.create({
      user_id: req.user.user_id,
      action,
      nama_tabel,
      data_lama,
      data_baru,
      record_id,
      ip_address: req.ip
    });
  } catch (error) {
    console.error("AUDIT LOG ERROR:", error.message);
  }
};
