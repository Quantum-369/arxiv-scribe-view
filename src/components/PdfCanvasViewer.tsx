
import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import "pdfjs-dist/web/pdf_viewer.css";

// Ensure worker is correct for your version of pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js";

interface PdfCanvasViewerProps {
  pdfUrl: string;
}

type PageRenderStatus = "pending" | "rendered" | "error";

const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({ pdfUrl }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageStatuses, setPageStatuses] = useState<PageRenderStatus[]>([]);
  const [error, setError] = useState<string | null>(null);
  const pageRefs = useRef<Array<HTMLCanvasElement | null>>([]);

  // Download and render PDF on mount (and when pdfUrl changes)
  useEffect(() => {
    let cancelled = false;
    setNumPages(null);
    setError(null);
    setPageStatuses([]);

    const renderPdf = async () => {
      try {
        // Fetch PDF file as ArrayBuffer
        const res = await fetch(pdfUrl);
        if (!res.ok) throw new Error("Failed to fetch PDF");
        const data = await res.arrayBuffer();
        const pdf = await (pdfjsLib.getDocument({ data }) as any).promise;

        if (cancelled) return;
        setNumPages(pdf.numPages);
        setPageStatuses(Array(pdf.numPages).fill("pending"));

        // Render each page (one after another for now)
        for (let i = 1; i <= pdf.numPages; i++) {
          try {
            const page = await pdf.getPage(i);
            // Device pixel ratio for sharpness
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = pageRefs.current[i - 1];
            if (!canvas) continue;
            const context = canvas.getContext("2d");
            if (!context) continue;
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
              canvasContext: context,
              viewport: viewport,
            }).promise;

            setPageStatuses(s => {
              const copy = [...s];
              copy[i - 1] = "rendered";
              return copy;
            });
          } catch (pageError) {
            setPageStatuses(s => {
              const copy = [...s];
              copy[i - 1] = "error";
              return copy;
            });
          }
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Could not display PDF."
        );
      }
    };

    renderPdf();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  if (error) {
    return (
      <div className="p-6 text-red-700 bg-red-50 rounded">
        Could not display PDF: {error}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-8 pb-12">
      {numPages === null && (
        <div className="flex flex-col items-center justify-center h-72 w-full">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <div className="text-gray-600 text-base">Loading PDF...</div>
        </div>
      )}
      {numPages !== null &&
        Array.from({ length: numPages }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center w-full"
          >
            <div className="mb-1 text-gray-500 text-xs">Page {i + 1}</div>
            <div className="overflow-auto rounded shadow bg-white relative">
              <canvas
                ref={el => (pageRefs.current[i] = el)}
                className="max-w-full border"
                style={{ background: "#eee" }}
                tabIndex={0}
              />
            </div>
            {pageStatuses[i] === "pending" && (
              <div className="text-xs text-blue-400 mt-1 mb-4 animate-pulse">Rendering...</div>
            )}
            {pageStatuses[i] === "error" && (
              <div className="text-xs text-red-500 mt-1 mb-4">Failed to render page.</div>
            )}
          </div>
        ))}
    </div>
  );
};

export default PdfCanvasViewer;
