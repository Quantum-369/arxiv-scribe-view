
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PdfExtractionResult {
  text: string;
  error?: string;
}

// Simple and fast PDF text extraction using PDF.js
export const extractPdfText = async (pdfUrl: string): Promise<PdfExtractionResult> => {
  try {
    console.log('Starting PDF text extraction for:', pdfUrl);

    // Download the PDF
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('PDF downloaded, size:', (arrayBuffer.byteLength / 1024).toFixed(1), 'KB');

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log('PDF loaded, extracting text from', pdf.numPages, 'pages...');
    
    let fullText = '';
    
    // Simple sequential extraction - much faster than batching
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str || '')
          .join(' ');
        
        fullText += pageText + '\n\n';
        
        // Log progress every 5 pages
        if (pageNum % 5 === 0) {
          console.log(`Extracted page ${pageNum}/${pdf.numPages}`);
        }
      } catch (pageError) {
        console.warn(`Error on page ${pageNum}:`, pageError);
        fullText += `[Error extracting page ${pageNum}]\n\n`;
      }
    }

    console.log('PDF text extraction completed:', fullText.length, 'characters');
    
    return { 
      text: fullText.trim(),
      error: undefined
    };

  } catch (error) {
    console.error('PDF extraction failed:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Failed to extract PDF text'
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
