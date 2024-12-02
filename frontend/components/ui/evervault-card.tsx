"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { MotionValue } from "framer-motion";

interface SpotlightBackgroundProps {
  className?: string;
  children: React.ReactNode;
}

export const SpotlightBackground: React.FC<SpotlightBackgroundProps> = ({
  className,
  children,
}) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [randomString, setRandomString] = useState("");

  useEffect(() => {
    setRandomString(generateRandomString(20000));
  }, []);

  function onMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
    setRandomString(generateRandomString(20000));
  }

  return (
    <div
      onMouseMove={onMouseMove}
      className={`relative overflow-hidden ${className}`}
    >
      <BackgroundSpotlight
        mouseX={mouseX}
        mouseY={mouseY}
        randomString={randomString}
      />
      {children}
    </div>
  );
};

function BackgroundSpotlight({
  mouseX,
  mouseY,
  randomString,
}: {
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  randomString: string;
}) {
  const maskImage = useMotionTemplate`radial-gradient(600px at ${mouseX}px ${mouseY}px, white, rgba(255, 255, 255, 0.25) 80%, transparent 100%)`;
  const style = { maskImage, WebkitMaskImage: maskImage };

  return (
    <>
      <motion.div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-green-500 to-blue-700 opacity-0 transition duration-300 group-hover:opacity-20"
        style={style}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition duration-300 group-hover:opacity-100"
        style={style}
      >
        <p className="absolute inset-x-0 text-xs h-full break-words whitespace-pre-wrap text-white font-mono font-bold">
          {randomString}
        </p>
      </motion.div>
    </>
  );
}

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const generateRandomString = (length: number) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};
