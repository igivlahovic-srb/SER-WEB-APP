import React from "react";
import Svg, { Text as SvgText } from "react-native-svg";

interface LaFantanaLogoWhiteProps {
  width?: number;
  height?: number;
}

export default function LaFantanaLogoWhite({
  width = 120,
  height = 120
}: LaFantanaLogoWhiteProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 512 512">
      {/* White text "LA FANTANA" */}
      <SvgText
        x="256"
        y="220"
        fontFamily="Arial, sans-serif"
        fontSize="52"
        fontWeight="bold"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        LA FANTANA
      </SvgText>

      {/* White text "WHS" */}
      <SvgText
        x="256"
        y="280"
        fontFamily="Arial, sans-serif"
        fontSize="42"
        fontWeight="bold"
        fill="#FFFFFF"
        textAnchor="middle"
      >
        WHS
      </SvgText>

      {/* White text "SERVISNI MODUL" (smaller) */}
      <SvgText
        x="256"
        y="320"
        fontFamily="Arial, sans-serif"
        fontSize="24"
        fontWeight="normal"
        fill="#E0E0E0"
        textAnchor="middle"
      >
        SERVISNI MODUL
      </SvgText>
    </Svg>
  );
}
