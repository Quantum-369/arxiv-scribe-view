
import { Paper } from "@/types/paper";

interface ChatStatusIndicatorsProps {
  paper?: Paper;
}

const ChatStatusIndicators = ({ paper }: ChatStatusIndicatorsProps) => {
  if (!paper) return null;

  return (
    <>
      {paper.textExtractionError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            Note: Could not extract full paper text ({paper.textExtractionError}). 
            Chat responses will be based on the abstract and metadata only.
          </p>
        </div>
      )}
      {paper.fullText && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-800">
            ✓ Full paper content extracted ({(paper.fullText.length / 1000).toFixed(1)}k characters). 
            I can now answer detailed questions about the entire paper.
          </p>
        </div>
      )}
    </>
  );
};

export default ChatStatusIndicators;
