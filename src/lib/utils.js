import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName = 'export.xlsx', sheetName = 'Sheet1') => {
  // Create a worksheet from the data
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Create a workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, fileName);
};
