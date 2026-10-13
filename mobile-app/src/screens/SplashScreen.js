import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { colors, spacing } from '../styles/theme';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  // Animation drivers
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringScale = useRef(new Animated.Value(0.8)).current;
  const ringOpacity = useRef(new Animated.Value(0.7)).current;

  const titleFade = useRef(new Animated.Value(0)).current;
  const titleTranslate = useRef(new Animated.Value(25)).current;

  const taglineFade = useRef(new Animated.Value(0)).current;
  const progressWidth = useRef(new Animated.Value(0)).current;
  const badgeFade = useRef(new Animated.Value(0)).current;

  const containerFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 1. Logo spring and fade in
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Glowing pulse ring loop
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 1.35,
            duration: 1400,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0,
            duration: 1400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringScale, {
            toValue: 0.9,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    // 3. Title & Tagline stagger
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(titleFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(titleTranslate, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(taglineFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(badgeFade, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 4. Progress bar fill
    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 2600,
      useNativeDriver: false,
    }).start();

    // 5. Automatic transition to Main app
    const timer = setTimeout(() => {
      handleComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleComplete = () => {
    navigation.replace('Main');
  };

  const progressInterpolate = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: containerFade }]}>
      <StatusBar barStyle="light-content" backgroundColor="#064e3b" />

      {/* Ambient background glow */}
      <View style={styles.ambientTopGlow} />
      <View style={styles.ambientBottomGlow} />

      {/* Skip button in top corner */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleComplete} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip →</Text>
      </TouchableOpacity>

      <View style={styles.centerContent}>
        {/* Animated App Icon & Glow Ring */}
        <View style={styles.iconWrapper}>
          <Animated.View
            style={[
              styles.pulseRing,
              {
                transform: [{ scale: ringScale }],
                opacity: ringOpacity,
              },
            ]}
          />

          <Animated.View
            style={[
              styles.logoCard,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image
              source={require('../assets/icon.png')}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </Animated.View>
        </View>

        {/* Animated App Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleFade,
              transform: [{ translateY: titleTranslate }],
            },
          ]}
        >
          <View style={styles.titleRow}>
            <Text style={styles.appName}>PantryPal</Text>
            <Text style={styles.titleLeaf}>🌱</Text>
          </View>

          <Text style={styles.appTagline}>
            Smart Grocery Delivery • Zero Food Waste
          </Text>
        </Animated.View>

        {/* Feature Badges Row */}
        <Animated.View style={[styles.badgesRow, { opacity: badgeFade }]}>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>⚡ Fast Delivery</Text>
          </View>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>⏱️ Smart Expiry</Text>
          </View>
          <View style={styles.badgePill}>
            <Text style={styles.badgeText}>🏠 Household Pantry</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom Loading Progress Bar */}
      <View style={styles.footer}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressInterpolate,
              },
            ]}
          />
        </View>
        <Text style={styles.footerNote}>Preparing fresh pantry catalog...</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#064e3b', // Deep organic forest emerald
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xl * 1.5,
  },
  ambientTopGlow: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.2,
    width: width * 1.4,
    height: height * 0.45,
    backgroundColor: '#047857',
    borderRadius: 300,
    opacity: 0.45,
  },
  ambientBottomGlow: {
    position: 'absolute',
    bottom: -height * 0.15,
    right: -width * 0.2,
    width: width * 1.3,
    height: height * 0.45,
    backgroundColor: '#0f766e',
    borderRadius: 300,
    opacity: 0.35,
  },
  skipBtn: {
    alignSelf: 'flex-end',
    marginRight: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    zIndex: 10,
  },
  skipText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: spacing.xl,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  pulseRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: '#34d399',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
  },
  logoCard: {
    width: 120,
    height: 120,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 14,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appName: {
    fontSize: 38,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  titleLeaf: {
    fontSize: 28,
    marginLeft: 6,
  },
  appTagline: {
    fontSize: 14,
    color: '#a7f3d0',
    marginTop: 6,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.md,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  badgeText: {
    color: '#e6fffa',
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    width: '80%',
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 3,
  },
  footerNote: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 4,
  },
});

export default SplashScreen;
