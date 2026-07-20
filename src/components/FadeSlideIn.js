import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Componente reutilizable de entrada animada.
 * Hace un fade (opacity 0 → 1) + deslizamiento suave (translateY 24 → 0)
 * con un spring sutil. Acepta `delay` (ms) para crear entradas escalonadas
 * (stagger) entre tarjetas/secciones.
 *
 * Solo usa transform/opacity, por lo que corre 100% en el hilo nativo
 * (useNativeDriver: true).
 */
export default function FadeSlideIn({ children, delay = 0, distance = 24, duration = 450, style, ...rest }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [opacity, translateY, delay, duration]);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]} {...rest}>
      {children}
    </Animated.View>
  );
}
