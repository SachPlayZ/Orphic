"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Page = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden relative">
      <div className="absolute top-0 left-0 w-1/2 h-full bg-blue-500 opacity-20 blur-3xl rounded-full"></div>
      <div className="absolute top-0 right-0 w-1/2 h-full bg-green-500 opacity-20 blur-3xl rounded-full"></div>
      <motion.h1
        className="text-7xl text-white mb-16 relative z-10 font-extrabold tracking-wider mt-16"
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
    </div>
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
  return (
    <div className={`relative ${side === "left" ? "ml-10" : "mr-10"}`}>
      <motion.div
        className="relative group"
        initial={{ x: side === "left" ? -300 : 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, type: "spring" }}
      >
        <Image
          src={image}
          width={600}
          height={600}
          alt={name}
          className="transition-opacity duration-300 group-hover:opacity-100 opacity-40"
        />
        <AnimatedButton name={name} />
      </motion.div>
    </div>
  );
};

const AnimatedButton = ({ name }: { name: string }) => {
  return (
    <motion.div
      className="absolute top-10 left-1/2 transform -translate-x-1/2"
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Button className="bg-gray-500 text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-green-500 transition-all duration-300">
        Choose {name}
      </Button>
    </motion.div>
  );
};

export default Page;
