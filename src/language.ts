import exclusions from './exclusions.yaml';

export interface GetWordResult {
  name: string;
  count: number;
}

export const getWords = async (content: string): Promise<GetWordResult[]> => {
  const wordsScoring = content
    // Remove all non word or space characters
    .replace(/[^a-zA-ZÀ-ÖÙ-öù-ÿĀ-žḀ-ỿ0-9ø\s]/g, '')
    // Split on spaces to get an array with all the words
    .split(/\s+/)
    // Normalize the words
    .map(word => word.toLowerCase().trim())
    // Make sure we don't include empty or excluded words
    .filter(word => !!word && word.length > 2 && !exclusions.includes(word))
    // Compute the scores
    .reduce<Record<string, number>>(
      (acc, word) => ({
        ...acc,
        [word]: (acc[word] || 0) + 1,
      }),
      {},
    );

  return Object.entries(wordsScoring)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);
};
