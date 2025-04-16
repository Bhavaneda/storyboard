// Import necessary modules from Remotion
import { Composition, Img, staticFile } from 'remotion';
import { useEffect, useState } from 'react';

// Storyboard with placeholders for personalized data
const storyboard = [
  {
    text: "Congratulations, {customer_name}!",
    fontSize: 100,
    color: "black",
    voice: "Congratulations, {customer_name}!",
  },
  {
    text: "We’ve got some exciting news just for you!",
    fontSize: 80,
    color: "blue",
    voice: "We’ve got some exciting news just for you!",
  },
  {
    text: "Your home loan for ₹{loan_amount} has been approved!",
    fontSize: 90,
    color: "green",
    voice: "Your home loan for ₹{loan_amount} has been approved!",
  },
  {
    text: "{agent_name}, your loan advisor, is here to guide you every step of the way.",
    fontSize: 80,
    color: "darkred",
    voice: "{agent_name}, your loan advisor, is here to guide you every step of the way.",
  },
  {
    text: "We’re so proud to be part of this milestone in your life.",
    fontSize: 70,
    color: "orange",
    voice: "We’re so proud to be part of this milestone in your life.",
  },
  {
    text: "Click below to view your documents and next steps.",
    fontSize: 60,
    color: "purple",
    voice: "Click below to view your documents and next steps.",
  }
];

// Helper function to generate personalized text image using Remotion's components
const generateTextImage = (text: string, fontSize: number, color: string) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      backgroundColor: 'white',
    }}>
      <h1 style={{
        fontSize: fontSize,
        color: color,
        fontWeight: 'bold',
        textAlign: 'center',
      }}>
        {text}
      </h1>
    </div>
  );
};

// TTS Voiceover Function (using pyttsx3 or any other TTS API)
const textToSpeech = (text: string, filename: string) => {
  const engine = pyttsx3.init();
  engine.save_to_file(text, filename);
  engine.runAndWait();
};

export const Video = ({ customerName, loanAmount, agentName }) => {
  const [scenes, setScenes] = useState([]);

  useEffect(() => {
    const videoScenes = storyboard.map((scene, idx) => {
      const personalizedText = scene.text.replace("{customer_name}", customerName).replace("{loan_amount}", loanAmount).replace("{agent_name}", agentName);
      const voiceoverText = scene.voice.replace("{customer_name}", customerName).replace("{loan_amount}", loanAmount).replace("{agent_name}", agentName);

      const voiceoverFile = `voiceover_${idx}.mp3`;

      // Generate text image
      const textImage = generateTextImage(personalizedText, scene.fontSize, scene.color);

      // Generate TTS voiceover file for the scene
      textToSpeech(voiceoverText, voiceoverFile);

      // Create and return a Remotion composition for each scene
      return (
        <Composition
          key={idx}
          id={`scene-${idx}`}
          component={() => textImage}
          durationInFrames={150} // Duration of each scene
          fps={30}
          width={1920}
          height={1080}
        />
      );
    });

    setScenes(videoScenes);
  }, [customerName, loanAmount, agentName]);

  return <>{scenes}</>;
};

