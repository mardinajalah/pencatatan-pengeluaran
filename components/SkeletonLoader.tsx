import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

const SkeletonLoader = () => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.sequence([Animated.timing(shimmer, { toValue: 1, duration: 1000, useNativeDriver: true }), Animated.timing(shimmer, { toValue: 0, duration: 1000, useNativeDriver: true })])).start();
  }, [shimmer]);

  const backgroundColor = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#f5f5f5'],
  });

  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 64 }}>
      {/* Header */}
      <Animated.View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Animated.View style={{ width: 180, height: 28, borderRadius: 6, backgroundColor }} />
        <Animated.View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor }} />
      </Animated.View>

      {/* Saldo */}
      <Animated.View
        style={{
          width: '100%',
          height: 80,
          borderRadius: 16,
          backgroundColor,
          marginBottom: 24,
        }}
      />

      {/* Filter Bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
        <Animated.View style={{ width: 120, height: 20, borderRadius: 6, backgroundColor }} />
        <Animated.View style={{ width: 180, height: 20, borderRadius: 6, backgroundColor }} />
      </View>

      {/* Card transaksi */}
      {[...Array(4)].map((_, i) => (
        <Animated.View
          key={i}
          style={{
            width: '100%',
            height: 100,
            borderRadius: 12,
            backgroundColor,
            marginBottom: 16,
          }}
        />
      ))}
    </View>
  );
};

export default SkeletonLoader;
