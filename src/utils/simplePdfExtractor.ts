
import * as pdfjsLib from "pdfjs-dist";

interface PdfExtractionResult {
  text: string;
  error?: string;
}

// Simple PDF text extraction without worker
export const extractPdfText = async (pdfUrl: string): Promise<PdfExtractionResult> => {
  try {
    console.log('Starting simplified PDF extraction for:', pdfUrl);

    // Properly disable worker by setting it to an empty string or undefined
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';

    // Try direct fetch first
    let response: Response;
    try {
      response = await fetch(pdfUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF: ${response.status}`);
      }
    } catch (error) {
      // If direct fetch fails, try with a simple CORS proxy
      const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(pdfUrl);
      response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch PDF via proxy: ${response.status}`);
      }
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('PDF fetched, size:', arrayBuffer.byteLength, 'bytes');

    if (arrayBuffer.byteLength < 100) {
      throw new Error('PDF file appears empty or corrupted');
    }

    // Load PDF document with worker disabled
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      disableFontFace: true,
      disableRange: true,
      disableStream: true,
      disableAutoFetch: true
    }).promise;

    console.log('PDF loaded, pages:', pdf.numPages);

    let fullText = '';
    // Extract text from first 5 pages max for performance
    const maxPages = Math.min(pdf.numPages, 5);

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n\n';
        page.cleanup();
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        continue;
      }
    }

    pdf.destroy();
    
    if (fullText.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF');
    }

    console.log('PDF text extraction complete, length:', fullText.length);
    return { text: fullText.trim() };

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
