export const formatRupiah = (number) => {
  if (number === undefined || number === null || isNaN(number)) {
    return "Rp 0";
  }
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

export default formatRupiah;