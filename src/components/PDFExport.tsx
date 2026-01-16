import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function PDFExport() {
  const exportToPDF = async () => {
    const dashboard = document.querySelector('main');
    if (!dashboard) return;

    try {
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();

      // Capture the dashboard
      const canvas = await html2canvas(dashboard as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 20; // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10;

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20;

      // Add additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      // Save PDF
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`spending-report-${date}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  return (
    <Button onClick={exportToPDF} variant="outline">
      <FileDown className="mr-2 h-4 w-4" />
      Export to PDF
    </Button>
  );
}
