import {
  getText,
  sendMessage,
  setChatDescription,
  setChatPhoto,
  setChatTitle,
} from './telegram';
import { initialize } from './cache';
import { getWord } from './language';
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

  // Use Google Cloud Natural Language API to get the most salient word from the text
  console.log('Getting the most salient word');
  const word = await getWord(text);

  if (!word) {
    console.log('No salient words detected');
    await sendMessage(`Sembra che oggi non abbiate shitpostato 🤔`);
    return;
  }

  console.log(`Word: ${word.name}`);
  if (word.salience) {
    console.log(`Salience: ${word.salience}`);
  }

  console.log('Sending message');
  await sendMessage(
    `Oggi avete shitpostato su: ${word.name}${
      word.salience ? ` (rilevanza: ${(word.salience * 100).toFixed(2)}%)` : ''
    }`,
  );

  console.log('Setting chat title');
  await setChatTitle(
    `${word.name[0].toUpperCase()}${word.name
      .slice(1)
      .toLowerCase()} shitposting`,
  );
  await setChatDescription(`Oggi stiamo shitpostando su: ${word.name}`);

  console.log('Getting the image');
  const image = await getImage(word.name);

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
