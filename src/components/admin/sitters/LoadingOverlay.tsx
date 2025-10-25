import { PetPawLoading } from "@/components/loading/PetPawLoading";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message = "Loading Details..." }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <PetPawLoading message={message} size="md" />
    </div>
  );
}
