const punctuationRegex = new RegExp(
  /[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+]/g,
);

export interface GetWordResult {
  name: string;
  salience?: number;
}

export interface WordMatch {
  readonly word: string;
  readonly count: number;
}

export const getWords = async (content: string): Promise<GetWordResult[]> => {
  const words = content
    .replace(/\r?\n|\r/g, ' ')
    .replace(punctuationRegex, ' ')
    .replace(/\s{2,}/g, ' ')
    .split(' ')
    .filter((word) => word.length > 3);

  const wordMatchCounts = words.reduce<readonly WordMatch[]>(
    (matches, word) => {
      const isAlreadyMatched = matches.findIndex(
        ({ word: foundWord }) => `${foundWord}` === `${word}`,
      );

      return isAlreadyMatched > -1
        ? [
            ...matches.slice(0, isAlreadyMatched),
            { word, count: matches[isAlreadyMatched].count + 1 },
            ...matches.slice(isAlreadyMatched + 1),
          ]
        : [...matches, { word, count: 1 }];
    },
    [],
  );

  return wordMatchCounts.map(({ word: name, count }) => ({
    name,
    salience: count / wordMatchCounts.length,
  }));
};
