const gTTS = require('gtts'); // You can use gTTS or any other text-to-speech library
const path = require('path');
const fs = require('fs');

async function generateAudio(text, idx) {
  const audioFileName = `voiceover_${idx}.mp3`;  // Updated format
  const audioPath = path.join(__dirname, 'public', 'audio', audioFileName);

  return new Promise((resolve, reject) => {
    const gtts = new gTTS(text, 'en');
    gtts.save(audioPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(audioFileName);  // Return the filename
      }
    });
  });
}

module.exports = { generateAudio };
