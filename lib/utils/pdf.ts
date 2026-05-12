import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Converts an HTML element to a PDF and downloads it.
 * @param element The HTML element to capture.
 * @param filename The name of the downloaded file.
 */
export const downloadPDF = async (element: HTMLElement, filename: string) => {
    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const marginX = 5;
        const marginY = 5;
        const contentWidth = pdfWidth - (marginX * 2);
        const contentHeight = pdfHeight - (marginY * 2);

        const imgProps = pdf.getImageProperties(imgData);
        const imgAspectRatio = imgProps.width / imgProps.height;
        
        let finalWidth = contentWidth;
        let finalHeight = contentWidth / imgAspectRatio;
        
        if (finalHeight > contentHeight) {
            finalHeight = contentHeight;
            finalWidth = contentHeight * imgAspectRatio;
        }

        const xOffset = marginX + (contentWidth - finalWidth) / 2;
        const yOffset = marginY + (contentHeight - finalHeight) / 2;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
        pdf.save(filename);
        
        return true;
    } catch (error) {
        console.error('Error generating PDF:', error);
        return false;
    }
};
