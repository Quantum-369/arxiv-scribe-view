
interface PdfExtractionResult {
  text: string;
  error?: string;
}

// Simple PDF download and storage with chunked base64 conversion
export const extractPdfText = async (pdfUrl: string): Promise<PdfExtractionResult> => {
  try {
    console.log('Starting PDF download for:', pdfUrl);

    // Download the PDF
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('PDF downloaded successfully, size:', arrayBuffer.byteLength, 'bytes');

    // Convert to base64 in chunks to avoid call stack overflow
    const uint8Array = new Uint8Array(arrayBuffer);
    const chunkSize = 8192; // Process 8KB at a time
    let base64String = '';
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      const chunkString = String.fromCharCode.apply(null, Array.from(chunk));
      base64String += btoa(chunkString);
    }
    
    // Store in localStorage
    localStorage.setItem('currentPdfData', base64String);
    localStorage.setItem('currentPdfUrl', pdfUrl);
    
    console.log('PDF stored in localStorage successfully');

    // For now, return a success message with the PDF size
    return { 
      text: `PDF downloaded and stored successfully (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB). Ready for processing.`,
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
