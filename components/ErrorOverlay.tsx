import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface ErrorOverlayProps {
  messages: string[]; // one or multiple error messages
  onHide?: () => void;
}

export default function ErrorOverlay({ messages, onHide }: ErrorOverlayProps) {
  const slideAnim = useRef(new Animated.Value(-300)).current; // off-screen to the left

  useEffect(() => {
    if (messages.length) {
      // Slide in
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280, // standard duration
        useNativeDriver: true,
      }).start();

      // Auto hide after 4 seconds
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -300,
          duration: 280,
          useNativeDriver: true,
        }).start(() => {
          if (onHide) onHide();
        });
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [messages]);

  if (!messages.length) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        { transform: [{ translateX: slideAnim }] },
      ]}
    >
      <Ionicons name="alert-circle" size={20} color="#fff" style={styles.icon} />
      <View style={styles.textContainer}>
        {messages.map((msg, idx) => (
          <Text key={idx} style={styles.message}>
            • {msg}
          </Text>
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 40, // very top of the screen, above header/title
    left: 20,
    right: 20,
    backgroundColor: "#EF4444", // red
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 999, // ensure it stays on top of everything
  },
  icon: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  message: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
