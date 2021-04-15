import fetch from 'node-fetch';
import FormData from 'form-data';
import { get, set } from './cache';
import type { Update } from 'node-telegram-bot-api';

const {
  env: {
    TELEGRAM_BOT_TOKEN: telegramBotToken = '',
    TELEGRAM_CHAT_ID: rawTelegramChatId,
  },
} = process;

const telegramChatId = Number(rawTelegramChatId);

export interface Image {
  content: NodeJS.ReadableStream;
  contentType: string;
  filename: string;
  filepath: string;
  knownLength: number;
}

const isImage = (param: any): param is Image =>
  typeof param === 'object' && 'content' in param;

const getFormDataAppendParams = (
  key: string,
  value: any,
): Parameters<typeof FormData['prototype']['append']> => {
  if (isImage(value)) {
    const { content, ...options } = value;
    return [key, content, options];
  }

  if (typeof value === 'object' && value !== null) {
    return [key, JSON.stringify(value)];
  }

  return [key, value];
};

const getFormData = (params?: Record<string, any>) => {
  if (!params || Object.keys(params).length < 1) {
    return;
  }

  const formData = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(...getFormDataAppendParams(key, value));
  });

  return formData;
};

const makeRequest = async (method: string, params?: Record<string, any>) => {
  const res = await fetch(
    `https://api.telegram.org/bot${telegramBotToken}/${method}`,
    {
      method: 'POST',
      body: getFormData(params),
    },
  );

  const { ok, result, description } = await res.json();

  if (!ok) {
    throw new Error(description);
  }

  return result;
};

const getAllUpdates = async (
  offset?: number,
  currentUpdates: Update[] = [],
): Promise<Update[]> => {
  const actualOffset = offset || (await get<number>('offset')) || 0;

  const newUpdates: Update[] = await makeRequest('getUpdates', {
    allowed_updates: ['message'],
    offset: actualOffset + 1,
  });

  const filteredUpdates = newUpdates.filter(
    ({ message }) => telegramChatId === message?.chat.id,
  );

  if (filteredUpdates.length < 1) {
    return currentUpdates;
  }

  const latestOffset = filteredUpdates.reduce(
    (highest, { update_id }) => Math.max(highest, update_id),
    0,
  );

  await set('offset', latestOffset);

  return getAllUpdates(latestOffset, [...currentUpdates, ...filteredUpdates]);
};

export const getText = async (): Promise<string> => {
  const updates = await getAllUpdates();

  return updates
    .map(({ message: { text = '' } = {} }) => text.trim())
    .filter(Boolean)
    .join('\n');
};

export const sendMessage = async (text: string): Promise<void> => {
  await makeRequest('sendMessage', {
    chat_id: telegramChatId,
    text,
  });
};

export const setChatTitle = async (title: string): Promise<void> => {
  await makeRequest('setChatTitle', {
    chat_id: telegramChatId,
    title,
  });
};

export const setChatDescription = async (
  description: string,
): Promise<void> => {
  await makeRequest('setChatDescription', {
    chat_id: telegramChatId,
    description,
  });
};

export const setChatPhoto = async (photo: Image): Promise<void> => {
  await makeRequest('setChatPhoto', {
    chat_id: telegramChatId,
    photo,
  });
};
