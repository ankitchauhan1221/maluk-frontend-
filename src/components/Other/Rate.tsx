import React from "react";
import * as Icon from "@phosphor-icons/react/dist/ssr";

interface RateProps {
  currentRate: number | undefined;
  size: number;
  onRate?: (rating: number) => void; // Added optional callback for interactivity
}

const Rate: React.FC<RateProps> = ({ currentRate, size, onRate }) => {
  const arrOfStar = [];
  for (let i = 0; i < 5; i++) {
    const ratingValue = i + 1; // Rating starts at 1, not 0
    const isFilled = currentRate !== undefined && ratingValue <= currentRate;

    arrOfStar.push(
      <Icon.Star
        key={i}
        size={size}
        color={isFilled ? "#ECB018" : "#9FA09C"} // Gold for filled, gray for empty
        weight="fill"
        onClick={onRate ? () => onRate(ratingValue) : undefined} // Enable click if onRate exists
        style={{ cursor: onRate ? "pointer" : "default" }} // Show pointer cursor if interactive
      />
    );
  }

  return <div className="rate flex">{arrOfStar}</div>;
};

export default Rate;