
import pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.js?url";

interface PdfExtractionResult {
  text: string;
  error?: string;
}

// List of CORS proxy services to try in order
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://proxy.cors.sh/',
  'https://api.codetabs.com/v1/proxy?quest=',
];

const tryFetchWithProxy = async (pdfUrl: string, proxyUrl: string): Promise<Response> => {
  const proxiedUrl = proxyUrl + encodeURIComponent(pdfUrl);
  console.log(`Trying proxy: ${proxyUrl}`);
  const response = await fetch(proxiedUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/pdf,*/*',
    },
  });
  if (!response.ok) {
    throw new Error(`Proxy failed: ${response.status} ${response.statusText}`);
  }
  return response;
};

export const extractPdfText = async (pdfUrl: string): Promise<PdfExtractionResult> => {
  try {
    console.log('Fetching PDF from:', pdfUrl);

    // --- Proper worker config for Vite + pdfjs-dist ---
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

    let response: Response | null = null;
    let lastError: Error | null = null;

    // Try each CORS proxy in sequence
    for (const proxyUrl of CORS_PROXIES) {
      try {
        response = await tryFetchWithProxy(pdfUrl, proxyUrl);
        console.log(`Successfully fetched PDF using proxy: ${proxyUrl}`);
        break;
      } catch (error) {
        console.log(`Proxy ${proxyUrl} failed:`, error);
        lastError = error instanceof Error ? error : new Error('Unknown error');
        continue;
      }
    }

    // If all proxies failed, try direct fetch as last resort
    if (!response) {
      try {
        console.log('All proxies failed, trying direct fetch...');
        response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }
        console.log('Direct fetch succeeded');
      } catch (error) {
        throw new Error(
          `All proxy attempts failed. Last error: ${lastError?.message}. Direct fetch also failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      }
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
      error: error instanceof Error ? error.message : 'Unknown error during PDF extraction',
    };
  }
};
