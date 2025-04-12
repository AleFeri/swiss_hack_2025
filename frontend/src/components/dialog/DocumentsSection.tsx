
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileText } from 'lucide-react';

interface Document {
  title: string;
  url: string;
}

interface DocumentsSectionProps {
  documents?: Document[];
}

const DocumentsSection: React.FC<DocumentsSectionProps> = ({ documents }) => {
  const [activeDocumentIndex, setActiveDocumentIndex] = useState(0);
  
  return (
    <div className="bg-raiffeisen-lightgray rounded-lg p-4 mb-4 flex flex-col flex-grow h-full">
      <h3 className="font-medium mb-3 text-raiffeisen-darkgray">Documents</h3>
      
      {documents && documents.length > 0 ? (
        <div className="flex flex-col h-full">
          <div className="flex gap-2 mb-4">
            {documents.map((doc, index) => (
              <Button
                key={index}
                variant={activeDocumentIndex === index ? "default" : "outline"}
                className={`flex items-center ${activeDocumentIndex === index ? 'bg-raiffeisen-red' : ''}`}
                onClick={() => setActiveDocumentIndex(index)}
              >
                <FileText className="h-4 w-4 mr-2" />
                {doc.title}
              </Button>
            ))}
          </div>
          
          <div className="bg-white border border-gray-200 rounded-md p-4 flex-grow flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-raiffeisen-red mx-auto mb-4" />
              <h3 className="font-medium">{documents[activeDocumentIndex].title}</h3>
              <p className="text-sm text-gray-500 mt-2">PDF Preview would appear here</p>
              <Button className="mt-4 bg-raiffeisen-red hover:bg-raiffeisen-red/90">
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center flex-grow">
          <p className="text-raiffeisen-mediumgray">No documents available for preview</p>
        </div>
      )}
    </div>
  );
};

export default DocumentsSection;
