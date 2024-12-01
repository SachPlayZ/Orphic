"use client";

import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Page = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden relative">
      {!isLoggedIn ? (
        <WalletConnectionScreen onConnect={() => setIsLoggedIn(true)} />
      ) : (
        <FactionSelectionScreen />
      )}
    </div>
  );
};

const WalletConnectionScreen = ({ onConnect }: { onConnect: () => void }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="text-6xl font-extrabold mb-8 text-white">
        Connect Your Wallet
        <br />
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
          to Continue
        </span>
      </h1>
      <Button
        onClick={onConnect}
        className="bg-gradient-to-r from-blue-500 to-green-500 text-white py-3 px-8 rounded-full text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
      >
        Connect Wallet
      </Button>
    </motion.div>
  );
};

const FactionSelectionScreen = () => {
  return (
    <>
      <div className="absolute top-0 left-0 w-1/2 h-full bg-blue-500 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-green-500 opacity-20 blur-3xl rounded-full"></div>
      <motion.h1
        className="text-7xl text-white mb-16 relative z-10 font-extrabold tracking-wider"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-green-400">
          Choose Your Faction
        </span>
      </motion.h1>
      <div className="flex w-full justify-between relative z-10">
        <FactionChoice image="/Dragon.png" name="Dragons" side="left" />
        <FactionChoice image="/Tiger.png" name="Tigers" side="right" />
      </div>
    </>
  );
};

const FactionChoice = ({
  image,
  name,
  side,
}: {
  image: string;
  name: string;
  side: "left" | "right";
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`relative ${side === "left" ? "ml-10" : "mr-10"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative group"
        initial={{ x: side === "left" ? -300 : 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, type: "spring" }}
      >
        <Image
          src={image}
          width={550}
          height={550}
          alt={name}
          className={`transition-opacity duration-300 ${
            isHovered ? "opacity-100" : "opacity-40"
          }`}
        />
        <AnimatedButton name={name} isHovered={isHovered} />
      </motion.div>
    </div>
  );
};

const AnimatedButton = ({
  name,
  isHovered,
}: {
  name: string;
  isHovered: boolean;
}) => {
  return (
    <motion.div
      className="absolute top-10 left-1/2 transform -translate-x-1/2"
      animate={{
        scale: isHovered ? 1.1 : 1,
        y: isHovered ? -5 : 0,
      }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Button
        className={`
          text-lg font-bold py-3 px-6 rounded-full shadow-lg
          ${
            isHovered
              ? "bg-gradient-to-r from-blue-500 to-green-500 text-white"
              : "bg-gray-700 text-gray-300"
          }
          transition-all duration-300 ease-in-out
          hover:shadow-xl hover:from-blue-600 hover:to-green-600
        `}
      >
        Choose {name}
      </Button>
    </motion.div>
  );
};

export default Page;
