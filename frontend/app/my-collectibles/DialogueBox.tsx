import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
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
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {monster.name}
          </DialogTitle>
        </DialogHeader>
        <div className="relative h-64 w-full mb-4">
          <Image
            src={monster.tokenURI}
            alt={monster.name}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
        <DialogDescription className="text-gray-300">
          <p className="mb-2">
            <span className="font-semibold">Rarity:</span>{" "}
            <span className="capitalize">{monster.rarity}</span>
          </p>
          <p className="mb-2">
            <span className="font-semibold">Attack:</span> {monster.attack.toString()}
          </p>
          <p className="mb-2">
            <span className="font-semibold">Defense:</span> {monster.defense.toString()}
          </p>
          <p>
            <span className="font-semibold">HP:</span> {monster.hp.toString()}
          </p>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
