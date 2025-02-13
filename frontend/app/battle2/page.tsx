"use client"

import { useState, useEffect } from "react"
import { useWriteContract, useAccount, useReadContract } from "wagmi"
import abi from "@/abi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Swords } from "lucide-react"

const contractAddress = "0xf5e1F9ded14De19Ae71Bc455E935Eed5A0465463"

type Move = {
  attack: string
  power: number
}

type Monster = {
  name: string
  attack: string
  defense: string
  hp: string
  rarity: string
  tokenURI: string
  moveset: Move[]
}

export default function MonsterBattlePage() {
  const { address } = useAccount()
  const [monsters, setMonsters] = useState<Monster[]>([])
  const [selectedMonster, setSelectedMonster] = useState<Monster | null>(null)
  const [aiMonster, setAiMonster] = useState<Monster | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [isBattling, setIsBattling] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintedMonster, setMintedMonster] = useState<Monster | null>(null)
  const [mintedImage, setMintedImage] = useState<string | null>(null)

  const { data: writeData, writeContractAsync } = useWriteContract()

  const { data, isLoading: isDataLoading } = useReadContract({
    address: contractAddress,
    abi: abi,
    functionName: "getAllMonstersFromAUser",
    args: [address],
  })

  useEffect(() => {
    if (data) {
      const monsterData = data as Monster[]
      setMonsters(monsterData)
    }
  }, [data])

  const generateAiMonster = async () => {
    const rarity = generateRarity()
    const creatureType = Math.random() < 0.5 ? "dragon" : "tiger"
    const response = await fetch("/api/getArt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creatureType, rarity }),
    })

    if (!response.ok) throw new Error("Failed to generate monster image")

    const blob = await response.blob()
    const imageUrl = URL.createObjectURL(blob)

    return {
      name: `AI ${creatureType.charAt(0).toUpperCase() + creatureType.slice(1)}`,
      attack: Math.floor(Math.random() * 50 + 50).toString(),
      defense: Math.floor(Math.random() * 50 + 50).toString(),
      hp: Math.floor(Math.random() * 100 + 100).toString(),
      rarity,
      tokenURI: imageUrl,
      moveset: generateMoves(),
    }
  }

  const generateMoves = (): Move[] => {
    const moveNames = ["Fireball", "Ice Shard", "Thunder Strike", "Earth Quake", "Wind Slash"]
    return Array(4)
      .fill(null)
      .map(() => ({
        attack: moveNames[Math.floor(Math.random() * moveNames.length)],
        power: Math.floor(Math.random() * 50 + 30),
      }))
  }

  const generateRarity = () => {
    const rand = Math.random()
    if (rand < 0.6) return "common"
    if (rand < 0.85) return "rare"
    if (rand < 0.95) return "epic"
    return "legendary"
  }

  const startBattle = async () => {
    if (!selectedMonster) {
      toast({ title: "Please select a monster to battle with!", variant: "destructive" })
      return
    }

    setIsBattling(true)
    setBattleLog([])
    const aiMonster = await generateAiMonster()
    setAiMonster(aiMonster)

    let playerHp = Number.parseInt(selectedMonster.hp)
    let aiHp = Number.parseInt(aiMonster.hp)

    while (playerHp > 0 && aiHp > 0) {
      // Player's turn
      const playerMove = selectedMonster.moveset[Math.floor(Math.random() * selectedMonster.moveset.length)]
      const playerDamage = Math.max(
        0,
        playerMove.power + Number.parseInt(selectedMonster.attack) - Number.parseInt(aiMonster.defense),
      )
      aiHp -= playerDamage
      setBattleLog((prev) => [
        ...prev,
        `${selectedMonster.name} used ${playerMove.attack} and dealt ${playerDamage} damage!`,
      ])

      if (aiHp <= 0) break

      // AI's turn
      const aiResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are an AI controlling a monster in a battle. Your monster (${aiMonster.name}) has ${aiHp} HP left. The opponent (${selectedMonster.name}) has ${playerHp} HP left. Choose a move from your moveset: ${JSON.stringify(aiMonster.moveset)}. Return your decision as a JSON object with 'move' and 'reason' properties.`,
        }),
      })

      if (!aiResponse.ok) throw new Error("Failed to get AI move")

      const aiDecision = await aiResponse.json()
      const aiMove = aiMonster.moveset.find((move) => move.attack === aiDecision.move)
      if (!aiMove) throw new Error("Invalid AI move")

      const aiDamage = Math.max(
        0,
        aiMove.power + Number.parseInt(aiMonster.attack) - Number.parseInt(selectedMonster.defense),
      )
      playerHp -= aiDamage
      setBattleLog((prev) => [
        ...prev,
        `${aiMonster.name} used ${aiMove.attack} and dealt ${aiDamage} damage!`,
        `AI's reasoning: ${aiDecision.reason}`,
      ])
    }

    if (playerHp <= 0) {
      setBattleLog((prev) => [...prev, `${selectedMonster.name} fainted. You lost the battle!`])
    } else {
      setBattleLog((prev) => [...prev, `${aiMonster.name} fainted. You won the battle!`])
      await handleVictory()
    }

    setIsBattling(false)
  }

  const handleVictory = async () => {
    setIsMinting(true)
    try {
      const newMonster = await generateMonsterNFT()
      const mintedNFT = await mintMonsterNFT(newMonster)
      setMintedMonster(mintedNFT)
      setMintedImage(newMonster.tokenURI)
    } catch (error) {
      console.error("Error minting victory NFT:", error)
      toast({ title: "Failed to mint victory NFT", variant: "destructive" })
    } finally {
      setIsMinting(false)
    }
  }

  const mintMonsterNFT = async (monster: Monster) => {
    try {
      const response = await fetch(monster.tokenURI)
      const blob = await response.blob()
      const file = new File([blob], `${monster.name}.png`, { type: blob.type })
      const imgData = new FormData()
      imgData.append("file", file)

      const uploadResponse = await fetch("/api/files", {
        method: "POST",
        body: imgData,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload the file")
      }

      const ipfs = await uploadResponse.json()

      let rarityEnum
      switch (monster.rarity) {
        case "common":
          rarityEnum = 0
          break
        case "rare":
          rarityEnum = 1
          break
        case "epic":
          rarityEnum = 2
          break
        case "legendary":
          rarityEnum = 3
          break
        default:
          rarityEnum = 0
      }

      await writeContractAsync({
        address: contractAddress,
        abi: abi,
        functionName: "mintMonster",
        args: [ipfs, monster.name, monster.attack, monster.defense, monster.hp, rarityEnum],
      })

      return monster
    } catch (error) {
      console.error("Error in mintMonsterNFT:", error)
      throw error
    }
  }

  const generateMonsterNFT = async (): Promise<Monster> => {
    const rarity = generateRarity()
    const statMultiplier = getRarityMultiplier(rarity)
    const name = monsterNames[Math.floor(Math.random() * monsterNames.length)]

    try {
      const creatureType = Math.random() < 0.5 ? "dragon" : "tiger"
      const response = await fetch("/api/getArt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatureType, rarity }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate monster image")
      }

      const blob = await response.blob()
      const imageUrl = URL.createObjectURL(blob)

      return {
        name,
        tokenURI: imageUrl,
        rarity,
        attack: Math.floor((Math.random() * 50 + 50) * statMultiplier).toString(),
        defense: Math.floor((Math.random() * 50 + 50) * statMultiplier).toString(),
        hp: Math.floor((Math.random() * 100 + 100) * statMultiplier).toString(),
        moveset: generateMoves(),
      }
    } catch (error) {
      console.error("Error generating monster NFT:", error)
      throw error
    }
  }

  const getRarityMultiplier = (rarity: string): number => {
    switch (rarity) {
      case "common":
        return 1
      case "rare":
        return 1.2
      case "epic":
        return 1.5
      case "legendary":
        return 2
      default:
        return 1
    }
  }

  const monsterNames = [
    "Blaze",
    "Frostbite",
    "Thunderclaw",
    "Stoneheart",
    "Windwhisper",
    "Shadowfang",
    "Lightbeam",
    "Venom",
    "Aquarius",
    "Inferno",
  ]

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold text-center mb-8">Monster Battle Arena</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Monster</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={(value) => setSelectedMonster(monsters.find((m) => m.name === value) || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose your monster" />
              </SelectTrigger>
              <SelectContent>
                {monsters.map((monster) => (
                  <SelectItem key={monster.name} value={monster.name}>
                    {monster.name} ({monster.rarity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMonster && (
              <div className="mt-4 space-y-2">
                <img
                  src={selectedMonster.tokenURI || "/placeholder.svg"}
                  alt={selectedMonster.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <p>Attack: {selectedMonster.attack}</p>
                <p>Defense: {selectedMonster.defense}</p>
                <p>HP: {selectedMonster.hp}</p>
                <p>Moves: {selectedMonster.moveset.map((move) => move.attack).join(", ")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Monster</CardTitle>
          </CardHeader>
          <CardContent>
            {aiMonster ? (
              <div className="space-y-2">
                <img
                  src={aiMonster.tokenURI || "/placeholder.svg"}
                  alt={aiMonster.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <p>Name: {aiMonster.name}</p>
                <p>Rarity: {aiMonster.rarity}</p>
                <p>Attack: {aiMonster.attack}</p>
                <p>Defense: {aiMonster.defense}</p>
                <p>HP: {aiMonster.hp}</p>
                <p>Moves: {aiMonster.moveset.map((move) => move.attack).join(", ")}</p>
              </div>
            ) : (
              <p className="text-center">AI monster will appear here when the battle starts</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button onClick={startBattle} disabled={isBattling || !selectedMonster}>
          {isBattling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Battling...
            </>
          ) : (
            <>
              <Swords className="mr-2 h-4 w-4" />
              Start Battle
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Battle Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-y-auto space-y-2">
            {battleLog.map((log, index) => (
              <p key={index} className="text-sm">
                {log}
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {mintedMonster && (
        <Card>
          <CardHeader>
            <CardTitle>Victory Reward!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <img
                src={mintedImage || ""}
                alt={mintedMonster.name}
                className="w-48 h-48 object-cover rounded-lg mx-auto mb-4"
              />
              <p className="text-xl font-bold">{mintedMonster.name}</p>
              <p>Rarity: {mintedMonster.rarity}</p>
              <p>Attack: {mintedMonster.attack}</p>
              <p>Defense: {mintedMonster.defense}</p>
              <p>HP: {mintedMonster.hp}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

