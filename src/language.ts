import language from '@google-cloud/language';

export const languageClient = new language.LanguageServiceClient();

export interface GetWordResult {
  name: string;
  salience?: number;
}

export const getWords = async (content: string): Promise<GetWordResult[]> => {
  const [{ entities }] = await languageClient.analyzeEntities({
    document: {
      content,
      language: 'it',
      type: 'PLAIN_TEXT',
    },
  });

  return (entities || [])
    .sort((a, b) => (b.salience ?? 0) - (a.salience ?? 0))
    .slice(0, 3)
    .map(({ name, salience }) => ({
      name: name!.toLowerCase(),
      salience: salience ?? undefined,
    }));
};
