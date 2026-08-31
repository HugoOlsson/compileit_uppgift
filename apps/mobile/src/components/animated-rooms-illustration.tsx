import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ROOMS = [
  { height: 63.4262, width: 62.5806, x: 65.2719, y: 86.414 },
  { height: 62.5806, width: 83.7226, x: 65.2719, y: 150.686 },
  { height: 62.5806, width: 62.5806, x: 150.686, y: 1 },
  { height: 63.4262, width: 62.5806, x: 150.686, y: 150.686 },
  { height: 63.4262, width: 41.4385, x: 1, y: 1 },
] as const;

type AnimatedRoomProps = (typeof ROOMS)[number] & {
  isAvailable: boolean;
};

function AnimatedRoom({ height, isAvailable, width, x, y }: AnimatedRoomProps) {
  const [availability] = useState(() => new Animated.Value(isAvailable ? 1 : 0));

  useEffect(() => {
    const animation = Animated.timing(availability, {
      duration: 150,
      toValue: isAvailable ? 1 : 0,
      useNativeDriver: false,
    });

    animation.start();
    return () => animation.stop();
  }, [availability, isAvailable]);

  const backgroundColor = availability.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 0, 4, 0.2)', 'rgba(51, 255, 0, 0.2)'],
  });

  return (
    <Animated.View
      style={{
        backgroundColor,
        height,
        left: x,
        position: 'absolute',
        top: y,
        width,
      }}
    />
  );
}

export default function AnimatedRoomsIllustration() {
  const [roomAvailability, setRoomAvailability] = useState<boolean[]>([
    true,
    true,
    false,
    false,
    true,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoomAvailability(ROOMS.map(() => Math.random() < 0.5));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {ROOMS.map((room, index) => (
        <AnimatedRoom
          {...room}
          isAvailable={roomAvailability[index]}
          key={`${room.x}-${room.y}`}
        />
      ))}

      <Svg height={216} style={styles.frame} viewBox="0 0 215 216" width={215}>
        <Path
          d="M42.9355 107.556H1V64.6621M213.633 127.286V64.1429M1 64.6621V1H42.9355M1 64.6621H21.2089M42.9355 1V64.6621M42.9355 1H150.37M106.677 214.112H64.5822V150.091M128.883 127.206V86.0692H64.5822V150.091M64.5822 150.091H128.883M128.883 214.112H149.891M172.097 150.091H213.633V214.112H149.891M149.891 214.112V150.091M213.633 64.1429V1H150.37M213.633 64.1429H150.37M150.37 1V42.4562"
          fill="none"
          stroke="black"
          strokeOpacity={0.47}
          strokeWidth={2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 216,
    position: 'relative',
    width: 215,
  },
  frame: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
