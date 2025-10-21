import React from "react";

const ChartCircle = ({ value }) => {
  const radius = 18;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const percent = Math.min(Math.max(value, 0), 100);
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#e6e6e6"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#4caf50"
        fill="transparent"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".3em"
        fontSize="9px"
        fill="#333"
        fontWeight="bold">
        {value}%
      </text>
    </svg>
  );
};

export default ChartCircle;
