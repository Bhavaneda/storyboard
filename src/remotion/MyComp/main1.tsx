import {
    AbsoluteFill,
    Sequence,
    Audio,
    useVideoConfig,
    staticFile,
    Img,
    interpolate,
    useCurrentFrame,
  } from "remotion";
  import { useEffect, useState, useRef } from "react";
  import { loadFont, fontFamily } from "@remotion/google-fonts/Inter";
  import { getAudioDurationInSeconds } from "@remotion/media-utils";
  
  loadFont("normal", {
    subsets: ["latin"],
    weights: ["400", "700"],
  });
  
  const customerName = "John Doe";
  const loanAmount = "500000";
  const agentName = "Alex";
  
  const storyboardTemplate = [
    {
      text: "Congratulations {customer_name}!",
      audio: "/audio/voiceover_0.mp3",
      fontSize: 60,
      color: "black",
    },
    {
      text: "We’ve got some exciting news just for you!",
      audio: "/audio/voiceover_1.mp3",
      fontSize: 50,
      color: "blue",
    },
    {
      text: "Your home loan for ₹{loan_amount} has been approved!",
      audio: "/audio/voiceover_2.mp3",
      fontSize: 50,
      color: "green",
    },
    {
      text: "{agent_name} your loan advisor is here to guide you every step of the way.",
      audio: "/audio/voiceover_3.mp3",
      fontSize: 50,
      color: "darkred",
    },
    {
      text: "We’re so proud to be part of this milestone in your life.",
      audio: "/audio/voiceover_4.mp3",
      fontSize: 50,
      color: "orange",
    },
    {
      text: "Click below to proceed to the next steps.",
      audio: "/audio/voiceover_5.mp3",
      fontSize: 50,
      color: "purple",
    },
  ];
  
  // CTA Button
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
  
    const opacity = interpolate(
      frame,
      [startFrame, visibleFrame],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  
    const translateY = interpolate(
      frame,
      [startFrame, visibleFrame],
      [50, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  
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
          fontFamily,
          fontSize: "24px",
          fontWeight: "bold",
          borderRadius: "8px",
          cursor: "pointer",
          textDecoration: "none",
          boxShadow: `0 0 ${glowIntensity}px #4285f4`,
          transition: "all 0.3s ease",
          border: "2px solid rgba(255, 255, 255, 0.7)",
          textShadow: "0px 1px 2px rgba(0,0,0,0.3)",
          marginTop: "50px",
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
    duration,
    isLast = false,
  }: {
    idx: number;
    text: string;
    color: string;
    fontSize: number;
    duration: number;
    isLast?: boolean;
  }) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
    const scale = interpolate(frame, [0, 20], [0.95, 1], { extrapolateRight: "clamp" });
  
    const image = staticFile(`/images/scene${idx}.jpg`);
  
    return (
      <AbsoluteFill style={{ opacity }}>
      <Img
    src={image}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
      position: "absolute",
      pointerEvents:"none" // ⚠️
    }}
  />
  <div
    className="absolute inset-0 flex flex-col justify-end items-center px-10"
    style={{
      background: "linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))",
      overflow: "visible", // ✅ Ensures bottom content isn't clipped
      transformOrigin: "bottom center"
  
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
      marginBottom:"135px",
      zIndex: 10, // 🔥 Add this
      border: "2px dashed red",
  
      position: "relative", // 🔥 Add this
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
  
  
  export const Main: React.FC = () => {
    const { fps } = useVideoConfig();
    const [storyboard, setStoryboard] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
  
    useEffect(() => {
      const loadDurations = async () => {
        const scenesWithDuration = await Promise.all(
          storyboardTemplate.map(async (scene) => {
            const fullAudioPath = staticFile(scene.audio);
            const seconds = await getAudioDurationInSeconds(fullAudioPath);
            const durationInFrames = Math.ceil(seconds * fps);
            return {
              ...scene,
              duration: durationInFrames,
            };
          })
        );
        setStoryboard(scenesWithDuration);
        setIsLoaded(true);
      };
  
      loadDurations();
    }, [fps]);
  
    if (!isLoaded) {
      return (
        <AbsoluteFill className="flex items-center justify-center text-black">
          Loading...
        </AbsoluteFill>
      );
    }
  
    let start = 0;
    const sequences = storyboard.map((scene, idx) => {
      const personalizedText = scene.text
        .replace("{customer_name}", customerName)
        .replace("{loan_amount}", loanAmount)
        .replace("{agent_name}", agentName);
  
      const isLast = idx === storyboard.length - 1;
  
      const sequence = (
        <Sequence key={idx} from={start} durationInFrames={scene.duration}>
          <Scene
            idx={idx}
            text={personalizedText}
            color={scene.color}
            fontSize={scene.fontSize}
            duration={scene.duration}
            isLast={isLast}
          />
          <Audio src={scene.audio} />
        </Sequence>
      );
  
      start += scene.duration;
      return sequence;
    });
  
    return <AbsoluteFill className="bg-white">{sequences}</AbsoluteFill>;
  };
  