import React from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

interface RangeSliderProps {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min,
  max,
  value,
  onChange,
}) => {
  return (
    <div className="w-full px-4 py-2">
      <Slider
        range
        min={min}
        max={max}
        value={value}
        onChange={(val) => onChange(val as [number, number])}
        trackStyle={[{ backgroundColor: "#3b82f6", height: 6 }]}
        handleStyle={[
          { borderColor: "#3b82f6", height: 20, width: 20 },
          { borderColor: "#3b82f6", height: 20, width: 20 },
        ]}
        railStyle={{ backgroundColor: "#d1d5db", height: 6 }}
      />
      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>{value[0]}</span>
        <span>{value[1]}</span>
      </div>
    </div>
  );
};

export default RangeSlider;
