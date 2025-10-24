import { ReactNode } from "react";
import { PetPawLoading } from "@/components/loading/PetPawLoading";

interface LoadingContainerProps {
  children: ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
}

export function LoadingContainer({ 
  children, 
  isLoading = false, 
  loadingMessage = "Loading..." 
}: LoadingContainerProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <PetPawLoading message={loadingMessage} size="md" />
      </div>
    );
  }

  return <>{children}</>;
}
