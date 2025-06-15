
import * as pdfjsLib from "pdfjs-dist";

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
    console.log('Starting PDF extraction for:', pdfUrl);

    // Correctly set the worker source for pdfjs
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
    console.log("PDF.js worker enabled - using /pdf.worker.min.js");

    console.log('Fetching PDF from:', pdfUrl);

    let response: Response | null = null;
    let lastError: Error | null = null;

    // Try each CORS proxy in sequence
    for (const proxyUrl of CORS_PROXIES) {
      try {
        response = await tryFetchWithProxy(pdfUrl, proxyUrl);

        // **Check content-type before proceeding!**
        const ctype = response.headers.get('content-type') || '';
        console.log(`Fetched file content-type:`, ctype);
        if (!ctype.includes("pdf")) {
          // Try to preview the first 100 chars of the "PDF"
          const textPreview = await response.clone().text();
          throw new Error(
            `Expected a PDF but got: ${ctype}. Here is a preview: ${textPreview.substring(0, 100)}`
          );
        }

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
        // **Check content-type**
        const ctype = response.headers.get('content-type') || '';
        console.log(`Direct fetch file content-type:`, ctype);
        if (!ctype.includes("pdf")) {
          const textPreview = await response.clone().text();
          throw new Error(
            `Expected a PDF but got: ${ctype}. Here is a preview: ${textPreview.substring(0, 100)}`
          );
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

    // Confirm response is really a PDF!
    const ctype = response.headers.get('content-type') || '';
    if (!ctype.includes("pdf")) {
      const textPreview = await response.clone().text();
      throw new Error(
        `Expected a PDF but got: ${ctype}. Here is a preview: ${textPreview.substring(0, 100)}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('PDF fetched successfully, size:', arrayBuffer.byteLength, 'bytes');

    if (arrayBuffer.byteLength < 20) {
      throw new Error('PDF file appears empty or corrupted.');
    }

    console.log('Creating PDF document...');

    // Remove disableWorker/worker=null - Just provide the data
    const documentConfig: any = {
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      // DO NOT specify worker: null or disableWorker - workerSrc is now set
    };

    const loadingTask = pdfjsLib.getDocument(documentConfig);

    console.log('Loading task created, waiting for PDF...');

    // Add timeout to prevent infinite hanging
    const parsePromise = loadingTask.promise;
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        console.error('PDF parsing timed out after 30 seconds');
        loadingTask.destroy();
        reject(new Error('PDF parsing timeout - document may be corrupted or too large'));
      }, 30000);
    });

    const pdf = await Promise.race([parsePromise, timeoutPromise]);
    console.log('PDF loaded successfully! Pages:', pdf.numPages);

    let fullText = '';
    const maxPages = Math.min(pdf.numPages, 50); // Limit to 50 pages to prevent hanging

    console.log(`Extracting text from ${maxPages} pages...`);

    // Extract text from each page with individual timeouts
    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      console.log(`Processing page ${pageNum}/${maxPages}`);

      try {
        // Add timeout for each page
        const pagePromise = pdf.getPage(pageNum);
        const pageTimeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Page ${pageNum} timeout`)), 10000);
        });

        const page = await Promise.race([pagePromise, pageTimeoutPromise]);
        console.log(`Page ${pageNum} loaded, extracting text...`);

        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');

        fullText += pageText + '\n';
        console.log(`Page ${pageNum} processed, added ${pageText.length} characters`);

        // Cleanup page to free memory
        page.cleanup();
      } catch (pageError) {
        console.warn(`Failed to extract text from page ${pageNum}:`, pageError);
        // Continue with other pages instead of failing completely
        continue;
      }
    }

    console.log('PDF text extraction complete! Total length:', fullText.length);

    if (fullText.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF - document may be image-based or corrupted');
    }

    // Cleanup the PDF document
    pdf.destroy();

    return { text: fullText.trim() };

  } catch (error) {
    console.error('PDF extraction failed:', error);
    return {
      text: '',
      error: error instanceof Error ? error.message : 'Unknown error during PDF extraction',
    };
  }
};
