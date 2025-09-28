import React, { JSX, useEffect, useRef } from "react";
import { View, Animated, Dimensions, Image, Easing, StyleSheet } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width: W } = Dimensions.get("window");
const CLOUD_W = 160; // used when calculating off-screen positions
const NUM_CLOUDS = 4; // tuned so it doesn't feel crowded
const NUM_STARS = 18;

type CloudState = {
  id: number;
  x: Animated.Value;
  y: number;
  opacity: number;
  scale: number;
  anim: Animated.CompositeAnimation | null;
};

export default function BackgroundSky({ isNight }: { isNight: boolean }): JSX.Element {
  // clouds state (created once)
  const cloudsRef = useRef<CloudState[]>(
    Array.from({ length: NUM_CLOUDS }).map((_, i) => {
      // give each cloud a randomized starting x (so they don't all snap to same spot on mount)
      const initX = Math.random() * W - (CLOUD_W + Math.random() * 300);
      const y = 12 + i * 18 + Math.random() * 36; // spread vertically
      const opacity = 0.35 + Math.random() * 0.55; // 0.35 - 0.9
      const scale = 0.85 + Math.random() * 0.5; // 0.85 - 1.35
      return {
        id: i,
        x: new Animated.Value(initX),
        y,
        opacity,
        scale,
        anim: null,
      };
    })
  ).current;

  // stars (Animated.Value array) - seeded once
  const starsRef = useRef<Animated.Value[]>([]);
  if (starsRef.current.length === 0) {
    for (let i = 0; i < NUM_STARS; i++) {
      starsRef.current.push(new Animated.Value(0.4 + Math.random() * 0.6));
    }
  }

  // timers (for setTimeout) so we can clear them on unmount
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // animate a single cloud from off-right -> off-left, then restart with small gap
    const animateCloud = (c: CloudState) => {
      if (!mountedRef.current) return;

      const startX = W + 40 + Math.random() * (W * 0.6); // start off to the right
      const endX = -CLOUD_W - 40 - Math.random() * 80; // finish off to the left
      c.x.setValue(startX);

      const minDuration = 22000; // ms
      const maxDuration = 52000; // ms
      const duration = minDuration + Math.random() * (maxDuration - minDuration);

      const anim = Animated.timing(c.x, {
        toValue: endX,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      });

      c.anim = anim;
      anim.start(({ finished }) => {
        if (!mountedRef.current) return;
        if (finished) {
          // small randomized gap before restarting so clouds don't repeat visibly
          const gap = 300 + Math.random() * 1400;
          const t = setTimeout(() => {
            if (mountedRef.current) animateCloud(c);
          }, gap);
          timersRef.current.push(t);
        }
      });
    };

    // start clouds with small stagger so they don't all start same frame
    cloudsRef.forEach((c, i) => {
      const initialDelay = Math.floor(i * 380 + Math.random() * 800);
      const t = setTimeout(() => {
        if (mountedRef.current) animateCloud(c);
      }, initialDelay);
      timersRef.current.push(t);
    });

    // stars twinkle (each star loops between two opacities)
    const starAnims: Animated.CompositeAnimation[] = starsRef.current.map((star) => {
      const low = 0.15 + Math.random() * 0.25;
      const high = 0.6 + Math.random() * 0.4;
      const dur1 = 900 + Math.random() * 1200;
      const dur2 = 1000 + Math.random() * 1600;
      const loopAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(star, {
            toValue: low,
            duration: dur1,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(star, {
            toValue: high,
            duration: dur2,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );

      // stagger star starts slightly so they desync
      const startDelay = 200 + Math.random() * 1200;
      const t = setTimeout(() => loopAnim.start(), startDelay);
      timersRef.current.push(t);
      return loopAnim;
    });

    // cleanup
    return () => {
      mountedRef.current = false;
      // stop cloud animations
      cloudsRef.forEach((c) => {
        try {
          c.anim?.stop();
        } catch (e) {
          // ignore
        }
      });
      // stop star animations
      try {
        starAnims.forEach((a) => a.stop());
      } catch (e) {}
      // clear timers
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
    // run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={{ height: 180, overflow: "hidden", marginBottom: 8 }}>
      {/* sky background */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: isNight ? "#021024" : "#DFF7FF" }]} />

      {/* twinkling stars at night */}
      {isNight &&
        starsRef.current.map((star, i) => (
          <Animated.View
            key={i}
            style={{
              position: "absolute",
              left: (i * 73) % W,
              top: (i * 37) % 140,
              width: 2,
              height: 2,
              borderRadius: 1,
              backgroundColor: "#fff",
              opacity: star,
            }}
          />
        ))}

      {/* clouds (each cloud animates independently) */}
      {cloudsRef.map((c) => (
        <Animated.View
          key={c.id}
          style={{
            position: "absolute",
            top: c.y,
            transform: [{ translateX: c.x }, { scale: c.scale }],
            opacity: c.opacity,
          }}
        >
          <Cloud width={CLOUD_W} />
        </Animated.View>
      ))}

      {/* sun / moon - replace with your Flaticon images or PNGs in the project */}
      <View style={{ position: "absolute", top: 20, left: 24 }}>
        <Image
          source={
            isNight
              ? require("../../../../../assets/weather/moon.png") // <- add moon.png in this path
              : require("../../../../../assets/weather/sun.png") // <- add sun.png in this path
          }
          style={{ width: 72, height: 72, resizeMode: "contain" }}
        />
      </View>
    </View>
  );
}

function Cloud({ width = CLOUD_W, height = 70 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 64 32" style={{ overflow: "visible" }}>
      <Path
        d="M20 11c0-4.418 3.582-8 8-8 3.046 0 5.657 1.76 7 4.344C36.688 7.898 39.16 7 42 7c5 0 9 4 9 9 0 .33-.02.656-.057.98A7 7 0 0 1 51 28H18c-4.418 0-8-3.582-8-8s3.582-8 8-8h2z"
        fill="#ffffff"
        opacity={0.95}
      />
      {/* sub-shadow for softness */}
      <Path d="M18 24 C 28 30, 44 30, 54 24 L 54 26 C 44 32, 28 32, 18 26 Z" fill="#ffffff" opacity={0.08} />
    </Svg>
  );
}
