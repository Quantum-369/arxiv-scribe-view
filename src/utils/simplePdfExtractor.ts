
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source to the official CDN build for better performance
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js`;

interface PdfExtractionResult {
  text: string;
  error?: string;
}

// Fast PDF text extraction using PDF.js - based on proven simple approach
export const extractPdfText = async (pdfUrl: string): Promise<PdfExtractionResult> => {
  try {
    console.log('Starting PDF download for:', pdfUrl);
    const downloadStartTime = Date.now();

    // Download the PDF
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const downloadEndTime = Date.now();
    console.log(`PDF downloaded in ${(downloadEndTime - downloadStartTime) / 1000} seconds. Size: ${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB`);
    
    const typedArray = new Uint8Array(arrayBuffer);
    
    console.log('Starting PDF parsing...');
    const parseStartTime = Date.now();
    
    // Load the PDF document - simple and direct approach
    const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
    
    console.log('PDF loaded, extracting text from', pdf.numPages, 'pages...');
    
    let fullText = '';
    
    // Simple iteration through pages - this is the fastest approach
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n\n';
    }

    const parseEndTime = Date.now();
    console.log(`PDF parsing and text extraction completed in ${(parseEndTime - parseStartTime) / 1000} seconds. Total characters: ${fullText.length}`);
    
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
