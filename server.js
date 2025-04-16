const express = require('express');
const fs = require('fs');
const path = require('path');
const gTTS = require('gtts');  // Import gTTS
const app = express();
const port = 3001;

// Define the 'public/audio' directory to store audio files
const audioDirectory = path.join(__dirname, 'public', 'audio');

// Ensure the audio directory exists, or create it if it doesn't
if (!fs.existsSync(audioDirectory)) {
  fs.mkdirSync(audioDirectory, { recursive: true });
}

// Serve the generated audio files from the 'public/audio' folder
app.use('/audio', express.static(audioDirectory));

app.get('/generate-audio', async (req, res) => {
  const { text, index } = req.query;

  // Validate input parameters
  if (!text || index === undefined) {
    return res.status(400).send('Text and index are required');
  }

  try {
    // Create a gTTS instance with the provided text and language (English)
    const gtts = new gTTS(text, 'en');

    // Define the audio file path within the 'public/audio' directory
    const audioFilePath = path.join(audioDirectory, `voiceover_${index}.mp3`);

    // Save the audio file to the local file system
    gtts.save(audioFilePath, function (err, result) {
      if (err) {
        console.error('Error saving audio:', err);
        return res.status(500).send('Error generating audio');
      }

      res.send(`Audio file saved at ${audioFilePath}`);
    });
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).send('Error generating audio');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
