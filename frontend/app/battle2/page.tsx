"use client"

import { useState, useEffect } from "react"
import { useWriteContract, useAccount, useReadContract } from "wagmi"
import { abi, contractAddress } from "@/abi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2, Swords } from "lucide-react"

type Move = {
  moveName: string
  movePower: string
}

type Monster = {
  name: string
  attack: string
  defense: string
  hp: string
  moveCount: string
  rarity: number
  ipfsHash: string
  isMonster: boolean
  isDeleted: boolean
}

type MonsterWithMoves = {
  monster: Monster
  moves: Move[]
}

export default function MonsterBattlePage() {
  const { address } = useAccount()
  const [monsters, setMonsters] = useState<MonsterWithMoves[]>([])
  const [selectedMonster, setSelectedMonster] = useState<MonsterWithMoves | null>(null)
  const [aiMonster, setAiMonster] = useState<MonsterWithMoves | null>(null)
  const [battleLog, setBattleLog] = useState<string[]>([])
  const [isBattling, setIsBattling] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [mintedMonster, setMintedMonster] = useState<MonsterWithMoves | null>(null)
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
      const monsterData = data as MonsterWithMoves[]
      setMonsters(monsterData)
    }
  }, [data])

  const generateAiMonster = async (): Promise<MonsterWithMoves> => {
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
      monster: {
        name: `AI ${creatureType.charAt(0).toUpperCase() + creatureType.slice(1)}`,
        attack: Math.floor(Math.random() * 50 + 50).toString(),
        defense: Math.floor(Math.random() * 50 + 50).toString(),
        hp: Math.floor(Math.random() * 100 + 100).toString(),
        moveCount: "4",
        rarity: rarity,
        ipfsHash: "",
        isMonster: true,
        isDeleted: false,
      },
      moves: generateMoves(),
    }
  }

  const generateMoves = (): Move[] => {
    const moveNames = ["Fireball", "Ice Shard", "Thunder Strike", "Earth Quake", "Wind Slash"]
    return Array(4)
      .fill(null)
      .map(() => ({
        moveName: moveNames[Math.floor(Math.random() * moveNames.length)],
        movePower: Math.floor(Math.random() * 50 + 30).toString(),
      }))
  }

  const generateRarity = (): number => {
    const rand = Math.random()
    if (rand < 0.6) return 0 // common
    if (rand < 0.85) return 1 // rare
    if (rand < 0.95) return 2 // epic
    return 3 // legendary
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

    let playerHp = Number.parseInt(selectedMonster.monster.hp)
    let aiHp = Number.parseInt(aiMonster.monster.hp)

    while (playerHp > 0 && aiHp > 0) {
      // Player's turn
      const playerMove = selectedMonster.moves[Math.floor(Math.random() * selectedMonster.moves.length)]
      const playerDamage = Math.max(
        0,
        Number.parseInt(playerMove.movePower) +
          Number.parseInt(selectedMonster.monster.attack) -
          Number.parseInt(aiMonster.monster.defense),
      )
      aiHp -= playerDamage
      setBattleLog((prev) => [
        ...prev,
        `${selectedMonster.monster.name} used ${playerMove.moveName} and dealt ${playerDamage} damage!`,
      ])

      if (aiHp <= 0) break

      // AI's turn
      const aiResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `You are an AI controlling a monster in a battle. Your monster (${aiMonster.monster.name}) has ${aiHp} HP left. The opponent (${selectedMonster.monster.name}) has ${playerHp} HP left. Choose a move from your moveset: ${JSON.stringify(aiMonster.moves)}. Return your decision as a JSON object with 'move' and 'reason' properties.`,
        }),
      })

      if (!aiResponse.ok) throw new Error("Failed to get AI move")

      const aiDecision = await aiResponse.json()
      const aiMove = aiMonster.moves.find((move) => move.moveName === aiDecision.move)
      if (!aiMove) throw new Error("Invalid AI move")

      const aiDamage = Math.max(
        0,
        Number.parseInt(aiMove.movePower) +
          Number.parseInt(aiMonster.monster.attack) -
          Number.parseInt(selectedMonster.monster.defense),
      )
      playerHp -= aiDamage
      setBattleLog((prev) => [
        ...prev,
        `${aiMonster.monster.name} used ${aiMove.moveName} and dealt ${aiDamage} damage!`,
        `AI's reasoning: ${aiDecision.reason}`,
      ])
    }

    if (playerHp <= 0) {
      setBattleLog((prev) => [...prev, `${selectedMonster.monster.name} fainted. You lost the battle!`])
    } else {
      setBattleLog((prev) => [...prev, `${aiMonster.monster.name} fainted. You won the battle!`])
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
      setMintedImage(newMonster.monster.ipfsHash)
    } catch (error) {
      console.error("Error minting victory NFT:", error)
      toast({ title: "Failed to mint victory NFT", variant: "destructive" })
    } finally {
      setIsMinting(false)
    }
  }

  const mintMonsterNFT = async (monster: MonsterWithMoves) => {
    try {
      const response = await fetch(`https://ipfs.io/ipfs/${monster.monster.ipfsHash}`)
      const blob = await response.blob()
      const file = new File([blob], `${monster.monster.name}.png`, { type: blob.type })
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

      await writeContractAsync({
        address: contractAddress,
        abi: abi,
        functionName: "mintMonster",
        args: [
          ipfs,
          monster.monster.name,
          monster.monster.attack,
          monster.monster.defense,
          monster.monster.hp,
          monster.monster.rarity,
        ],
      })

      return monster
    } catch (error) {
      console.error("Error in mintMonsterNFT:", error)
      throw error
    }
  }

  const generateMonsterNFT = async (): Promise<MonsterWithMoves> => {
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
        monster: {
          name,
          attack: Math.floor((Math.random() * 50 + 50) * statMultiplier).toString(),
          defense: Math.floor((Math.random() * 50 + 50) * statMultiplier).toString(),
          hp: Math.floor((Math.random() * 100 + 100) * statMultiplier).toString(),
          moveCount: "4",
          rarity,
          ipfsHash: "", // This should be updated with the actual IPFS hash after uploading
          isMonster: true,
          isDeleted: false,
        },
        moves: generateMoves(),
      }
    } catch (error) {
      console.error("Error generating monster NFT:", error)
      throw error
    }
  }

  const getRarityMultiplier = (rarity: number): number => {
    switch (rarity) {
      case 0:
        return 1 // common
      case 1:
        return 1.2 // rare
      case 2:
        return 1.5 // epic
      case 3:
        return 2 // legendary
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
            <Select
              onValueChange={(value) => setSelectedMonster(monsters.find((m) => m.monster.name === value) || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose your monster" />
              </SelectTrigger>
              <SelectContent>
                {monsters.map((monsterWithMoves) => (
                  <SelectItem key={monsterWithMoves.monster.name} value={monsterWithMoves.monster.name}>
                    {monsterWithMoves.monster.name} (Rarity: {monsterWithMoves.monster.rarity})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedMonster && (
              <div className="mt-4 space-y-2">
                <img
                  src={`https://ipfs.io/ipfs/${selectedMonster.monster.ipfsHash}`}
                  alt={selectedMonster.monster.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <p>Attack: {selectedMonster.monster.attack}</p>
                <p>Defense: {selectedMonster.monster.defense}</p>
                <p>HP: {selectedMonster.monster.hp}</p>
                <p>Moves: {selectedMonster.moves.map((move) => move.moveName).join(", ")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>AI Monster</CardTitle>
          </CardHeader>
          <CardContent>
            {aiMonster && (
              <div className="space-y-2">
                <img
                  src={`https://ipfs.io/ipfs/${aiMonster.monster.ipfsHash}`}
                  alt={aiMonster.monster.name}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <p>Name: {aiMonster.monster.name}</p>
                <p>Rarity: {aiMonster.monster.rarity}</p>
                <p>Attack: {aiMonster.monster.attack}</p>
                <p>Defense: {aiMonster.monster.defense}</p>
                <p>HP: {aiMonster.monster.hp}</p>
                <p>Moves: {aiMonster.moves.map((move) => move.moveName).join(", ")}</p>
              </div>
            )}
            {!aiMonster && <p className="text-center">AI monster will appear here when the battle starts</p>}
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
                src={`https://ipfs.io/ipfs/${mintedMonster.monster.ipfsHash}`}
                alt={mintedMonster.monster.name}
                className="w-48 h-48 object-cover rounded-lg mx-auto mb-4"
              />
              <p className="text-xl font-bold">{mintedMonster.monster.name}</p>
              <p>Rarity: {mintedMonster.monster.rarity}</p>
              <p>Attack: {mintedMonster.monster.attack}</p>
              <p>Defense: {mintedMonster.monster.defense}</p>
              <p>HP: {mintedMonster.monster.hp}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

