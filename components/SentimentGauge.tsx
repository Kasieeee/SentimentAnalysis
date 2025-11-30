import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SentimentGaugeProps {
  score: number; // -100 to 100
  classification: string;
}

export const SentimentGauge: React.FC<SentimentGaugeProps> = ({ score, classification }) => {
  // Normalize score to 0-100 for the gauge portion (though we display raw score)
  // 0 = -100, 50 = 0, 100 = 100
  const normalizedValue = (score + 100) / 2;

  const data = [
    { name: 'Score', value: normalizedValue },
    { name: 'Remaining', value: 100 - normalizedValue },
  ];

  // Determine color based on score
  let color = '#94a3b8'; // Neutral gray
  if (score > 25) color = '#10b981'; // Green
  if (score < -25) color = '#f43f5e'; // Red
  if (score >= -25 && score <= 25) color = '#3b82f6'; // Blue for neutral/balanced

  const startAngle = 180;
  const endAngle = 0;

  return (
    <div className="relative h-64 w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="70%"
            startAngle={startAngle}
            endAngle={endAngle}
            innerRadius={80}
            outerRadius={110}
            paddingAngle={0}
            dataKey="value"
            stroke="none"
          >
            <Cell key="cell-0" fill={color} />
            <Cell key="cell-1" fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-4xl font-bold font-mono tracking-tighter" style={{ color }}>
          {score > 0 ? '+' : ''}{score}
        </p>
        <p className="text-sm text-gray-400 font-medium uppercase tracking-widest mt-1">
          {classification}
        </p>
      </div>
    </div>
  );
};
