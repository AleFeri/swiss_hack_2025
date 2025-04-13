// src/data/clients.ts

import { ClientApiResponse, ClientListItem } from '../types'; // Added ClientListItem

// --- Configuration ---
const API_BASE_URL = 'http://127.0.0.1:8000'; // Your FastAPI backend address

/**
 * Fetches detailed client data from the backend API.
 * @param identifier - The client identifier (e.g., '111.111.111.1')
 * @returns A Promise resolving to the ClientApiResponse object.
 * @throws An error if the fetch fails or the response is not ok.
 */
export async function fetchClientDetails(identifier: string): Promise<ClientApiResponse> {
  const apiUrl = `${API_BASE_URL}/clients/${identifier}`;
  console.log(`Fetching client details from: ${apiUrl}`);
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      let errorDetail = `API error fetching details! status: ${response.status}`;
      try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } catch (e) {}
      console.error(`API Error Response: ${errorDetail}`);
      throw new Error(errorDetail);
    }
    const data: ClientApiResponse = await response.json();
    console.log('Successfully fetched client details.');
    return data;
  } catch (error) {
    console.error('Error in fetchClientDetails:', error);
    throw error;
  }
}

/**
 * Fetches the list of available clients for selection.
 * @returns A Promise resolving to an array of ClientListItem objects.
 * @throws An error if the fetch fails.
 */
export async function fetchClientList(): Promise<ClientListItem[]> {
    const apiUrl = `${API_BASE_URL}/clients`; // Endpoint to list clients
    console.log(`Fetching client list from: ${apiUrl}`);
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            let errorDetail = `API error listing clients! status: ${response.status}`;
             try { const errorData = await response.json(); errorDetail = errorData.detail || errorDetail; } catch (e) {}
            console.error(`API Error Response: ${errorDetail}`);
            throw new Error(errorDetail);
        }
        const data: ClientListItem[] = await response.json();
        console.log(`Fetched ${data.length} clients for list.`);
        return data;
    } catch(error) {
        console.error('Error in fetchClientList:', error);
        throw error;
    }
}
