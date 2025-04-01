import { Loader2 } from "lucide-react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  isLoading?: boolean;
}

export function AuthHeader({ title, subtitle, isLoading }: AuthHeaderProps) {
  return (
    <div className="space-y-4 text-center pb-2">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {isLoading && (
        <div className="flex items-center justify-center gap-2 text-sm text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Please wait...</span>
        </div>
      )}
    </div>
  );
}
