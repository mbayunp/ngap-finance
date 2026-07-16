export const formatInputRupiah = (value) => {
  if (value === undefined || value === null) return '';
  
  // Menghilangkan semua karakter non-digit
  const numberString = value.toString().replace(/[^0-9]/g, '');
  if (!numberString) return '';
  
  // Memformat dengan pemisah ribuan titik
  const formatted = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `Rp. ${formatted}`;
};

export const parseRupiahToNumber = (value) => {
  if (value === undefined || value === null) return 0;
  
  // Menghapus "Rp." dan titik dengan hanya mengambil digit
  const numberString = value.toString().replace(/[^0-9]/g, '');
  return parseInt(numberString, 10) || 0;
};
