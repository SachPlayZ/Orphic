import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import Image from 'next/image'

interface DialogBoxProps {
  collectible: {
    name: string
    image: string
    rarity: string
    hp: string
  } | null
  isOpen: boolean
  onClose: () => void
}

export default function DialogBox({ collectible, isOpen, onClose }: DialogBoxProps) {
  if (!collectible) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{collectible.name}</DialogTitle>
        </DialogHeader>
        <div className="relative h-64 w-full mb-4">
          <Image
            src={collectible.image}
            alt={collectible.name}
            layout="fill"
            objectFit="cover"
            className="rounded-lg"
          />
        </div>
        <DialogDescription className="text-gray-300">
          <p className="mb-2"><span className="font-semibold">Rarity:</span> <span className="capitalize">{collectible.rarity}</span></p>
          <p><span className="font-semibold">Description:</span> {collectible.hp}</p>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

