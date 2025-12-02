// useMotionSteps.ts - STEP COUNT UPDATES EVERY 5 SECONDS

import { useEffect, useRef, useState } from "react";
import {
  accelerometer,
  SensorTypes,
  setUpdateIntervalForType,
} from "react-native-sensors";
import { map } from "rxjs/operators";

export interface StepInterval {
  timestamp: number;
  steps: number;
  distance: number;
  calories: number;
}

export default function useMotionSteps() {
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);
  const [activeTime, setActiveTime] = useState(0);

  const [stepHistory, setStepHistory] = useState<StepInterval[]>([]);
  
  // ⭐ ACCUMULATOR REFS - store actual values, update state every 5 sec
  const actualSteps = useRef(0);
  const actualDistance = useRef(0);
  const actualCalories = useRef(0);
  const actualActiveTime = useRef(0);
  
  const intervalSteps = useRef(0);
  const lastIntervalTime = useRef(Date.now());
  const INTERVAL_DURATION = 5 * 1000; // 5 seconds for history

  // Pedometer parameters
  const stepLength = 0.5;
  const caloriePerStep = 0.04;

  const MIN_STEP_INTERVAL = 2500; // ms

  // Horizontal gating
  const HORIZONTAL_RATIO_THRESHOLD = 1.2;
  const MIN_HORIZONTAL_ACCEL = 0.35;

  // Shake rejection
  const MAX_TOTAL_ACCEL = 3.5;

  // Dynamic threshold
  const threshold = useRef(0.95);
  const MIN_THRESHOLD = 0.85;
  const MAX_THRESHOLD = 1.15;
  const lastPeak = useRef(0);

  // Gravity filter
  const gravity = useRef({ x: 0, y: 0, z: 0 });
  const alpha = 0.88;

  // Smoothing window
  const window: number[] = [];
  const WINDOW_SIZE = 8;

  // ⭐ TIMER TO UPDATE STATE EVERY 5 SECONDS
  useEffect(() => {
    const updateInterval = setInterval(() => {
      setSteps(actualSteps.current);
      setDistance(actualDistance.current);
      setCalories(actualCalories.current);
      setActiveTime(actualActiveTime.current);
    }, 5000); // Update display every 5 seconds

    return () => clearInterval(updateInterval);
  }, []);

  useEffect(() => {
    setUpdateIntervalForType(SensorTypes.accelerometer, 50);

    const subscription = accelerometer
      .pipe(
        map(({ x, y, z }) => {
          // Low-pass filter for gravity
          gravity.current.x = alpha * gravity.current.x + (1 - alpha) * x;
          gravity.current.y = alpha * gravity.current.y + (1 - alpha) * y;
          gravity.current.z = alpha * gravity.current.z + (1 - alpha) * z;

          // Linear acceleration
          const fx = x - gravity.current.x;
          const fy = y - gravity.current.y;
          const fz = z - gravity.current.z;

          const totalMag = Math.sqrt(fx * fx + fy * fy + fz * fz);

          // Decompose into horizontal vs vertical
          const g = gravity.current;
          const gMag = Math.sqrt(g.x * g.x + g.y * g.y + g.z * g.z) || 1;
          const ux = g.x / gMag;
          const uy = g.y / gMag;
          const uz = g.z / gMag;

          const aParallel = fx * ux + fy * uy + fz * uz;
          const verticalMag = Math.abs(aParallel);

          const aPerpSq = Math.max(totalMag * totalMag - aParallel * aParallel, 0);
          const horizontalMag = Math.sqrt(aPerpSq);

          return { totalMag, horizontalMag, verticalMag };
        })
      )
      .subscribe(({ totalMag, horizontalMag, verticalMag }) => {
        const now = Date.now();

        // Reject extreme spikes
        if (totalMag > MAX_TOTAL_ACCEL) {
          return;
        }

        // Smooth total magnitude
        window.push(totalMag);
        if (window.length > WINDOW_SIZE) window.shift();
        const smoothMag = window.reduce((acc, v) => acc + v, 0) / (window.length || 1);

        // Check horizontal dominance
        const isMostlyHorizontal =
          horizontalMag > MIN_HORIZONTAL_ACCEL &&
          horizontalMag > verticalMag * HORIZONTAL_RATIO_THRESHOLD;

        const timeSinceLastStep = now - lastPeak.current;

        // Step detection logic
        if (
          isMostlyHorizontal &&
          smoothMag > threshold.current &&
          timeSinceLastStep > MIN_STEP_INTERVAL
        ) {
          // Valid step detected
          lastPeak.current = now;

          // Increase threshold VERY slightly
          threshold.current = Math.min(threshold.current * 1.008, MAX_THRESHOLD);

          // ⭐ UPDATE REFS IMMEDIATELY (not state)
          actualSteps.current += 1;
          actualDistance.current += stepLength;
          actualCalories.current += caloriePerStep;
          actualActiveTime.current += 0.3;

          intervalSteps.current += 1;

          // History tracking
          if (now - lastIntervalTime.current >= INTERVAL_DURATION) {
            const newInterval: StepInterval = {
              timestamp: now,
              steps: intervalSteps.current,
              distance: intervalSteps.current * stepLength,
              calories: intervalSteps.current * caloriePerStep,
            };

            setStepHistory((prev) => {
              const updated = [...prev, newInterval];
              return updated.slice(-720); // Keep last hour
            });

            intervalSteps.current = 0;
            lastIntervalTime.current = now;
          }
        } else {
          // Slowly decrease threshold when not stepping
          threshold.current = Math.max(threshold.current * 0.998, MIN_THRESHOLD);
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  return {
    steps, // Updates every 5 seconds
    distance: Number(distance.toFixed(2)),
    calories: Math.round(calories),
    activeTime: Math.round(activeTime),
    stepHistory,
  };
}
