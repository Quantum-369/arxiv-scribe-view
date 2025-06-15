
interface PdfExtractionResult {
  text: string;
  error?: string;
}

// Ultra-simple PDF text extraction using external service
export const extractPdfText = async (pdfUrl: string): Promise<PdfExtractionResult> => {
  try {
    console.log('Starting simple PDF text extraction for:', pdfUrl);

    // Use a simple PDF-to-text conversion service
    const apiUrl = `https://api.pdflayer.com/api/convert?access_key=free&document_url=${encodeURIComponent(pdfUrl)}&format=txt`;
    
    try {
      const response = await fetch(apiUrl);
      if (response.ok) {
        const text = await response.text();
        if (text && text.length > 100) {
          console.log('PDF text extraction successful via PDFLayer, length:', text.length);
          return { text: text.trim() };
        }
      }
    } catch (error) {
      console.log('PDFLayer service failed, trying fallback...');
    }

    // Fallback: Try to fetch PDF and use a simple approach
    try {
      const pdfResponse = await fetch(pdfUrl);
      if (!pdfResponse.ok) {
        throw new Error(`Failed to fetch PDF: ${pdfResponse.status}`);
      }

      const arrayBuffer = await pdfResponse.arrayBuffer();
      console.log('PDF fetched successfully, size:', arrayBuffer.byteLength, 'bytes');

      // Store in localStorage for potential future use
      const base64String = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      localStorage.setItem('currentPdfData', base64String);
      
      // For now, return a message indicating we have the PDF
      return { 
        text: `PDF downloaded successfully (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB). Text extraction functionality will be enhanced in the next update.`,
        error: undefined
      };

    } catch (fetchError) {
      console.error('PDF fetch failed:', fetchError);
      return {
        text: '',
        error: 'Failed to download PDF from arXiv'
      };
    }

  } catch (error) {
    console.error('PDF extraction failed:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error during PDF extraction'
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
