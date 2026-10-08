/**
 * @desc    Scan a bill image and extract transaction data using Gemini Vision
 * @route   POST /api/bill-scan
 * @access  Private
 *
 * Uses the Gemini REST API directly (v1 endpoint) to support AQ.-style keys
 * from Google AI Studio.
 */
export const scanBill = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: 'Gemini API key not configured on server' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const prompt = `You are a bill/receipt OCR parser. Analyze this bill or receipt image and extract the following information.

Return ONLY a valid JSON object (no markdown, no explanation) with these exact fields:
{
  "amount": <number, the total amount paid, e.g. 250.00>,
  "description": "<short description of what was purchased, e.g. 'Groceries at BigMart'>",
  "category": "<one of: food, transport, housing, utilities, entertainment, healthcare, education, shopping, other>",
  "date": "<date in YYYY-MM-DD format, use today if not visible>",
  "type": "expense",
  "merchant": "<merchant/store name if visible, else empty string>"
}

Rules:
- amount must be a positive number (just the digits, no currency symbols)
- category must be exactly one of the allowed values
- date must be in YYYY-MM-DD format
- If you cannot determine a field, use a reasonable default
- Today's date is ${new Date().toISOString().split('T')[0]}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    // Try models in order — error messages told us the correct names
    const modelsToTry = [
      'gemini-3.8-flash',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
    ];

    // Only use v1 � confirmed working API version for this key
    const apiVersions = ['v1'];

    let text = null;
    let lastError = null;

    outerLoop:
    for (const apiVersion of apiVersions) {
      for (const modelName of modelsToTry) {
        const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errBody = await response.json().catch(() => ({}));
            const errMsg = errBody?.error?.message || response.statusText;
            console.warn(`⚠️ [${apiVersion}] ${modelName}: ${errMsg}`);
            lastError = new Error(errMsg);
            continue;
          }

          const data = await response.json();
          text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            console.log(`✅ Bill scanned with [${apiVersion}] ${modelName}`);
            break outerLoop;
          }
        } catch (fetchErr) {
          console.warn(`⚠️ [${apiVersion}] ${modelName}: ${fetchErr.message}`);
          lastError = fetchErr;
        }
      }
    }

    if (!text) {
      throw lastError || new Error('All Gemini models failed. Check your API key.');
    }

    // Strip markdown code fences if present
    const jsonStr = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```\s*$/i, '')
      .trim();

    let extracted;
    try {
      extracted = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('Gemini raw response:', text);
      return res.status(422).json({
        message: 'Could not parse data from bill. Please try a clearer image.',
        raw: text,
      });
    }

    const VALID_CATEGORIES = [
      'salary', 'freelance', 'investments', 'food', 'transport',
      'housing', 'utilities', 'entertainment', 'healthcare',
      'education', 'shopping', 'other',
    ];

    const sanitized = {
      type: 'expense',
      amount: parseFloat(extracted.amount) || 0,
      description: String(extracted.description || extracted.merchant || 'Bill scan').slice(0, 200),
      category: VALID_CATEGORIES.includes(extracted.category) ? extracted.category : 'other',
      date: /^\d{4}-\d{2}-\d{2}$/.test(extracted.date)
        ? extracted.date
        : new Date().toISOString().split('T')[0],
    };

    if (sanitized.amount <= 0) {
      return res.status(422).json({ message: 'Could not detect a valid amount from the bill.' });
    }

    res.json({ success: true, data: sanitized });
  } catch (error) {
    console.error('Bill scan error:', error.message);
    res.status(500).json({ message: error.message || 'Failed to scan bill' });
  }
};
