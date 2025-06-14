
interface PdfExtractionResult {
  text: string;
  error?: string;
}

export const extractPdfText = async (pdfUrl: string): Promise<PdfExtractionResult> => {
  try {
    console.log('Fetching PDF from:', pdfUrl);
    
    // Import pdfjs-dist dynamically
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker source for PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const response = await fetch(pdfUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    console.log('Parsing PDF content...');
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    console.log('PDF text extraction complete, length:', fullText.length);
    return { text: fullText.trim() };
  } catch (error) {
    console.error('Error extracting PDF text:', error);
    return { 
      text: '', 
      error: error instanceof Error ? error.message : 'Unknown error during PDF extraction' 
    };
  }
};
