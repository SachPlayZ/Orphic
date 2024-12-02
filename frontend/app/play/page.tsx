"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Sword,
  ShoppingBag,
  ShoppingBasketIcon as Collection,
  Trophy,
  Activity,
} from "lucide-react";
import { useAccount } from "wagmi";

export default function Page() {
  const router = useRouter();
  const [xp, setXp] = useState(75);
  setXp(75);
  const { address } = useAccount();

  const handleBattle = () => {
    router.push("/battle");
  };

  const handleMarketplace = () => {
    router.push("/marketplace");
  };

  const handleCollectibles = () => {
    router.push("/my-collectibles");
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen text-white">
      <h1 className="text-4xl font-bold text-center mb-8">Orphic Game Hub</h1>

      <Card className="mb-8 bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>Player Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src="/placeholder.svg?height=80&width=80"
              alt="Player Avatar"
            />
            <AvatarFallback>PL</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl">{address}</h2>
            <p className="text-gray-400">Level 5 Adventurer</p>
            <div className="mt-2">
              <p className="text-sm text-gray-400 mb-1">XP: {xp}/100</p>
              <Progress value={xp} className="w-64" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interaction Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Button
          onClick={handleBattle}
          className="h-20 text-lg bg-red-600 hover:bg-red-700"
        >
          <Sword className="mr-2" />{" "}
          <span className="text-lg">Initialize Battle</span>
        </Button>
        <Button
          onClick={handleMarketplace}
          className="h-20 text-lg bg-green-600 hover:bg-green-700"
        >
          <ShoppingBag className="mr-2" /> Monster Marketplace
        </Button>
        <Button
          onClick={handleCollectibles}
          className="h-20 text-lg bg-blue-600 hover:bg-blue-700"
        >
          <Collection className="mr-2" /> My Collectibles
        </Button>
      </div>

      {/* Additional UI Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Leaderboard */}
        <Card className="bg-gray-800 text-white">
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Top players this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2">
              {[
                "Sachindra Kumar Singh",
                "Arnab Sengupta",
                "Aishi Mukhopadhyay",
                "Ritesh Das",
                "Ashdude",
              ].map((name, index) => (
                <li key={name} className="flex items-center justify-between">
                  <span>
                    {index + 1}. {name}
                  </span>
                  <span className="text-yellow-400">
                    <Trophy className="inline mr-1" /> {1000 - index * 50} pts
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-gray-800 text-white">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest game actions</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Activity className="mr-2 text-green-400" />
                <span>Won a battle against Prayas</span>
              </li>
              <li className="flex items-center">
                <Activity className="mr-2 text-blue-400" />
                <span>Acquired a Rare Mystic Amulet</span>
              </li>
              <li className="flex items-center">
                <Activity className="mr-2 text-yellow-400" />
                <span>Completed quest: Dragon Lair</span>
              </li>
              <li className="flex items-center">
                <Activity className="mr-2 text-red-400" />
                <span>Lost a battle against Sachindra Kumar Singh</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Featured NFT */}
      <Card className="mt-8 bg-gray-800 text-white">
        <CardHeader>
          <CardTitle>Featured NFT</CardTitle>
          <CardDescription>Limited time offer!</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center space-x-4">
          <Image
            src="/placeholder.svg?height=150&width=150"
            alt="Featured NFT"
            width={150}
            height={150}
            className="rounded-lg"
          />
          <div>
            <h3 className="text-xl font-bold">Legendary Dragon Egg</h3>
            <p className="text-gray-400">Hatch your own dragon companion!</p>
            <p className="text-yellow-400 mt-2">Price: 0.5 ETH</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-[16rem] bg-purple-600 hover:bg-purple-700">
            View in Marketplace
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
