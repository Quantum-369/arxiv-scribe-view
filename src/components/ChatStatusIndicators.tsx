
import { Paper } from "@/types/paper";
import { CheckCircle, AlertTriangle, FileText } from "lucide-react";

interface ChatStatusIndicatorsProps {
  paper?: Paper;
}

const ChatStatusIndicators = ({ paper }: ChatStatusIndicatorsProps) => {
  if (!paper) return null;

  return (
    <div className="space-y-3">
      {paper.textExtractionError && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-amber-100 mt-0.5">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">Limited Text Access</p>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                Could not extract full paper text ({paper.textExtractionError}). 
                My responses will be based on the abstract and metadata available.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {paper.fullText && (
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded-full bg-emerald-100 mt-0.5">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-900">Full Paper Access</p>
              <div className="flex items-center gap-2 mt-1">
                <FileText className="h-3 w-3 text-emerald-600" />
                <p className="text-xs text-emerald-700">
                  {(paper.fullText.length / 1000).toFixed(1)}k characters extracted • Complete content analysis available
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatStatusIndicators;
