
import { GoogleGenAI } from '@google/genai';
import { Transcript } from '../types';

// This is a Vercel-compatible serverless function
// It needs to be placed in the /api directory
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { transcripts }: { transcripts: Transcript[] } = req.body;

    if (!transcripts || !Array.isArray(transcripts) || transcripts.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty transcripts provided.' });
    }

    if (!process.env.API_KEY) {
        return res.status(500).json({ error: 'API_KEY is not set on the server.' });
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const formattedTranscript = transcripts
      .map(t => `${t.speaker === 'user' ? 'Customer' : 'Agent'}: ${t.text}`)
      .join('\n');

    const prompt = `
      Based on the following conversation transcript from a call with a Real Estate Agency, please generate a concise and professional call summary report.
      
      The report should be structured with the following sections:
      
      1.  **Customer Intent:** Briefly describe the main reason for the customer's call.
      2.  **Key Information Captured:** List the important details provided by the customer.
      3.  **Resolution/Next Steps:** Outline the outcome of the call, any solutions provided, or the action items for either the agent or the customer.
      4.  **Overall Summary:** A brief paragraph summarizing the entire interaction.
      
      Format the output as plain text with clear headings.

      --- TRANSCRIPT ---
      ${formattedTranscript}
      --- END TRANSCRIPT ---
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    const summary = response.text;

    return res.status(200).json({ summary });

  } catch (error) {
    console.error('Error in summarization API:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ error: 'Failed to generate summary.', details: message });
  }
}
