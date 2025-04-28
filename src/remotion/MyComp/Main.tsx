import {
  AbsoluteFill,
  Sequence,
  Audio,
  useVideoConfig,
  Img,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { useEffect, useState } from "react";
import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";
import { getAudioDurationInSeconds } from "@remotion/media-utils";
import { storyboardTemplate } from "../constants/storyboard";

const CTAButton = ({ text = "Learn More", url = "https://google.com" }) => {
  const frame = useCurrentFrame();
  const startFrame = 25;
  const visibleFrame = startFrame + 10;

  const pulseScale = interpolate(frame % 30, [0, 15, 30], [1, 1.05, 1], {
    extrapolateRight: "clamp",
  });

  const glowIntensity = interpolate(frame % 60, [0, 30, 60], [0, 8, 0], {
    extrapolateRight: "clamp",
  });

  const opacity = interpolate(frame, [startFrame, visibleFrame], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(frame, [startFrame, visibleFrame], [50, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${pulseScale})`,
        padding: "12px 24px",
        backgroundColor: "#4285f4",
        color: "white",
        fontFamily: "Inter, sans-serif",
        fontSize: "24px",
        fontWeight: "bold",
        borderRadius: "8px",
        cursor: "pointer",
        textDecoration: "none",
        boxShadow: `0 0 ${glowIntensity}px #4285f4`,
        transition: "all 0.3s ease",
        border: "2px solid rgba(255, 255, 255, 0.7)",
        textShadow: "0px 1px 2px rgba(0,0,0,0.3)",
        marginTop: "20px",
      }}
    >
      {text}
    </a>
  );
};

const Scene = ({
  idx,
  text,
  color,
  fontSize,
  image,
  isLast = false,
}: {
  idx: number;
  text: string;
  color: string;
  fontSize: number;
  image: string;
  isLast?: boolean;
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, 20], [0.95, 1], {
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={image}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
          pointerEvents: "none",
        }}
      />
      <div
        className="absolute inset-0 flex flex-col justify-end items-center px-10"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
          overflow: "visible",
          transformOrigin: "bottom center",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255,255,255,0.85)",
            borderRadius: "16px",
            padding: "24px 32px",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
            transform: `scale(${scale})`,
            transition: "all 0.3s ease-in-out",
            maxWidth: "80%",
            textAlign: "center",
            marginBottom: "135px",
            zIndex: 10,
          }}
        >
          <h1
            style={{
              fontSize,
              color,
              fontFamily,
              fontWeight: 700,
              textShadow: "1px 1px 2px rgba(0,0,0,0.25)",
              lineHeight: 1.3,
            }}
          >
            {text}
          </h1>

          {isLast && (
            <div style={{ marginTop: "24px" }}>
              <CTAButton text="View Documents" url="https://www.wellsfargo.com/" />
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const waitForAudio = async (url: string, retries = 10, delay = 500): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return true;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, delay));
  }
  return false;
};

const loadAudioFiles = async () => {
  const audioFiles: string[] = [];

  for (let index = 0; index < storyboardTemplate.length; index++) {
    const scene = storyboardTemplate[index];

    try {
      const generateResponse = await fetch(
        `http://localhost:3005/generate-audio?text=${encodeURIComponent(scene.text)}&index=${index}`
      );

      if (!generateResponse.ok) continue;

      const audioUrl = `http://localhost:3005/audio/voiceover_${index}.mp3`;

      const isReady = await waitForAudio(audioUrl);
      if (isReady) {
        audioFiles.push(audioUrl);
      }
    } catch (error) {
      console.error(`Error processing audio for scene ${index}:`, error);
    }
  }

  return audioFiles;
};


const loadDurations = async (audioUrls: string[], fps: number) => {
  const scenesWithDuration = await Promise.all(
    storyboardTemplate.map(async (scene, index) => {
      try {
        const audioUrl = audioUrls[index];
        const seconds = await getAudioDurationInSeconds(audioUrl);
        const durationInFrames = Math.ceil(seconds * fps);

        return {
          ...scene,
          duration: durationInFrames,
          audioUrl,
        };
      } catch (error: any) {
        console.error(`Error loading duration for scene ${index}: ${error.message}`);
        return null;
      }
    })
  );

  return scenesWithDuration.filter(Boolean);
};

export const Main: React.FC = () => {
  const { fps } = useVideoConfig();
  const [showTranscript, setShowTranscript] = useState(false);
  const [scenes, setScenes] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadAssets = async () => {
      const audioUrls = await loadAudioFiles();
      const validAudioUrls = audioUrls.filter((url): url is string => url !== null);

      if (validAudioUrls.length > 0) {
        const prompt = ["home loan approval"];
        const scenesWithDuration = await loadDurations(validAudioUrls, fps);

        const fetchImages = await fetch('http://localhost:3005/img', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompts: prompt, // passing the prompt as part of the request body
          }),
        });
        const imagesData = await fetchImages.json();
        console.log(imagesData);

        const updatedScenes = scenesWithDuration.map((scene, index) => {
          const image = imagesData[0].result[index]
            ? `/images/${imagesData[0].result[index]}`
            : `/images/scene${index}.jpg`;

            console.log(image);

          return {
            ...scene,
            image,
          };
        });

        setScenes(updatedScenes);
        setIsLoaded(true);
      } else {
        console.error("Failed to load audio files.");
      }
    };

    loadAssets();
  }, [fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: "white" }}>
      {isLoaded &&
        scenes.map((scene, idx) => {
          const from = scenes
            .slice(0, idx)
            .reduce((acc, curr) => acc + curr.duration, 0);
  
          return (
            <Sequence from={from} durationInFrames={scene.duration} key={idx}>
              <Audio src={scene.audioUrl} />
              <Scene
                idx={idx}
                text={scene.text}
                color={scene.color}
                fontSize={scene.fontSize}
                image={scene.image}
                isLast={idx === scenes.length - 1}
              />
            </Sequence>
          );
        })}
    </AbsoluteFill>
  );
  
};
