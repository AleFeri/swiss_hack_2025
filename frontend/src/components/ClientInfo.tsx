// src/components/ClientInfo.tsx

import React, { useState, useEffect } from 'react';
import { ClientApiResponse, ClientDetails, ClientListItem } from '../types'; // Import needed types
import { fetchClientDetails } from '@/data/clients'; // Import fetch function
import { UserCircle, Info, Mic, MicOff, Loader2, AlertCircle } from 'lucide-react'; // Added icons
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

// Interface for the props this component now expects
interface ClientInfoProps {
  clientIdentifier: string; // The ID of the client currently selected in the parent
  availableClients: ClientListItem[]; // List for the dropdown, passed from parent
  onClientChange: (clientId: string) => void; // Callback to parent when selection changes
  clientListError: string | null; // Error message if parent failed to load list
}

// --- Placeholder LLM Enrichment Function ---
// !! Replace this with a secure call to your backend which then calls the LLM !!
async function callLLMForEnrichment(clientContext: string): Promise<Partial<ClientDetails>> {
    console.log("--- SIMULATING LLM Call for Enrichment ---");
    // console.log("Context sent to LLM (simulation):", clientContext); // Optional: Log context

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate LLM Response based on simple context checks (VERY basic)
    let age = 40 + Math.floor(Math.random() * 20); // Random-ish age
    let occupation = "Unknown Profession";
    let funFacts = ["LLM analysis based on provided data."];

    if (clientContext.includes("Wertschriftendepot") || clientContext.includes("Investment")) {
        occupation = "Investor (estimated)";
        funFacts.push("Holds investment products.");
    } else if (clientContext.includes("Hypothek") || clientContext.includes("Loan")) {
         occupation = "Home Owner / Borrower (estimated)";
         funFacts.push("Has mortgage or loan products.");
    } else if (clientContext.includes("Pension") || clientContext.includes("Vorsorge")) {
        funFacts.push("Has pension savings (Pillar 3a).");
        if (age < 45) age = Math.max(30, age - 10); // Adjust age guess
    }
     if (clientContext.includes("MemberPlus-Kunde")){
         funFacts.push("Is a MemberPlus customer.");
     }

    // In a real scenario, the prompt would ask the LLM to extract/infer these
    // based *only* on the context, and handle cases where it cannot.
    console.log("--- SIMULATED LLM Response: ---", { age, occupation, funFacts });

    // Simulate potential LLM error randomly
    // if (Math.random() < 0.1) {
    //     throw new Error("Simulated LLM API error during enrichment.");
    // }

    return {
        age: age,
        occupation: occupation,
        funFacts: funFacts,
    };
}
// --- End Placeholder ---


const ClientInfo: React.FC<ClientInfoProps> = ({
  clientIdentifier,
  availableClients,
  onClientChange,
  clientListError
}) => {

  const [isRecording, setIsRecording] = useState(false);
  // State for BASE data fetched directly from API
  const [baseClientData, setBaseClientData] = useState<ClientApiResponse | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // State for ENRICHED data from LLM
  const [enrichedData, setEnrichedData] = useState<Partial<ClientDetails>>({}); // Store age, occupation, funfacts
  const [isEnriching, setIsEnriching] = useState<boolean>(false);
  const [enrichmentError, setEnrichmentError] = useState<string | null>(null);

  // State for generated summary/tip (can also come from LLM)
  const [clientSummary, setClientSummary] = useState<string | null>(null);
  const [meetingTip, setMeetingTip] = useState<string | null>(null);


  // Effect 1: Fetch BASE data when clientIdentifier changes
  useEffect(() => {
    if (!clientIdentifier) {
        setIsLoadingData(false);
        setDataError("No client selected.");
        setBaseClientData(null);
        setEnrichedData({}); // Clear enrichment too
        return;
    };

    const loadBaseData = async () => {
      console.log(`ClientInfo: useEffect triggered for ID: ${clientIdentifier}`);
      setIsLoadingData(true);
      setDataError(null);
      setBaseClientData(null); // Clear previous base data
      setEnrichedData({});    // Clear previous enrichment
      setClientSummary(null); // Clear summary/tip
      setMeetingTip(null);
      try {
        const data = await fetchClientDetails(clientIdentifier);
        setBaseClientData(data);
        // Enrichment will be triggered by the second useEffect
      } catch (err: any) {
        setDataError(err.message || 'Failed to load client details.');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadBaseData();
  }, [clientIdentifier]); // Re-run ONLY when the selected client ID changes


  // Effect 2: Trigger LLM enrichment AFTER base data is successfully fetched
  useEffect(() => {
    if (baseClientData && !isLoadingData && !dataError) {
        const enrichData = async () => {
            setIsEnriching(true);
            setEnrichmentError(null);
            setEnrichedData({}); // Clear previous enrichment before new call
            setClientSummary(null); // Clear previous summary/tip
            setMeetingTip(null);

            try {
                // --- Prepare context similar to sql_fetch_into_llm.py ---
                // This is a simplified example; you might want a more structured context
                let contextString = `Client Details:\n${JSON.stringify(baseClientData.client, null, 2)}\n\nAccounts:\n${JSON.stringify(baseClientData.accounts, null, 2)}\n\nPayment Methods:\n${JSON.stringify(baseClientData.payment_methods, null, 2)}`;
                // Limit context length if necessary
                if (contextString.length > 30000) { // Example limit
                   contextString = contextString.substring(0, 30000) + "\n... (context truncated)";
                }

                // --- Call the (placeholder) enrichment function ---
                // Replace this with your actual secure backend call later
                const llmResult = await callLLMForEnrichment(contextString);
                setEnrichedData(llmResult);

                // TODO: Generate summary/tip using another LLM call or based on llmResult/baseClientData
                setClientSummary(`LLM Summary Placeholder for ${baseClientData.client.full_name}. Age: ${llmResult.age || 'N/A'}, Occupation: ${llmResult.occupation || 'N/A'}.`);
                setMeetingTip("LLM Tip Placeholder: Discuss relevant findings.");

            } catch (err: any) {
                console.error("Enrichment error:", err);
                setEnrichmentError(err.message || "Failed to enrich client data.");
            } finally {
                setIsEnriching(false);
            }
        };
        enrichData();
    }
  // Re-run enrichment ONLY when baseClientData changes (and is valid)
  }, [baseClientData, isLoadingData, dataError]);


  const toggleRecording = () => setIsRecording(!isRecording);

  // --- Render Logic ---
  // Display loading indicator while fetching base data
  if (isLoadingData) {
    return <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6 text-center"><Loader2 className="h-6 w-6 animate-spin inline-block mr-2" /> Loading details for client {clientIdentifier}...</div>;
  }

  // Display error if base data fetch failed
  if (dataError) {
    return <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6 text-red-600"><AlertCircle className="h-5 w-5 inline-block mr-2"/> Error loading client data: {dataError}</div>;
  }

  // If loading is done, no error, but data is somehow still null (should not happen if ID is valid)
  if (!baseClientData) {
     const displayError = clientListError || "Client data not available.";
    return <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">{displayError}</div>;
  }

  // --- Display Fetched and Enriched Data ---
  const clientDetails = baseClientData.client;
  // Combine base details with potentially enriched details
  const displayInfo = { ...clientDetails, ...enrichedData };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
        {/* Client Info Display */}
        <div className="flex items-center mb-4 md:mb-0">
          <UserCircle className="h-12 w-12 text-raiffeisen-red mr-4 flex-shrink-0" />
          <div className="flex-1">
             {/* Mobile Dropdown */}
             <div className="md:hidden w-full mb-2">
              <Select value={clientIdentifier} onValueChange={onClientChange} disabled={isLoadingData || isEnriching}>
                <SelectTrigger className="w-full bg-white border-gray-200">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {availableClients.length > 0 ? (
                    availableClients.map((c) => (
                      <SelectItem key={c.client_identifier} value={c.client_identifier}>
                          {c.full_name || `Client ${c.client_identifier}`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                  )}
                  {clientListError && <SelectItem value="error" disabled>{clientListError}</SelectItem>}
                </SelectContent>
              </Select>
             </div>
             {/* Desktop Name */}
             <div className="hidden md:block">
               <h2 className="text-xl md:text-2xl font-bold text-raiffeisen-darkgray">{displayInfo.full_name || 'Client Details'}</h2>
               <div className="text-sm text-raiffeisen-mediumgray">
                   {displayInfo.client_type || 'N/A'} Client • ID: {displayInfo.client_identifier || 'N/A'}
                   {/* Display enriched Age & Occupation if available */}
                   {displayInfo.age && ` • Age: ${displayInfo.age} (est.)`}
                   {displayInfo.occupation && ` • ${displayInfo.occupation} (est.)`}
               </div>
             </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button onClick={toggleRecording} variant={isRecording ? "destructive" : "outline"} size="sm" className="flex items-center gap-2">
            {isRecording ? <><MicOff className="h-4 w-4" /><span>Stop</span></> : <><Mic className="h-4 w-4" /><span>Record</span></>}
          </Button>

          {/* Desktop Dropdown */}
          <div className="hidden md:block">
             <Select value={clientIdentifier} onValueChange={onClientChange} disabled={isLoadingData || isEnriching}>
              <SelectTrigger className="w-[200px] bg-white border-gray-200">
                <SelectValue placeholder="Select client" />
              </SelectTrigger>
              <SelectContent>
                 {availableClients.length > 0 ? (
                    availableClients.map((c) => (
                      <SelectItem key={c.client_identifier} value={c.client_identifier}>
                          {c.full_name || `Client ${c.client_identifier}`}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  )}
                  {clientListError && <SelectItem value="error" disabled>{clientListError}</SelectItem>}
              </SelectContent>
            </Select>
          </div>

          {/* Tooltip */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild><button className="text-raiffeisen-mediumgray hover:text-raiffeisen-red"><Info className="h-5 w-5" /></button></TooltipTrigger>
              <TooltipContent>
                 <div className="w-80 text-sm p-2">
                    {/* Display fetched details */}
                    <p><strong>Email:</strong> {clientDetails.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {clientDetails.phone || 'N/A'}</p>
                    <p><strong>Address:</strong> {clientDetails.address || 'N/A'}</p>
                    <p><strong>Member Nr:</strong> {clientDetails.membership_number || 'N/A'}</p>
                    <p><strong>Client Since:</strong> {clientDetails.created_at ? new Date(clientDetails.created_at).toLocaleDateString('de-CH') : 'N/A'}</p>
                    {/* Display fun facts if available */}
                    {displayInfo.funFacts && displayInfo.funFacts.length > 0 && (
                        <>
                         <hr className="my-2" />
                         <p><strong>Fun Facts (Generated):</strong></p>
                         <ul className='list-disc pl-4'>
                             {displayInfo.funFacts.map((fact, index) => <li key={index}>{fact}</li>)}
                         </ul>
                        </>
                    )}
                     <hr className="my-2" />
                    <p><strong>Accounts:</strong> {baseClientData.accounts.length}</p>
                    <p><strong>Payment Methods:</strong> {baseClientData.payment_methods.length}</p>
                    {isEnriching && <p className="mt-2 text-blue-500">Enriching data...</p>}
                    {enrichmentError && <p className="mt-2 text-red-500">Enrichment Error: {enrichmentError}</p>}
                  </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Client Summary Section (Uses state generated after enrichment) */}
      {(clientSummary || meetingTip) && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <h3 className="text-lg font-semibold text-raiffeisen-darkgray mb-2">Client Summary & Tip</h3>
          {isEnriching && <p className='text-sm text-gray-500 mb-2'>Generating summary...</p>}
          {enrichmentError && <p className='text-sm text-red-500 mb-2'>Could not generate summary: {enrichmentError}</p>}
          {(!isEnriching && !enrichmentError) && (
              <div className="bg-gray-50 p-4 rounded-md">
                {clientSummary && <p className="text-raiffeisen-darkgray mb-3">{clientSummary}</p>}
                {meetingTip && (
                  <div className="flex items-start mt-3">
                    <div className="bg-raiffeisen-red text-white text-xs font-medium px-2 py-1 rounded-full mr-2 mt-0.5">TIP</div>
                    <p className="text-sm italic text-raiffeisen-mediumgray">{meetingTip}</p>
                  </div>
                )}
              </div>
          )}
        </div>
      )}

      {/* Detailed Accounts Display Section (Example) */}
      <div className="mt-4 pt-4 border-t">
        <h3 className="text-lg font-semibold text-raiffeisen-darkgray mb-2">Accounts Overview</h3>
        {baseClientData.accounts.length > 0 ? (
          <ul className="space-y-3">
            {baseClientData.accounts.map(acc => (
              <li key={acc.account_id} className="text-sm border-b pb-2 last:border-b-0">
                <div className='font-semibold text-raiffeisen-darkgray'>
                    {acc.account_name || acc.account_type} ({acc.account_number})
                    <span className='text-xs font-normal bg-gray-100 px-1.5 py-0.5 rounded ml-2'>{acc.asset_category || 'N/A'}</span>
                </div>
                <div>Balance: {acc.balance.toLocaleString('de-CH', { style: 'currency', currency: acc.currency })}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-raiffeisen-mediumgray">No account details available.</p>
        )}
      </div>

    </div>
  );
};

export default ClientInfo;