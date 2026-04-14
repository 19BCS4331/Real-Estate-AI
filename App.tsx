import React, { useState, useRef, useCallback, useEffect } from "react";
import { GoogleGenAI, Modality, LiveServerMessage, Blob, Type } from "@google/genai";
import { USE_CASES, LANGUAGES } from "./constants";
import { Transcript, UseCase, Language, ConversationRecord } from "./types";
import { decode, encode, decodeAudioData } from "./utils/audioUtils";
import {
  MicrophoneIcon,
  StopIcon,
  UserIcon,
  AgentIcon,
  ReportIcon,
  HistoryIcon,
  PlusIcon,
} from "./components/Icons";

interface LiveSession {
  sendRealtimeInput(input: { media: Blob }): void;
  close(): void;
}

// Based on the GenAI SDK's internal types
interface SpeechRecognitionResult {
  text: string;
  isFinal: boolean;
}

type Status =
  | "idle"
  | "connecting"
  | "listening"
  | "speaking"
  | "error"
  | "summarizing";
type View = "live_call" | "report";

// Main App Component
export default function App() {
  const [view, setView] = useState<View>("live_call");
  const [history, setHistory] = useState<ConversationRecord[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(
    null
  );

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem("conversationHistory");
      if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        setHistory(parsedHistory);
        if (parsedHistory.length > 0) {
          setSelectedHistoryId(parsedHistory[0].id);
          setView("report");
        }
      }
    } catch (error) {
      console.error("Failed to load history from localStorage", error);
    }
  }, []);

  const handleNewCall = () => {
    setView("live_call");
  };

  const handleSessionEnd = (newRecord: ConversationRecord) => {
    const newHistory = [newRecord, ...history];
    setHistory(newHistory);
    try {
      localStorage.setItem("conversationHistory", JSON.stringify(newHistory));
    } catch (error) {
      console.error("Failed to save history to localStorage", error);
    }
    setSelectedHistoryId(newRecord.id);
    setView("report");
  };

  const selectedConversation = history.find((h) => h.id === selectedHistoryId);

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans flex flex-col">
      <header className="bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-gray-700 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">
            Real Estate AI
          </h1>
          <p className="text-gray-400">Conversational AI Agent</p>
        </div>
        {view === "report" ? (
          <button
            onClick={handleNewCall}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            New Call
          </button>
        ): (<button
            onClick={()=>setView("report")}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <HistoryIcon className="w-5 h-5" />
            History
          </button>)}
      </header>

      {view === "live_call" ? (
        <LiveCallView onSessionEnd={handleSessionEnd} />
      ) : (
        <ReportView
          history={history}
          selectedConversation={selectedConversation}
          setSelectedHistoryId={setSelectedHistoryId}
        />
      )}
    </div>
  );
}

// Email Function Declaration for Gemini Live API
const sendEmailFunctionDeclaration = {
  name: "send_property_email",
  description: "Send an email to a customer with property details and brochure. Use this when the customer requests property information via email or wants to receive details/brochure.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerEmail: {
        type: Type.STRING,
        description: "Customer's email address"
      },
      customerName: {
        type: Type.STRING,
        description: "Customer's name for personalization"
      },
      propertyDetails: {
        type: Type.STRING,
        description: "Details about the property (location, price, type, etc.)"
      },
      subject: {
        type: Type.STRING,
        description: "Email subject line"
      },
      includeBrochure: {
        type: Type.BOOLEAN,
        description: "Whether to attach property brochure"
      }
    },
    required: ["customerEmail", "customerName", "propertyDetails", "subject"]
  }
};

// Beautiful Email Body Generator
function generateEmailBody(customerName: string, propertyDetails: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Property Information</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 40px 30px; text-align: center;">
          <h1 style="margin: 0; color: #1f2937; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
            Real Estate Agency
          </h1>
          <p style="margin: 10px 0 0; color: #4b5563; font-size: 16px; font-weight: 500;">
            Your Trusted Property Partner
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
          <!-- Greeting -->
          <div style="margin-bottom: 30px;">
            <p style="margin: 0; color: #374151; font-size: 18px; line-height: 1.6;">
              Dear <strong style="color: #f59e0b;">${customerName}</strong>,
            </p>
            <p style="margin: 15px 0 0; color: #6b7280; font-size: 16px; line-height: 1.7;">
              Thank you for your interest in our properties. As discussed, here are the detailed information about the property you're interested in:
            </p>
          </div>

          <!-- Property Details Card -->
          <div style="background: linear-gradient(to bottom right, #fef3c7, #fde68a); border-radius: 12px; padding: 25px; margin: 25px 0; border-left: 4px solid #f59e0b;">
            <h2 style="margin: 0 0 15px; color: #1f2937; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
              <span style="display: inline-block; width: 8px; height: 8px; background-color: #f59e0b; border-radius: 50%; margin-right: 10px;"></span>
              Property Details
            </h2>
            <div style="color: #374151; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">
              ${propertyDetails}
            </div>
          </div>

          <!-- Key Features -->
          <div style="margin: 30px 0;">
            <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px; font-weight: 600;">
              Why Choose Us?
            </h3>
            <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
              <li style="margin-bottom: 8px;">✓ Prime locations with excellent connectivity</li>
              <li style="margin-bottom: 8px;">✓ Transparent pricing with no hidden charges</li>
              <li style="margin-bottom: 8px;">✓ Trusted builders with proven track record</li>
              <li style="margin-bottom: 8px;">✓ Comprehensive legal documentation support</li>
              <li style="margin-bottom: 0;">✓ Post-sale assistance and guidance</li>
            </ul>
          </div>

          <!-- Call to Action -->
          <div style="background-color: #1f2937; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
            <p style="margin: 0 0 15px; color: #f3f4f6; font-size: 16px; font-weight: 500;">
              Ready to take the next step?
            </p>
            <p style="margin: 0; color: #9ca3af; font-size: 14px;">
              Schedule a site visit or call us for more information
            </p>
          </div>

          <!-- Signature -->
          <div style="margin-top: 35px; padding-top: 25px; border-top: 2px solid #e5e7eb;">
            <p style="margin: 0; color: #374151; font-size: 16px; font-weight: 600;">
              Best regards,
            </p>
            <p style="margin: 8px 0; color: #f59e0b; font-size: 18px; font-weight: 700;">
              Aadhya
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">
              Property Consultant<br>
              Real Estate Agency
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #1f2937; padding: 25px 30px; text-align: center;">
          <p style="margin: 0; color: #9ca3af; font-size: 13px;">
            © ${new Date().getFullYear()} Real Estate Agency. All rights reserved.
          </p>
          <p style="margin: 10px 0 0; color: #6b7280; font-size: 12px;">
            This email was sent based on your conversation with our AI agent.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Live Call View Component
interface LiveCallViewProps {
  onSessionEnd: (record: ConversationRecord) => void;
}
const LiveCallView: React.FC<LiveCallViewProps> = ({ onSessionEnd }) => {
  const [selectedUseCaseId, setSelectedUseCaseId] = useState<string>(
    USE_CASES[0].id
  );
  const [selectedLanguageId, setSelectedLanguageId] = useState<string>(
    LANGUAGES[0].id
  );
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentUserInput, setCurrentUserInput] = useState("");
  const [currentAiOutput, setCurrentAiOutput] = useState("");

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const statusRef = useRef<Status>(status);
  // NEW: buffer tokens for non-final user partials
  const lastNonFinalUserTokensRef = useRef<string[]>([]);

  // NEW: buffer tokens for non-final AI partials
  const lastNonFinalAiTokensRef = useRef<string[]>([]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  // Refs for assembling final transcripts from chunks
  const committedUserInputRef = useRef("");
  const committedAiOutputRef = useRef("");
  const finalTranscriptForTurnRef = useRef({ user: "", ai: "" });

  const startSession = useCallback(async () => {
    setTranscripts([]);
    setCurrentUserInput("");
    setCurrentAiOutput("");
    setErrorMessage("");
    setStatus("connecting");
    committedUserInputRef.current = "";
    committedAiOutputRef.current = "";
    finalTranscriptForTurnRef.current = { user: "", ai: "" };

    try {
      if (!process.env.API_KEY)
        throw new Error("API_KEY environment variable not set.");
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const selectedUseCase = USE_CASES.find(
        (uc) => uc.id === selectedUseCaseId
      )!;
      const systemInstruction = `${selectedUseCase.promptDescription}`;

      const AudioContext =
        window.AudioContext || (window as any).webkitAudioContext;
      inputAudioContextRef.current = new AudioContext({ sampleRate: 16000 });
      outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      nextStartTimeRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const tools = [{ 
        functionDeclarations: [sendEmailFunctionDeclaration] 
      }];

      sessionPromiseRef.current = ai.live.connect({
        model: "gemini-2.5-flash-native-audio-preview-09-2025",
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Erinome" } } },
          systemInstruction,
          tools,
        },
        callbacks: {
          onopen: () => {
            setStatus("listening");
            if (!inputAudioContextRef.current || !mediaStreamRef.current)
              return;
            mediaStreamSourceRef.current =
              inputAudioContextRef.current.createMediaStreamSource(
                mediaStreamRef.current
              );
            scriptProcessorRef.current =
              inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);

            scriptProcessorRef.current.onaudioprocess = (
              audioProcessingEvent
            ) => {
              if (statusRef.current === "speaking") return;
              const inputData =
                audioProcessingEvent.inputBuffer.getChannelData(0);

              const buffer = new ArrayBuffer(inputData.length * 2);
              const view = new DataView(buffer);
              for (let i = 0; i < inputData.length; i++) {
                const s = Math.max(-1, Math.min(1, inputData[i]));
                view.setInt16(i * 2, s * 0x7fff, true);
              }

              const pcmBlob: Blob = {
                data: encode(new Uint8Array(buffer)),
                mimeType: "audio/pcm;rate=16000",
              };

              sessionPromiseRef.current?.then((session) =>
                session.sendRealtimeInput({ media: pcmBlob })
              );
            };

            mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
            scriptProcessorRef.current.connect(
              inputAudioContextRef.current.destination
            );
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.interrupted) {
              audioSourcesRef.current.forEach((source) => source.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // Handle tool calls
            if (message.toolCall) {
              console.log('Tool call received:', message.toolCall);
              
              const functionResponses = [];
              
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === "send_property_email") {
                  try {
                    const args = fc.args as any;
                    
                    // Call backend API to send email
                    const response = await fetch('/api/send-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                      to: args.customerEmail,
                      subject: args.subject,
                      body: generateEmailBody(args.customerName, args.propertyDetails),
                      attachments: args.includeBrochure ? [{
                        filename: 'property_brochure.pdf',
                        content: '' // Base64 encoded brochure content would go here
                      }] : undefined
                      }),
                    });
                    
                    const result = await response.json();
                    
                    functionResponses.push({
                      id: fc.id,
                      name: fc.name,
                      response: { 
                        success: result.success,
                        message: result.message 
                      }
                    });
                    
                    console.log('Email sent successfully:', result);
                  } catch (error) {
                    console.error('Email tool error:', error);
                    functionResponses.push({
                      id: fc.id,
                      name: fc.name,
                      response: { 
                        success: false, 
                        error: 'Failed to send email' 
                      }
                    });
                  }
                }
              }
              
              // Send tool response back to AI
              sessionPromiseRef.current?.then((session) =>
                session.sendToolResponse({ functionResponses })
              );
              
              return;
            }

            if (message.serverContent?.inputTranscription) {
              const result: any = message.serverContent.inputTranscription;
              const tokenText: string = result?.text ?? "";

              // Debug optionally
              console.debug("inputTranscription received:", result);

              // If SDK provides isFinal flag
              if (result.isFinal === true) {
                // Fold any buffered non-final tokens first (defensive)
                if (lastNonFinalUserTokensRef.current.length > 0) {
                  committedUserInputRef.current = (
                    committedUserInputRef.current +
                    lastNonFinalUserTokensRef.current.join("")
                  ).trim();
                  lastNonFinalUserTokensRef.current = [];
                }
                // Append final token (with a trailing space)
                committedUserInputRef.current = (
                  committedUserInputRef.current +
                  " " +
                  tokenText
                ).trim();
                const displayText = committedUserInputRef.current.trim();
                finalTranscriptForTurnRef.current.user = displayText;
                setCurrentUserInput(displayText);
              } else {
                // Non-final: buffer token (avoid duplicates)
                const tokens = lastNonFinalUserTokensRef.current;
                if (
                  tokens.length === 0 ||
                  tokens[tokens.length - 1] !== tokenText
                ) {
                  tokens.push(tokenText);
                }
                // Display committed + buffered tokens
                const displayText = (
                  committedUserInputRef.current + tokens.join("")
                ).trim();
                finalTranscriptForTurnRef.current.user = displayText;
                setCurrentUserInput(displayText);
              }
            }

            if (message.serverContent?.outputTranscription) {
              setStatus("speaking");

              // SDK shape may not include isFinal; treat non-true as non-final.
              const result: any = message.serverContent.outputTranscription;
              const tokenText: string = result?.text ?? "";

              // quick dedupe: if the same token repeats back-to-back ignore it
              const tokens = lastNonFinalAiTokensRef.current;
              if (
                tokens.length === 0 ||
                tokens[tokens.length - 1] !== tokenText
              ) {
                // If SDK provides isFinal === true, treat as final chunk
                if (result.isFinal === true) {
                  // Append final token to committed and clear the non-final buffer
                  committedAiOutputRef.current = (
                    committedAiOutputRef.current +
                    tokenText +
                    " "
                  ).trimStart();
                  lastNonFinalAiTokensRef.current = [];
                  const displayText = committedAiOutputRef.current.trim();
                  finalTranscriptForTurnRef.current.ai = displayText;
                  setCurrentAiOutput(displayText);
                } else {
                  // Non-final: buffer tokens (SDK here is sending one-token partials)
                  tokens.push(tokenText);
                  // Show committed + buffered tokens (join preserves spaces from tokens)
                  const displayText = (
                    committedAiOutputRef.current + tokens.join("")
                  ).trim();
                  finalTranscriptForTurnRef.current.ai = displayText;
                  setCurrentAiOutput(displayText);
                }
              } else {
                // If duplicate token — still update UI from current buffer
                const displayText = (
                  committedAiOutputRef.current + tokens.join("")
                ).trim();
                finalTranscriptForTurnRef.current.ai = displayText;
                setCurrentAiOutput(displayText);
              }
              console.debug(
                "RAW outputTranscription full object:",
                message.serverContent.outputTranscription
              );
            }

            if (message.serverContent?.turnComplete) {
              // Flush any buffered user tokens into committed
              if (lastNonFinalUserTokensRef.current.length > 0) {
                committedUserInputRef.current = (
                  committedUserInputRef.current +
                  lastNonFinalUserTokensRef.current.join("") +
                  " "
                ).trim();
                lastNonFinalUserTokensRef.current = [];
              }
              // Also flush AI buffered tokens if you haven't already (you added this previously)
              if (
                lastNonFinalAiTokensRef.current &&
                lastNonFinalAiTokensRef.current.length > 0
              ) {
                committedAiOutputRef.current = (
                  committedAiOutputRef.current +
                  lastNonFinalAiTokensRef.current.join("") +
                  " "
                ).trim();
                lastNonFinalAiTokensRef.current = [];
              }

              const userText =
                finalTranscriptForTurnRef.current.user.trim() ||
                committedUserInputRef.current.trim();
              const aiText =
                finalTranscriptForTurnRef.current.ai.trim() ||
                committedAiOutputRef.current.trim();

              if (userText)
                setTranscripts((prev) => [
                  ...prev,
                  { id: Date.now(), speaker: "user", text: userText },
                ]);
              if (aiText)
                setTranscripts((prev) => [
                  ...prev,
                  { id: Date.now() + 1, speaker: "ai", text: aiText },
                ]);

              // reset
              committedUserInputRef.current = "";
              committedAiOutputRef.current = "";
              finalTranscriptForTurnRef.current = { user: "", ai: "" };
              setCurrentUserInput("");
              setCurrentAiOutput("");
              setStatus("listening");
            }

            const audioData =
              message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const outputCtx = outputAudioContextRef.current;
              const audioBuffer = await decodeAudioData(
                decode(audioData),
                outputCtx,
                24000,
                1
              );
              nextStartTimeRef.current = Math.max(
                nextStartTimeRef.current,
                outputCtx.currentTime
              );
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              audioSourcesRef.current.add(source);
              source.onended = () => audioSourcesRef.current.delete(source);
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error(e);
            setErrorMessage("An error occurred. Please try again.");
            setStatus("error");
            stopSession(transcripts);
          },
          onclose: () => {},
        },
      });
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "An unknown error occurred.";
      setErrorMessage(`Failed to start session: ${message}`);
      setStatus("error");
    }
  }, [selectedUseCaseId, selectedLanguageId, transcripts]);

  const stopSession = useCallback(
    async (finalTranscripts: Transcript[]) => {
      sessionPromiseRef.current?.then((session) => {
        session.close();
        sessionPromiseRef.current = null;
      });

      audioSourcesRef.current.forEach((source) => source.stop());
      audioSourcesRef.current.clear();
      scriptProcessorRef.current?.disconnect();
      mediaStreamSourceRef.current?.disconnect();
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      inputAudioContextRef.current?.close().catch(console.error);
      outputAudioContextRef.current?.close().catch(console.error);

      committedUserInputRef.current = "";
      committedAiOutputRef.current = "";
      finalTranscriptForTurnRef.current = { user: "", ai: "" };
      setCurrentUserInput("");
      setCurrentAiOutput("");

      if (finalTranscripts.length > 0) {
        setStatus("summarizing");
        try {
          const response = await fetch("/api/summarize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcripts: finalTranscripts }),
          });
          if (!response.ok)
            throw new Error(`API error: ${response.statusText}`);
          const { summary } = await response.json();
          const newRecord: ConversationRecord = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            transcripts: finalTranscripts,
            summary,
          };
          onSessionEnd(newRecord);
        } catch (error) {
          console.error("Summarization failed:", error);
          const newRecord: ConversationRecord = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            transcripts: finalTranscripts,
            summary: "Could not generate summary due to an error.",
          };
          onSessionEnd(newRecord);
        }
      }
      setStatus("idle");
    },
    [onSessionEnd]
  );

  useEffect(() => {
    return () => {
      if (status !== "idle") stopSession(transcripts);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isSessionActive =
    status === "connecting" || status === "listening" || status === "speaking";

  return (
    <>
      <main className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row gap-4">
        <SettingsPanel
          selectedUseCaseId={selectedUseCaseId}
          setSelectedUseCaseId={setSelectedUseCaseId}
          selectedLanguageId={selectedLanguageId}
          setSelectedLanguageId={setSelectedLanguageId}
          isSessionActive={isSessionActive}
        />
        <ConversationView
          transcripts={transcripts}
          currentUserInput={currentUserInput}
          currentAiOutput={currentAiOutput}
        />
      </main>
      <footer className="sticky bottom-0 bg-gray-900/80 backdrop-blur-sm p-4 border-t border-gray-700">
        <ControlPanel
          status={status}
          errorMessage={errorMessage}
          onStart={startSession}
          onStop={() => stopSession(transcripts)}
        />
      </footer>
    </>
  );
};

// Report View Components
interface ReportViewProps {
  history: ConversationRecord[];
  selectedConversation: ConversationRecord | undefined;
  setSelectedHistoryId: (id: number) => void;
}
const ReportView: React.FC<ReportViewProps> = ({
  history,
  selectedConversation,
  setSelectedHistoryId,
}) => {
  if (history.length === 0 || !selectedConversation) {
    return (
      <div className="text-center p-10 text-gray-500">
        No conversation history found. Start a new call to begin.
      </div>
    );
  }
  return (
    <main className="flex-grow container mx-auto p-4 flex flex-col lg:flex-row gap-4">
      <HistoryPanel
        history={history}
        selectedId={selectedConversation.id}
        onSelect={setSelectedHistoryId}
      />
      <div className="w-full lg:w-2/3 xl:w-3/4 flex flex-col gap-4">
        <SummaryReport summary={selectedConversation.summary} />
        <ConversationView
          transcripts={selectedConversation.transcripts}
          currentUserInput=""
          currentAiOutput=""
        />
      </div>
    </main>
  );
};

interface HistoryPanelProps {
  history: ConversationRecord[];
  selectedId: number;
  onSelect: (id: number) => void;
}
const HistoryPanel: React.FC<HistoryPanelProps> = ({
  history,
  selectedId,
  onSelect,
}) => (
  <aside className="w-full lg:w-1/3 xl:w-1/4 bg-gray-800 rounded-lg p-4 h-fit lg:h-[calc(100vh-150px)] flex flex-col">
    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-400">
      <HistoryIcon className="w-6 h-6" /> Conversation History
    </h2>
    <div className="overflow-y-auto flex-grow">
      {history.map((record) => (
        <button
          key={record.id}
          onClick={() => onSelect(record.id)}
          className={`w-full text-left p-3 rounded-md mb-2 transition-colors ${
            selectedId === record.id
              ? "bg-yellow-500 text-gray-900"
              : "bg-gray-700 hover:bg-gray-600"
          }`}
        >
          <p className="font-semibold">
            {new Date(record.timestamp).toLocaleDateString()}
          </p>
          <p className="text-sm opacity-80">
            {new Date(record.timestamp).toLocaleTimeString()}
          </p>
        </button>
      ))}
    </div>
  </aside>
);

const SummaryReport: React.FC<{ summary: string }> = ({ summary }) => (
  <div className="bg-gray-800 rounded-lg p-6">
    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-yellow-400">
      <ReportIcon className="w-6 h-6" /> Call Summary
    </h2>
    <p className="whitespace-pre-wrap text-gray-300">{summary}</p>
  </div>
);

// Shared Components
const SettingsPanel: React.FC<any> = ({
  selectedUseCaseId,
  setSelectedUseCaseId,
  selectedLanguageId,
  setSelectedLanguageId,
  isSessionActive,
}) => (
  <aside className="w-full lg:w-1/3 xl:w-1/4 bg-gray-800 rounded-lg p-6 flex flex-col gap-6 h-fit">
    <div>
      <label
        htmlFor="use-case"
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        Select Use Case
      </label>
      <select
        id="use-case"
        value={selectedUseCaseId}
        onChange={(e) => setSelectedUseCaseId(e.target.value)}
        disabled={isSessionActive}
        className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50"
      >
        {USE_CASES.map((uc: UseCase) => (
          <option key={uc.id} value={uc.id}>
            {uc.title}
          </option>
        ))}
      </select>
    </div>
    {/* <div>
      <label
        htmlFor="language"
        className="block text-sm font-medium text-gray-300 mb-2"
      >
        Select Language
      </label>
      <select
        id="language"
        value={selectedLanguageId}
        onChange={(e) => setSelectedLanguageId(e.target.value)}
        disabled={isSessionActive}
        className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500 disabled:opacity-50"
      >
        {LANGUAGES.map((lang: Language) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>
    </div> */}
  </aside>
);

const ConversationView: React.FC<any> = ({
  transcripts,
  currentUserInput,
  currentAiOutput,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [transcripts, currentUserInput, currentAiOutput]);
  return (
    <section
      ref={scrollRef}
      className="w-full lg:w-2/3 xl:w-3/4 bg-gray-800 rounded-lg p-4 lg:p-6 flex-grow flex flex-col gap-4 h-96 lg:h-auto overflow-y-auto"
    >
      {transcripts.map((t: Transcript) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 ${
            t.speaker === "user" ? "justify-end" : ""
          }`}
        >
          {t.speaker === "ai" && (
            <div className="bg-yellow-500 p-2 rounded-full">
              <AgentIcon className="w-6 h-6 text-gray-900" />
            </div>
          )}
          <p
            className={`max-w-xl rounded-2xl px-4 py-3 ${
              t.speaker === "user"
                ? "bg-blue-600 rounded-br-none"
                : "bg-gray-700 rounded-bl-none"
            }`}
          >
            {t.text}
          </p>
          {t.speaker === "user" && (
            <div className="bg-gray-600 p-2 rounded-full">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      ))}
      {currentUserInput && (
        <div className="flex items-start gap-3 justify-end">
          <p className="max-w-xl rounded-2xl px-4 py-3 bg-blue-600 rounded-br-none opacity-70">
            {currentUserInput}
          </p>
          <div className="bg-gray-600 p-2 rounded-full">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
        </div>
      )}
      {currentAiOutput && (
        <div className="flex items-start gap-3">
          <div className="bg-yellow-500 p-2 rounded-full">
            <AgentIcon className="w-6 h-6 text-gray-900" />
          </div>
          <p className="max-w-xl rounded-2xl px-4 py-3 bg-gray-700 rounded-bl-none opacity-70">
            {currentAiOutput}
          </p>
        </div>
      )}
      {transcripts.length === 0 && !currentUserInput && !currentAiOutput && (
        <div className="m-auto text-center text-gray-500">
          <p className="text-lg">Conversation will appear here...</p>
          <p>Select a use case and language, then press Start.</p>
        </div>
      )}
    </section>
  );
};

const ControlPanel: React.FC<any> = ({
  status,
  errorMessage,
  onStart,
  onStop,
}) => {
  const isSessionActive =
    status === "connecting" || status === "listening" || status === "speaking";
  const statusMessages: Record<Status, string> = {
    idle: "Ready to start conversation",
    connecting: "Connecting to AI Agent...",
    listening: "Listening... please speak now.",
    speaking: "AI Agent is speaking...",
    summarizing: "Generating call summary...",
    error: "An error occurred",
  };
  const statusColors: Record<Status, string> = {
    idle: "text-gray-400",
    connecting: "text-yellow-400 animate-pulse",
    listening: "text-green-400",
    speaking: "text-blue-400",
    summarizing: "text-purple-400 animate-pulse",
    error: "text-red-500",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`text-sm font-medium h-5 ${statusColors[status]}`}>
        {status === "error" ? errorMessage : statusMessages[status]}
      </div>
      <button
        onClick={isSessionActive ? onStop : onStart}
        disabled={status === "summarizing" || status === "connecting"}
        className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed ${
          isSessionActive
            ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
            : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
        }`}
      >
        {isSessionActive ? (
          <StopIcon className="w-10 h-10 text-white" />
        ) : (
          <MicrophoneIcon className="w-10 h-10 text-white" />
        )}
      </button>
    </div>
  );
};
