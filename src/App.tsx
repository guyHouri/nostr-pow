import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { calculatePoW } from './utils/pow'; // Import the PoW calculation utility
// @ts-ignore

interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
}

interface NostrNote extends NostrEvent {
  pow: number;
}

interface NostrMetadata {
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  nip05?: string;
  lud16?: string;
}

// Main App component for the Nostr PoW Client
const App = () => {
  const [notes, setNotes] = useState<NostrNote[]>([]);
  const [sockets, setSockets] = useState<WebSocket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const relays: string[] = [
    'wss://relay.damus.io',
    'wss://nostr.wine',
    'wss://nos.lol',
  ];

  // Effect hook to establish WebSocket connections and subscribe to notes
  useEffect(() => {
    const newSockets: WebSocket[] = [];
    // Using a Set to keep track of seen event IDs to prevent duplicates from multiple relays
    const seenEventIds: Set<string> = new Set();

    // Function to handle incoming Nostr events
    const handleEvent = (event: NostrEvent) => {
      // Ensure it's a 'kind 1' (text note) event and we haven't seen it before
      if (event.kind === 1 && event.id && !seenEventIds.has(event.id)) {
        seenEventIds.add(event.id); // Mark as seen
        const pow = calculatePoW(event.id); // Calculate PoW
        // Update notes state, sorting by PoW in descending order
        setNotes((prevNotes) => {
          const updatedNotes = [...prevNotes, { ...event, pow }];
          // Sort by PoW (descending)
          return updatedNotes.sort((a, b) => b.pow - a.pow);
        });
      }
    };

    // Loop through each relay and establish a WebSocket connection
    relays.forEach((relayUrl) => {
      try {
        const ws = new WebSocket(relayUrl);
        newSockets.push(ws); // Add to our list of active sockets

        ws.onopen = () => {
          console.log(`Connected to ${relayUrl}`);
          setIsLoading(false); // Once at least one connects, stop loading
          // Subscribe to 'kind 1' (text notes) events
          // Using a random subscription ID to avoid conflicts
          ws.send(
            JSON.stringify([
              'REQ',
              `sub-${Date.now()}`,
              { kinds: [1], limit: 50 },
            ]),
          );
        };

        ws.onmessage = (event) => {
          try {
            const data: [string, string, NostrEvent] = JSON.parse(event.data);
            // Handle incoming 'EVENT' messages
            if (data[0] === 'EVENT') {
              handleEvent(data[2]);
            }
          } catch (parseError) {
            console.error('Failed to parse WebSocket message:', parseError);
          }
        };

        ws.onerror = (err) => {
          console.error(`WebSocket error on ${relayUrl}:`, err);
          setError(
            `Failed to connect to one or more relays. Please try again later. Ensure public relays are accessible.`,
          );
        };

        ws.onclose = () => {
          console.log(`Disconnected from ${relayUrl}`);
        };
      } catch (e) {
        console.error(`Failed to create WebSocket for ${relayUrl}:`, e);
        setError(
          `Failed to create WebSocket connection. Please check your network or try again.`,
        );
      }
    });

    // Store the active sockets in state
    setSockets(newSockets);

    // Cleanup function: close all WebSocket connections when the component unmounts
    return () => {
      newSockets.forEach((ws) => {
        if (
          ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING
        ) {
          ws.close();
        }
      });
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // Helper to extract a human-readable name from the event's 'content' or 'pubkey'
  const getAuthorName = useCallback((event: NostrEvent): string => {
    try {
      // Try to parse metadata if it's a kind 0 event (profile metadata)
      if (event.kind === 0 && event.content) {
        const metadata: NostrMetadata = JSON.parse(event.content);
        return (
          metadata.display_name || metadata.name || event.pubkey.substring(0, 8)
        );
      }
      // For kind 1 notes, just use the pubkey for simplicity
      return event.pubkey.substring(0, 8); // Shortened public key
    } catch (e) {
      return event.pubkey.substring(0, 8); // Fallback to shortened public key
    }
  }, []);

  return (
    <div className="font-inter min-h-screen bg-gray-900 p-4 text-gray-100 sm:p-6 md:p-8">
      {/* Removed inline style tag and converted to Tailwind classes */}
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <script src="https://cdn.tailwindcss.com"></script>

      <header className="mb-8 text-center">
        <h1 className="mb-2 flex items-center justify-center text-4xl font-bold text-yellow-500 sm:text-5xl">
          Nostr PoW Client
          {/* Bitcoin icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="ml-4 h-10 w-10 text-yellow-500"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-1.5 1.5a.75.75 0 1 0 1.06 1.06L11.75 9.81V15a.75.75 0 0 0 1.5 0V9.81l.72.72a.75.75 0 0 0 1.06-1.06l-1.5-1.5Z"
              clipRule="evenodd"
            />
          </svg>
        </h1>
        <p className="text-lg text-gray-400">
          Notes sorted by Proof-of-Work difficulty
          <span className="ml-2 font-semibold text-yellow-400">
            — Powered by Bitcoin's Principles
          </span>
        </p>
      </header>

      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <p className="text-xl text-purple-300">
            Connecting to Nostr relays and fetching notes...
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-700 p-4 text-center text-white">
          <p>{error}</p>
          <p className="mt-2 text-sm">
            Please ensure you have an active internet connection and public
            relays are accessible.
          </p>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        {notes.length === 0 && !isLoading && !error && (
          <div className="mt-10 text-center text-xl text-gray-500">
            No notes found yet. Waiting for events from relays...
          </div>
        )}

        {notes.map((note) => (
          <div
            key={note.id}
            className="mb-4 rounded-xl bg-gray-800 p-6 shadow-md transition-transform duration-200 ease-in-out hover:translate-y-[-3px]"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-purple-300 sm:text-base">
                Author: {getAuthorName(note)}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-yellow-600 px-3 py-1 text-xs font-semibold text-white">
                {/* Small Bitcoin symbol next to PoW */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4 text-white"
                >
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-1.5 1.5a.75.75 0 1 0 1.06 1.06L11.75 9.81V15a.75.75 0 0 0 1.5 0V9.81l.72.72a.75.75 0 0 0 1.06-1.06l-1.5-1.5Z"
                    clipRule="evenodd"
                  />
                </svg>
                PoW: {note.pow}
              </span>
            </div>
            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap text-gray-200 sm:text-base">
              {note.content}
            </p>
            <div className="mt-3 text-right text-xs text-gray-500">
              {new Date(note.created_at * 1000).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
