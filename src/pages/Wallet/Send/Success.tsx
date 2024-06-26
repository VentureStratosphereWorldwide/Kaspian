import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function Submit ({ ids }: {
  ids: string[]
}) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Success!</DialogTitle>
        <DialogDescription>
          Your transaction is being processed and verified by the miners.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="link" className={"dark:text-white font-bold"} onClick={() => {
          window.open(`https://explorer.kaspa.org/txs/${ids[0]}`)
        }}>View it on the explorer</Button>
      </DialogFooter>
    </DialogContent>
  )
}
