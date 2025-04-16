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
import { RenderControls } from "../components/RenderControls";
import { Spacing } from "../components/Spacing";
import { Tips } from "../components/Tips";
import { Main } from "../remotion/MyComp/Main";

const Home: NextPage = () => {
  const [text, setText] = useState<string>(defaultMyCompProps.title);
  const [isPlaying, setIsPlaying] = useState(false); // To manage play state

  const playerRef = useRef<any>(null); // Ref for the Player

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      title: text,
    };
  }, [text]);

  const handlePlayClick = () => {
    if (!playerRef.current) return;
  
    if (isPlaying) {
      playerRef.current.pause(); // Pause if already playing
      setIsPlaying(false);
    } else {
      playerRef.current.play(); // Play if paused
      setIsPlaying(true);
    }
  };
  

  return (
    <div>
      <div className="max-w-screen-md m-auto mb-5">
        <div className="overflow-hidden rounded-geist shadow-[0_0_200px_rgba(0,0,0,0.15)] mb-10 mt-16">
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
              autoPlay={false} // Disable autoplay
              loop={false} // Disable looping
            />
          </div>
        </div>
        <RenderControls
          text={text}
          setText={setText}
          inputProps={inputProps}
        ></RenderControls>
        <Spacing></Spacing>
        <Spacing></Spacing>
        <Spacing></Spacing>
        <Spacing></Spacing>
        <Tips></Tips>
      </div>
    </div>
  );
};

export default Home;
