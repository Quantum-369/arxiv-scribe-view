
interface PdfExtractionResult {
  text: string;
  error?: string;
}

// Simple PDF download without storage - just verify accessibility
export const extractPdfText = async (pdfUrl: string): Promise<PdfExtractionResult> => {
  try {
    console.log('Starting PDF download for:', pdfUrl);

    // Download the PDF to verify it's accessible
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('PDF downloaded successfully, size:', arrayBuffer.byteLength, 'bytes');

    // For now, return a success message with the PDF size
    // In the future, this could be enhanced with actual text extraction
    const sizeInKB = (arrayBuffer.byteLength / 1024).toFixed(1);
    return { 
      text: `PDF downloaded successfully (${sizeInKB} KB). Text extraction will be implemented in a future update.`,
      error: undefined
    };

  } catch (error) {
    console.error('PDF download failed:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Failed to download PDF'
    };
  }
};

// Construct direct arXiv PDF URL from arXiv ID
export const getArxivPdfUrl = (arxivId: string): string => {
  // Extract ID from full arXiv URL if needed
  const idMatch = arxivId.match(/(\d{4}\.\d{4,5})/);
  const cleanId = idMatch ? idMatch[1] : arxivId.replace(/^.*\//, '');
  
  return `https://arxiv.org/pdf/${cleanId}.pdf`;
};
