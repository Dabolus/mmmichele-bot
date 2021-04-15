import language from '@google-cloud/language';

export const languageClient = new language.LanguageServiceClient();

export interface GetWordResult {
  name: string;
  salience?: number;
}

export const getWord = async (
  content: string,
): Promise<GetWordResult | null> => {
  const [{ entities }] = await languageClient.analyzeEntities({
    document: {
      content,
      language: 'it',
      type: 'PLAIN_TEXT',
    },
  });

  if (!entities?.[0]?.name) {
    return null;
  }

  const [{ name, salience }] = entities;

  return {
    name: name.toLowerCase(),
    salience: salience || undefined,
  };
};
