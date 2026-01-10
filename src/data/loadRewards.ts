import { Reward } from '../types/index';

let rewardsCache: Map<string, Reward[]> | null = null;

export async function parseRewardsCsv(): Promise<Map<string, Reward[]>> {
  if (rewardsCache) {
    return rewardsCache;
  }

  try {
    const response = await fetch('/ExpeditionRewardTypes.csv');
    const csv = await response.text();
    
    const lines = csv.trim().split('\n');
    const rewards = new Map<string, Reward[]>();

    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Parse CSV line (handle quoted fields)
      const parts: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          parts.push(current.trim().replace(/^"|"$/g, ''));
          current = '';
        } else {
          current += char;
        }
      }
      parts.push(current.trim().replace(/^"|"$/g, ''));

      if (parts.length >= 4) {
        const expedition = parts[0];
        const reward: Reward = {
          name: parts[1],
          type: parts[2],
          subtype: parts[3],
        };

        if (!rewards.has(expedition)) {
          rewards.set(expedition, []);
        }
        rewards.get(expedition)!.push(reward);
      }
    }

    rewardsCache = rewards;
    return rewards;
  } catch (error) {
    console.error('Error loading rewards CSV:', error);
    return new Map();
  }
}
