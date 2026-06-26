/**
 * Helper to parse reimbursement descriptions.
 * Handles both plain text (legacy/direct-seed database entries) and JSON serialized descriptions.
 */
export const parseDescription = (rawDescription) => {
  const defaultParsed = {
    text: rawDescription || 'No description provided.',
    category: 'Others',
    date: 'N/A',
    receiptUrl: null,
    isParsed: false
  };

  if (!rawDescription) return defaultParsed;

  try {
    const parsed = JSON.parse(rawDescription);
    if (parsed && typeof parsed === 'object') {
      return {
        text: parsed.text || 'No description provided.',
        category: parsed.category || 'Others',
        date: parsed.date || 'N/A',
        receiptUrl: parsed.receiptUrl || null,
        isParsed: true
      };
    }
  } catch (e) {
    // Description is plain text, return as-is
  }

  return defaultParsed;
};
