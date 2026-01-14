/**
 * Generic CSV parser
 * Converts CSV text into array of objects
 * Handles quoted fields and newlines within fields
 */

export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  // Parse header
  const header = parseCSVLine(lines[0]);

  // Parse data rows
  const rows: Record<string, string>[] = [];
  let i = 1;

  while (i < lines.length) {
    const line = lines[i];
    
    // Handle multi-line quoted fields
    let fullLine = line;
    let quoteCount = (line.match(/"/g) || []).length;
    
    while (quoteCount % 2 !== 0 && i + 1 < lines.length) {
      i++;
      fullLine += '\n' + lines[i];
      quoteCount = (fullLine.match(/"/g) || []).length;
    }

    const values = parseCSVLine(fullLine);
    const row: Record<string, string> = {};

    header.forEach((key, idx) => {
      row[key] = values[idx] || '';
    });

    rows.push(row);
    i++;
  }

  return rows;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}
