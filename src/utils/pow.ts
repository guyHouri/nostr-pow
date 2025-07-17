// Helper function to convert a hexadecimal string to its binary representation
// This is crucial for counting leading zero bits for Proof-of-Work.
const hexToBinary = (hex: string): string => {
  let binary = '';
  for (let i = 0; i < hex.length; i++) {
    // Convert each hex character to its 4-bit binary equivalent
    binary += parseInt(hex[i], 16).toString(2).padStart(4, '0');
  }
  return binary;
};

// Function to calculate Proof-of-Work (PoW) for a Nostr event ID
// PoW is defined as the number of leading zero bits in the event ID's binary representation.
export const calculatePoW = (eventId: string): number => {
  const binaryId = hexToBinary(eventId);
  let leadingZeros = 0;
  for (let i = 0; i < binaryId.length; i++) {
    if (binaryId[i] === '0') {
      leadingZeros++;
    } else {
      break; // Stop counting once a '1' is encountered
    }
  }
  return leadingZeros;
};
