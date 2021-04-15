import {
  getText,
  sendMessage,
  setChatDescription,
  setChatPhoto,
  setChatTitle,
} from './telegram';
import { initialize } from './cache';
import { getWords } from './language';
import { getImage } from './search';

const run = async () => {
  console.log('Initializing cache');
  await initialize();

  // Get the text composed by all the messages received until previous update
  console.log('Getting the text from the received messages');
  const text = await getText();

  if (!text) {
    console.log('No text detected');
    return;
  }

  console.log(`Text: ${text}`);

  console.log('Getting the most salient word');
  const words = await getWords(text);

  if (words.length < 1) {
    console.log('No salient words detected');
    await sendMessage(`Sembra che oggi non abbiate shitpostato 🤔`);
    return;
  }

  console.log(
    `Words: ${words
      .map(
        ({ name, salience }) =>
          `${name}${salience ? ` (salience: ${salience})` : ''}`,
      )
      .join(', ')}`,
  );

  const [mainWord, ...otherWords] = words;

  console.log('Sending info message');
  await sendMessage(
    `Oggi avete shitpostato su: ${mainWord.name}${
      mainWord.salience
        ? ` (rilevanza: ${(mainWord.salience * 100).toFixed(2)}%)`
        : ''
    }`,
  );
  await sendMessage(
    `Altre parole rilevanti:\n${otherWords
      .map(
        (word) =>
          `- ${word.name}${
            word.salience
              ? ` (rilevanza: ${(word.salience * 100).toFixed(2)}%)`
              : ''
          }`,
      )
      .join('\n')}`,
  );

  console.log('Setting chat title');
  await setChatTitle(
    `${mainWord.name[0].toUpperCase()}${mainWord.name
      .slice(1)
      .toLowerCase()} shitposting`,
  );
  await setChatDescription(`Oggi stiamo shitpostando su: ${mainWord.name}`);

  console.log('Getting the image');
  const image = await getImage(mainWord.name);

  if (!image) {
    console.log('No image found');
    await sendMessage(
      "Non ho trovato nessuna immagine correlata all'argomento",
    );
    return;
  }

  console.log('Setting the chat profile picture');
  await setChatPhoto(image);

  console.log('Done');
};

run();
