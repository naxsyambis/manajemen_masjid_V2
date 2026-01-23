export const formatTanggal = (date) => {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
  }).format(new Date(date));
};