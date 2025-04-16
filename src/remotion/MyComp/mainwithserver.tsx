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
import { getAudioDurationInSeconds } from "@remotion/media-utils";

const customerName = "John Doe";
const loanAmount = "50000";
const agentName = "Alex";

const generateAudioFileName = (index: number) => {
  return `/audio/voiceover_${index}.mp3`;
};

const storyboardTemplate = [
  {
    text: `Congratulations ${customerName}!`,
    audio: generateAudioFileName(0),
    fontSize: 60,
    color: "black",
  },
  {
    text: "We’ve got some exciting news just for you!",
    audio: generateAudioFileName(1),
    fontSize: 50,
    color: "blue",
  },
  {
    text: `Your home loan for ${loanAmount} has been approved!`,
    audio: generateAudioFileName(2),
    fontSize: 50,
    color: "green",
  },
  {
    text: `${agentName}, your loan advisor is here to guide you every step of the way.`,
    audio: generateAudioFileName(3),
    fontSize: 50,
    color: "darkred",
  },
  {
    text: "We’re so proud to be part of this milestone in your life.",
    audio: generateAudioFileName(4),
    fontSize: 50,
    color: "orange",
  },
  {
    text: "Click below to proceed to the next steps.",
    audio: generateAudioFileName(5),
    fontSize: 50,
    color: "purple",
  },
];

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
  isLast = false,
}: {
  idx: number;
  text: string;
  color: string;
  fontSize: number;
  isLast?: boolean;
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 20], [0, 1], {
    extrapolateRight: "clamp",
  });
  const scale = interpolate(frame, [0, 20], [0.95, 1], {
    extrapolateRight: "clamp",
  });

  const image = `/images/scene${idx}.jpg`;

  return (
    <AbsoluteFill style={{ opacity }}>
      <Img
        src={image}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          position: "absolute",
        }}
      />
      <div className="absolute inset-0 flex flex-col justify-end items-center px-10 pb-28">
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
          }}
        >
          <h1
            style={{
              fontSize,
              color,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              textShadow: "1px 1px 2px rgba(0,0,0,0.25)",
              lineHeight: 1.3,
            }}
          >
            {text}
          </h1>

          {isLast && (
            <div style={{ marginTop: "24px" }}>
              <CTAButton text="View Details" url="https://www.wellsfargo.com/" />
            </div>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Main: React.FC = () => {
  const { fps } = useVideoConfig();
  const [storyboard, setStoryboard] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadDurations = async () => {
      const scenesWithDuration = await Promise.all(
        storyboardTemplate.map(async (scene, index) => {
          try {
            const response = await fetch(
              `http://localhost:3001/generate-audio?text=${encodeURIComponent(scene.text)}&index=${index}`
            );
            if (!response.ok) {
              console.error(`Failed to generate audio for scene ${index}: ${response.statusText}`);
              return null;
            }

            const audioUrl = `http://localhost:3001${scene.audio}`;
            const seconds = await getAudioDurationInSeconds(audioUrl);
            const durationInFrames = Math.ceil(seconds * fps);

            return {
              ...scene,
              duration: durationInFrames,
              audioUrl,
            };
          } catch (error: any) {
            console.error(`Error loading scene ${index}: ${error.message}`);
            return null;
          }
        })
      );

      setStoryboard(scenesWithDuration.filter((s) => s !== null));
      setIsLoaded(true);
    };

    loadDurations();
  }, [fps]);

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {isLoaded &&
        storyboard.map((scene, idx) => (
          <Sequence from={storyboard.slice(0, idx).reduce((acc, curr) => acc + curr.duration, 0)} key={idx}>
            <Scene
              idx={idx}
              text={scene.text}
              color={scene.color}
              fontSize={scene.fontSize}
              isLast={idx === storyboard.length - 1}
            />
            <Audio src={scene.audioUrl} />
          </Sequence>
        ))}
    </AbsoluteFill>
  );
};
