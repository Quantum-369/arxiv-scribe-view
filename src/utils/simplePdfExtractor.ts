
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface PdfExtractionResult {
  text: string;
  error?: string;
}

// PDF text extraction using PDF.js with optimizations
export const extractPdfText = async (pdfUrl: string): Promise<PdfExtractionResult> => {
  try {
    console.log('Starting PDF download and text extraction for:', pdfUrl);

    // Download the PDF
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('PDF downloaded successfully, size:', arrayBuffer.byteLength, 'bytes');

    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    console.log('PDF loaded, extracting text from', pdf.numPages, 'pages...');
    
    // Limit pages for faster extraction (first 20 pages should be enough for most papers)
    const maxPages = Math.min(pdf.numPages, 20);
    console.log(`Processing first ${maxPages} pages for faster extraction...`);
    
    // Process pages in parallel batches for better performance
    const batchSize = 5;
    let fullText = '';
    
    for (let startPage = 1; startPage <= maxPages; startPage += batchSize) {
      const endPage = Math.min(startPage + batchSize - 1, maxPages);
      console.log(`Processing pages ${startPage}-${endPage}...`);
      
      // Process batch of pages in parallel
      const pagePromises = [];
      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        pagePromises.push(
          pdf.getPage(pageNum)
            .then(page => page.getTextContent())
            .then(textContent => ({
              pageNum,
              text: textContent.items
                .map((item: any) => item.str || '')
                .join(' ')
            }))
            .catch(error => ({
              pageNum,
              text: `[Error extracting page ${pageNum}]`
            }))
        );
      }
      
      // Wait for batch to complete with timeout
      const results = await Promise.race([
        Promise.all(pagePromises),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Page extraction timeout')), 10000)
        )
      ]) as Array<{pageNum: number, text: string}>;
      
      // Add results in order
      results
        .sort((a, b) => a.pageNum - b.pageNum)
        .forEach(result => {
          fullText += result.text + '\n\n';
        });
    }

    if (pdf.numPages > maxPages) {
      fullText += `\n\n[Note: This paper has ${pdf.numPages} pages. Only the first ${maxPages} pages were processed for faster loading. Full content may be available in the PDF.]`;
    }

    console.log('PDF text extraction completed, total length:', fullText.length, 'characters');
    
    return { 
      text: fullText.trim(),
      error: undefined
    };

  } catch (error) {
    console.error('PDF text extraction failed:', error);
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
