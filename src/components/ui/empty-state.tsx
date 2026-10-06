
import * as React from "react";
import { Button } from "./button";
import { Link } from "react-router-dom";
import { FileX, AlertTriangle, Info } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  icon?: React.ReactNode;
  variant?: "default" | "error" | "warning" | "info";
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionLink,
  icon,
  variant = "default"
}: EmptyStateProps) {
  const getIcon = () => {
    if (icon) return icon;
    
    switch (variant) {
      case "error":
        return <FileX className="h-12 w-12" />;
      case "warning":
        return <AlertTriangle className="h-12 w-12" />;
      case "info":
        return <Info className="h-12 w-12" />;
      default:
        return <FileX className="h-12 w-12" />;
    }
  };
  
  const getIconClass = () => {
    switch (variant) {
      case "error":
        return "text-destructive";
      case "warning":
        return "text-amber-500";
      case "info":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-lg bg-background/50">
      <div className={`mb-4 ${getIconClass()}`}>{getIcon()}</div>
      <h3 className="mb-2 text-lg font-medium text-foreground">{title}</h3>
      <p className="mb-6 text-muted-foreground max-w-md">{description}</p>
      {actionLabel && actionLink && (
        <Button variant="outline" asChild>
          <Link to={actionLink}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
