import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Zap, Shield, Heart, X } from 'lucide-react';
import { Monster } from "./types";

interface MonsterDialogProps {
  monster: Monster | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MonsterDialog({
  monster,
  isOpen,
  onClose,
}: MonsterDialogProps) {
  if (!monster) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white border-0 rounded-lg overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            {monster.name}
          </DialogTitle>
        </DialogHeader>
        {/* <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors duration-200"
        >
          <X className="w-6 h-6" />
        </button> */}
        <div className="relative h-64 w-full mb-4 rounded-lg overflow-hidden">
          <Image
            src={monster.tokenURI}
            alt={monster.name}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
        </div>
        <div className="space-y-4">
          <p className="text-center">
            <span className="font-semibold text-gray-400">Rarity: </span>
            <span className={`capitalize font-bold ${
              monster.rarity === 'common' ? 'text-gray-400' :
              monster.rarity === 'rare' ? 'text-blue-400' :
              monster.rarity === 'epic' ? 'text-purple-400' :
              'text-yellow-400'
            }`}>
              {monster.rarity}
            </span>
          </p>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-red-900 bg-opacity-50 p-3 rounded-lg text-center">
              <Zap className="w-6 h-6 mx-auto mb-2 text-red-400" />
              <p className="font-semibold text-red-400">Attack</p>
              <p className="text-2xl">{monster.attack.toString()}</p>
            </div>
            <div className="bg-blue-900 bg-opacity-50 p-3 rounded-lg text-center">
              <Shield className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className="font-semibold text-blue-400">Defense</p>
              <p className="text-2xl">{monster.defense.toString()}</p>
            </div>
            <div className="bg-green-900 bg-opacity-50 p-3 rounded-lg text-center">
              <Heart className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <p className="font-semibold text-green-400">HP</p>
              <p className="text-2xl">{monster.hp.toString()}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

