import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportStudentsToPDF(students) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const margin = 10;
  const pageW = doc.internal.pageSize.getWidth();
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('BK Awards 2026 — Student Records', margin, 16);

  // Subtitle / stats
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  const eligible = students.filter((s) => String(s.status || '').toLowerCase() === 'eligible').length;
  doc.text(`Generated: ${dateStr}   |   Total: ${students.length}   |   Eligible: ${eligible}`, margin, 22);
  doc.setTextColor(0);

  // Table
  const head = [['#', 'Name', 'Father Name', 'Mobile', 'School', 'Class', 'Board', '%', 'Status']];

  const body = students.map((s, i) => [
    i + 1,
    s.fullName || '-',
    s.fatherName || '-',
    s.mobile || '-',
    s.schoolName || '-',
    s.className || '-',
    s.board || '-',
    s.percentage != null ? `${s.percentage}%` : '-',
    s.status || 'Pending'
  ]);

  autoTable(doc, {
    head,
    body,
    startY: 26,
    margin: { left: margin, right: margin, top: margin, bottom: margin },
    styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', fontSize: 8 },
    alternateRowStyles: { fillColor: [241, 245, 249] },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 32 },
      2: { cellWidth: 28 },
      3: { cellWidth: 22 },
      4: { cellWidth: 35 },
      5: { cellWidth: 14 },
      6: { cellWidth: 20 },
      7: { cellWidth: 12, halign: 'center' },
      8: { cellWidth: 18, halign: 'center' }
    },
    didDrawCell: (data) => {
      // Color the Status column text based on value
      if (data.section === 'body' && data.column.index === 8) {
        const val = String(data.cell.text[0] || '').toLowerCase();
        if (val === 'eligible') {
          doc.setTextColor(22, 163, 74);
        } else if (val === 'not eligible') {
          doc.setTextColor(220, 38, 38);
        } else {
          doc.setTextColor(100, 116, 139);
        }
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text(
          data.cell.text[0] || '',
          data.cell.x + data.cell.width / 2,
          data.cell.y + data.cell.height / 2 + 1,
          { align: 'center' }
        );
        doc.setTextColor(0);
        doc.setFont('helvetica', 'normal');
      }
    },
    // Page numbers in footer
    didDrawPage: (data) => {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        pageW - margin,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'right' }
      );
      doc.setTextColor(0);
    }
  });

  const filename = `students_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.pdf`;
  doc.save(filename);
}
