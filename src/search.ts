import { customsearch } from '@googleapis/customsearch';
import fetch from 'node-fetch';
import path from 'path';
import { Image } from './telegram';

const {
  env: { GOOGLE_CUSTOM_SEARCH_API_KEY: auth, GOOGLE_CUSTOM_SEARCH_CX: cx },
} = process;

const customSearchClient = customsearch({
  version: 'v1',
  auth,
});

export const getImage = async (term: string): Promise<Image | null> => {
  const {
    data: { items: [{ link, mime, image }] = [] },
  } = await customSearchClient.cse.list({
    searchType: 'image',
    num: 1,
    q: term,
    cx,
  });

  if (!link || !mime || !image?.byteSize) {
    return null;
  }

  const res = await fetch(link);

  if (!res.ok) {
    return null;
  }

  return {
    content: res.body,
    contentType: mime,
    filename: path.basename(link),
    filepath: link,
    knownLength: image.byteSize,
  };
};
