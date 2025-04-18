const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const gTTS = require('gtts');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000'
}));
app.use(bodyParser.json());

const port = 3001;
const audioDirectory = path.join(__dirname, 'public', 'audio');

if (!fs.existsSync(audioDirectory)) {
  fs.mkdirSync(audioDirectory, { recursive: true });
}

app.use('/audio', express.static(path.join(__dirname, 'public', 'audio')));

app.get('/generate-audio', async (req, res) => {
  const { text, index } = req.query;

  if (!text || index === undefined) {
    return res.status(400).send('Text and index are required');
  }

  try {
    const gtts = new gTTS(text, 'en');
    const audioFilePath = path.join(audioDirectory, `voiceover_${index}.mp3`);

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


// ✅✅✅ NEW: Refine Transcript API (Mistral)
const GROQ_API_KEY = "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";
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

app.post('/refine-transcript', async (req, res) => {
  const sceneTexts = req.body.sceneTexts;

  if (!sceneTexts || sceneTexts.length === 0) {
    return res.status(400).json({ error: 'No scene texts provided' });
  }

  const prompt = `
Combine the following scene texts into a natural, human-readable video transcript.
Make it flow naturally, combining related ideas into complete sentences and paragraphs:

${sceneTexts.join('\n')}
`;

  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model: 'mistral-saba-24b',
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0.5
      },
      {
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const refinedTranscript = response.data.choices[0].message.content;
    res.json({ transcript: refinedTranscript });

  } catch (error) {
    console.error('Transcript generation error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate transcript' });
  }
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
