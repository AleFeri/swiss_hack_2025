
import React, { useState } from 'react';
import { Client } from '../types';
import { UserCircle, Info, ChevronDown, Mic, MicOff } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { clients } from '@/data/clients';

interface ClientInfoProps {
  client: Client;
  onClientChange?: (clientId: string) => void;
}

const ClientInfo: React.FC<ClientInfoProps> = ({ client, onClientChange }) => {
  const [isRecording, setIsRecording] = useState(false);

  // Client summaries - these would ideally come from an LLM in a real implementation
  const clientSummaries: Record<string, { description: string, meetingTip: string }> = {
    '1': {
      description: "Anna is a tech-savvy professional with a strong interest in sustainable investments. She recently purchased a new apartment and is looking to grow her savings in an environmentally responsible way.",
      meetingTip: "Ask Anna about her new apartment and how her remote work setup is going."
    },
    '2': {
      description: "Thomas is planning for early retirement and has two children in university. He's interested in optimizing his investment portfolio to ensure financial stability for his family's future.",
      meetingTip: "Mention the university scholarships Raiffeisen offers - his children might benefit from them."
    },
    '3': {
      description: "Maria recently got married and is planning to buy her first property. She has entrepreneurial ambitions and might be interested in business-related financial products.",
      meetingTip: "Congratulate Maria on her recent marriage and ask about her property search progress."
    }
  };

  const handleClientChange = (value: string) => {
    if (onClientChange) {
      onClientChange(value);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // In a real implementation, this would start/stop the actual recording
    console.log(isRecording ? 'Stopping recording...' : 'Starting recording...');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        <div className="flex items-center mb-4 md:mb-0">
          <UserCircle className="h-12 w-12 text-raiffeisen-red mr-4 flex-shrink-0" />
          <div className="flex-1">
            <div className="md:hidden w-full mb-2">
              <Select defaultValue={client.id} onValueChange={handleClientChange}>
                <SelectTrigger className="w-full bg-white border-gray-200">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="hidden md:block">
              <h2 className="text-2xl font-bold text-raiffeisen-darkgray">{client.name}</h2>
              <div className="text-raiffeisen-mediumgray">
                {client.age} years old • {client.occupation}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            onClick={toggleRecording}
            variant={isRecording ? "destructive" : "outline"}
            size="sm"
            className="flex items-center gap-2 transition-all duration-200"
          >
            {isRecording ? (
              <>
                <MicOff className="h-4 w-4" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic className="h-4 w-4" />
                <span>Record</span>
              </>
            )}
          </Button>
          
          <div className="hidden md:block">
            <Select defaultValue={client.id} onValueChange={handleClientChange}>
              <SelectTrigger className="w-[180px] bg-white border-gray-200">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-raiffeisen-mediumgray hover:text-raiffeisen-red">
                  <Info className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-80">
                  <strong className="block mb-2">Fun Facts:</strong>
                  <ul className="list-disc pl-4">
                    {client.funFacts?.map((fact, index) => (
                      <li key={index} className="mb-1">{fact}</li>
                    ))}
                  </ul>
                  <strong className="block mt-3 mb-1">Portfolio:</strong>
                  <p>{client.portfolioDetails}</p>
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Client Summary Section */}
      <div className="mt-5 pt-5 border-t border-gray-100">
        <h3 className="text-lg font-semibold text-raiffeisen-darkgray mb-2">Client Summary</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <p className="text-raiffeisen-darkgray mb-3">
            {clientSummaries[client.id]?.description || "No client summary available."}
          </p>
          <div className="flex items-start mt-3">
            <div className="bg-raiffeisen-red text-white text-xs font-medium px-2 py-1 rounded-full mr-2 mt-0.5">TIP</div>
            <p className="text-sm italic text-raiffeisen-mediumgray">
              {clientSummaries[client.id]?.meetingTip || "No meeting tip available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientInfo;
