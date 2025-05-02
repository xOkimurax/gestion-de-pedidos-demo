import React from "react";
import { Progress } from "./progress";

interface UploadProgressProps {
  current: number;
  total: number;
  label?: string;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ current, total, label }) => {
  const progress = Math.round((current / total) * 100);
  
  return (
    <div className="w-full space-y-2">
      {label && <p className="text-sm text-muted-foreground">{label}</p>}
      <Progress value={progress} className="w-full" />
      <p className="text-sm text-muted-foreground text-right">{progress}%</p>
    </div>
  );
};