import { useId } from 'react';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

export default function CalendarBottomFade() {
  const id = useId();

  return (
    <Svg width="100%" height="100%">
      <Defs>
        <LinearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="white" stopOpacity={0} />
          <Stop offset="0.5" stopColor="white" stopOpacity={0.85} />
          <Stop offset="1" stopColor="white" stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
