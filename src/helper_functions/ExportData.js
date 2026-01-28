// utils/exportTable.js
import { saveAs } from "file-saver";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

/**
 * Export table data to Excel, CSV, or PDF.
 *
 * @param {Array<Object>} data - Array of row objects
 * @param {String} fileTitle - Output filename (without extension)
 * @param {'csv'|'pdf'|'xlsx'} format - Export format
 * @param {Object} options - optional config:
 *    options.selectedColumns: Array<string> keys to include (if empty -> infer from data)
 *    options.skipColumns: Array<string> keys to exclude
 *    options.rows: number | 'all'  -> how many rows to export (default 'all')
 *    options.rowsPerPage: number -> PDF-only: how many rows per page (optional)
 */
export const exportTable = (
  data,
  fileTitle = "table",
  format = "csv",
  options = {}
) => {
  if (!Array.isArray(data) || data.length === 0) {
    console.warn("No data to export.");
    return;
  }

  const {
    selectedColumns = [],
    skipColumns = [],
    rows = "all",
    rowsPerPage = null,
  } = options;

  // determine the keys (columns) to use
  let keys =
    Array.isArray(selectedColumns) && selectedColumns.length
      ? selectedColumns.slice()
      : Object.keys(data[0] || {});

  // filter out skipped columns
  if (Array.isArray(skipColumns) && skipColumns.length) {
    keys = keys.filter((k) => !skipColumns.includes(k));
  }

  if (!keys.length) {
    console.warn("No columns selected for export.");
    return;
  }

  // filter out completely empty rows
  const filtered = data.filter((row) =>
    keys.some((k) => {
      const v = row[k];
      return v !== null && v !== undefined && String(v).trim() !== "";
    })
  );

  if (!filtered.length) {
    console.warn("No non-empty rows to export.");
    return;
  }

  // apply rows limit
  let limit = rows;
  if (rows === undefined || rows === null) limit = "all";
  if (limit !== "all") {
    const n = parseInt(limit, 10);
    if (!Number.isFinite(n) || n <= 0) {
      console.warn(
        'rows option must be "all" or a positive number. Exporting all rows.'
      );
      limit = "all";
    } else {
      filtered.splice(n);
    }
  }

  // prepare headers and table body arrays
  const headers = keys.map((k) => k.charAt(0).toUpperCase() + k.slice(1));

  const bodyRows = filtered.map((row) =>
    keys.map((k) => (row[k] != null ? String(row[k]) : ""))
  );

  // ===== Excel Export =====
  if (format === "xlsx") {
    // create worksheet data with headers
    const worksheetData = [headers, ...bodyRows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // auto width calculation
    const colWidths = headers.map((h, i) => {
      const maxContent = Math.max(
        h.length,
        ...bodyRows.map((row) => row[i]?.length || 0)
      );
      return { wch: maxContent + 2 }; // extra padding
    });
    worksheet["!cols"] = colWidths;

    // create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, fileTitle);

    // generate and save file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `${fileTitle}.xlsx`);
    return;
  }

  if (format === "pdf") {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const padding = 20;
    const lineHeight = 8;
    const headingFontSize = 18;
    const labelFontSize = 12;
    const headingColor = "#003149";
    const labelColor = "#344054";
    const valueColor = "#101828";
    const lineColor = "#ccc";

    // Heading
    doc.setFontSize(headingFontSize);
    doc.setTextColor(headingColor);
    doc.setFont(undefined, "bold");
    doc.text(fileTitle, pageWidth / 2, padding, { align: "center" });

    let y = padding + 15;

    filtered.forEach((row) => {
      Object.keys(row).forEach((key) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1) + ":";
        const value = row[key] != null ? String(row[key]) : "";

        doc.setFontSize(labelFontSize);
        doc.setFont(undefined, "bold");
        doc.setTextColor(labelColor);

        // Split value into lines if too long
        const maxValueWidth = pageWidth - 2 * padding - 100; // leave space for label
        const lines = doc.splitTextToSize(value, maxValueWidth);
        const blockHeight = Math.max(1, lines.length) * lineHeight;

        // Add new page if block exceeds page height
        if (y + blockHeight > pageHeight - padding) {
          doc.addPage();
          y = padding;
        }

        // Draw label on left
        doc.text(label, padding, y);

        // Draw value on right (justify)
        const valueX = pageWidth - padding - doc.getTextWidth(lines[0]);
        doc.setFont(undefined, "normal");
        doc.setTextColor(valueColor);
        doc.text(lines, valueX, y);

        // Move Y for next field
        y += blockHeight;
      });

      // Separator line
      y += 4;
      if (y > pageHeight - padding) {
        doc.addPage();
        y = padding;
      }
      doc.setDrawColor(lineColor);
      doc.setLineWidth(0.3);
      doc.line(padding, y, pageWidth - padding, y);
      y += 8;
    });

    doc.save(`${fileTitle}.pdf`);
    return;
  }

  console.error("Unsupported export format:", format);
};
