import React from "react";

interface ProgressBarProps {
  value: number;
  maxValue: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, maxValue }) => {
  const progressPercentage = (value / maxValue) * 100;

  return (
    <div className="h-1 w-full bg-gray">
      <div
        style={{ width: `${progressPercentage}%` }}
        className={`h-full ${progressPercentage < 70 ? "bg-red" : "bg-green"}`}
      ></div>
    </div>
  );
};

export default ProgressBar;
