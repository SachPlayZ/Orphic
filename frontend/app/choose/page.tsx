"use client";

import Image from "next/image";

import abi from "@/abi";

const contractAddress = "0xFfa47E4562D7cc6cDB95a7366E04b644e9DEF000";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";

const Page = () => {
  const { address, isConnected } = useAccount();
  const [faction, setFaction] = useState<string | undefined>(undefined);
  const [globalLoading, setGlobalLoading] = useState(true); // Global loading state
  const router = useRouter();
  const { data, isLoading } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "playerFaction",
    args: [address],
  });
  const { data: data2, isLoading: isLoading2 } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getUserTokenCount",
    args: [address],
  });

  useEffect(() => {
    if (!isLoading && !isLoading2) {
      console.log("Data:", Number(data2));
      setGlobalLoading(false); // Stop loading when the contract data is fetched
      if (data) {
        if (data === 1) {
          setFaction("Dragons");
          if (Number(data2) == 0) router.push("/first-mon?faction=dragon");
          else router.push("/play");
        } else if (data === 2) {
          setFaction("Tigers");
          if (Number(data2) == 0) router.push("/first-mon?faction=tiger");
          else router.push("/play");
        }
      }
    }
  }, [isLoading, isLoading2, data, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black overflow-hidden relative">
      {globalLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <Loader2 className="h-16 w-16 animate-spin text-white" />
        </div>
      ) : !isConnected ? (
        <WalletConnectionScreen />
      ) : (
        <FactionSelectionScreen />
      )}
    </div>
  );
};

const WalletConnectionScreen = () => {
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
      <ConnectButton />
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
  const [isLoading, setIsLoading] = useState(false);
  const factionId = name === "Dragons" ? 1 : 2;
  const { writeContractAsync } = useWriteContract();
  const { address } = useAccount();
  const router = useRouter();

  const handleSelectFaction = async () => {
    try {
      setIsLoading(true);
      await writeContractAsync(
        {
          address: contractAddress,
          abi: abi,
          functionName: "setPlayerFaction",
          args: [address, factionId],
        },
        {
          onSuccess: () => {
            console.log("Faction selected successfully");
          },
        }
      );
    } catch (error) {
      console.error("Error selecting faction:", error);
      // Optionally, you could add error handling here (e.g., show an error message)
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`relative ${side === "left" ? "ml-10" : "mr-10"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleSelectFaction}
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
        {isLoading ? (
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
            <Loader2 className="h-12 w-12 animate-spin text-white" />
          </div>
        ) : (
          <AnimatedButton name={name} isHovered={isHovered} />
        )}
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
