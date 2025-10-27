import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function ConfirmDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  title = "Delete Confirmation",
  description = "Are you sure you want to delete this item?",
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-ink">{title}</DialogTitle>
          <hr className="border-gray-400"/>
          <DialogDescription className="text-ink/80">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button variant="outline" className="rounded-full px-6 py-2 text-brand bg-brand-bg hover:bg-orange-2 border-0">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="rounded-full px-6 py-2 bg-brand text-brand-text hover:bg-brand-dark"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
