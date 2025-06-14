
interface PdfExtractionResult {
  text: string;
  error?: string;
}

export const extractPdfText = async (pdfUrl: string): Promise<PdfExtractionResult> => {
  try {
    // Import pdf-parse dynamically to avoid issues with SSR
    const pdfParse = (await import('pdf-parse')).default;
    
    console.log('Fetching PDF from:', pdfUrl);
    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    console.log('Parsing PDF content...');
    const data = await pdfParse(buffer);
    
    console.log('PDF text extraction complete, length:', data.text.length);
    return { text: data.text };
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : 'Unknown error during PDF extraction' 
    };
  }
};
