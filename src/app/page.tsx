"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import React, { useMemo, useState, useRef } from "react";
import { z } from "zod";
import {
  defaultMyCompProps,
  CompositionProps,
  DURATION_IN_FRAMES,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { Main } from "../remotion/MyComp/Main";
import { storyboardTemplate } from "../remotion/constants/storyboard";

const Home: NextPage = () => {
  const [text, setText] = useState<string>(defaultMyCompProps.title);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  const playerRef = useRef<any>(null);

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      title: text,
    };
  }, [text]);

  const handlePlayClick = () => {
    if (!playerRef.current) return;
  
    if (isPlaying) {
      playerRef.current.pause();
      setIsPlaying(false);
    } else {
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  // Combine all scene texts into a single paragraph
  const combinedTranscript = storyboardTemplate.map(scene => scene.text).join(' ');
  
  const toggleTranscript = () => {
    setShowTranscript(!showTranscript);
  };

  return (
    <div className="bg-black min-h-screen text-white pb-16">
      <div className="max-w-screen-md m-auto mb-5">
        <div className="overflow-hidden rounded-lg shadow-[0_0_200px_rgba(255,255,255,0.1)] mb-10 mt-16">
          <div
            onClick={handlePlayClick}
            style={{
              cursor: "pointer",
              width: "100%",
            }}
          >
            <Player
              ref={playerRef}
              component={Main}
              inputProps={inputProps}
              durationInFrames={DURATION_IN_FRAMES}
              fps={VIDEO_FPS}
              compositionHeight={VIDEO_HEIGHT}
              compositionWidth={VIDEO_WIDTH}
              style={{
                width: "100%",
              }}
              controls
              autoPlay={false}
              loop={false}
            />
          </div>
        </div>
      </div>
      
      <div className="max-w-screen-md m-auto text-center mt-10">
        <button 
          onClick={toggleTranscript}
          className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md mb-6 transition-colors duration-200"
        >
          {showTranscript ? "Hide Transcript" : "Show Transcript"}
        </button>
        
        {showTranscript && (
          <div className="mt-4 p-6 bg-gray-900 rounded-lg border border-gray-800 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">Video Transcript</h2>
            <p className="text-lg text-gray-300 leading-relaxed">
              {combinedTranscript}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;