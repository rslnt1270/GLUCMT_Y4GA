import React, { useRef } from 'react';
import { Animated, TouchableOpacity } from 'react-native';

/**
 * Wrapper de TouchableOpacity con feedback táctil profesional:
 * hace un scale 1 → 0.96 al presionar (Animated.spring en onPressIn/onPressOut).
 *
 * - `style` se aplica al contenedor animado (acepta flex, márgenes, sombras, etc.).
 * - Si `disabled` es true, se atenúa con opacidad para consistencia visual.
 * - Solo anima transform/opacity con useNativeDriver: true.
 */
export default function PressableScale({
  children,
  style,
  onPressIn,
  onPressOut,
  activeOpacity = 0.85,
  scaleTo = 0.96,
  disabled = false,
  ...rest
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (event) => {
    Animated.spring(scale, {
      toValue: scaleTo,
      speed: 40,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
    if (onPressIn) onPressIn(event);
  };

  const handlePressOut = (event) => {
    Animated.spring(scale, {
      toValue: 1,
      speed: 40,
      bounciness: 4,
      useNativeDriver: true,
    }).start();
    if (onPressOut) onPressOut(event);
  };

  return (
    <Animated.View style={[style, disabled && { opacity: 0.5 }, { transform: [{ scale }] }]}>
      <TouchableOpacity
        activeOpacity={activeOpacity}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}
