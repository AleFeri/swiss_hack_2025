
import React from 'react';
import { ThumbsUp } from 'lucide-react';

interface ReasonsSectionProps {
  reasons: string[];
}

const ReasonsSection: React.FC<ReasonsSectionProps> = ({ reasons }) => {
  return (
    <div className="bg-raiffeisen-lightgray rounded-lg p-4">
      <h3 className="font-medium mb-3 text-raiffeisen-darkgray">All Reasons to Recommend</h3>
      <ul className="bg-white border border-gray-200 rounded-md p-4">
        {reasons.map((reason, index) => (
          <li key={index} className="flex items-start mb-3 last:mb-0">
            <ThumbsUp className="h-5 w-5 text-raiffeisen-red mr-2 mt-0.5 flex-shrink-0" />
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReasonsSection;
