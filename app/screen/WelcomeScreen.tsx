
import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

export default function welcomescreen() {
  const router = useRouter();

  const onEmail = () => {
    router.push("/screen/Login");
  };
  const onFacebook = () => {
    console.log("Facebook login pressed — TODO: implement navigation");
  };
  const onGoogle = () => {
    console.log("Google login pressed — TODO: implement navigation");
  };
  const onFindTickets = () => {};

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to Gigagent4u</Text>

        <View style={styles.illustration}>
          <Text style={styles.illustrationText}>Illustration</Text>
        </View>

        <View style={styles.buttons}>
          <Pressable 
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} 
            onPress={onEmail}
          >
            <Ionicons name="mail-outline" size={18} style={styles.icon} />
            <Text style={styles.btnText}>Continue with email address</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} 
            onPress={onFacebook}
          >
            <FontAwesome name="facebook" size={18} style={styles.icon} />
            <Text style={styles.btnText}>Continue with Facebook</Text>
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]} 
            onPress={onGoogle}
          >
            <AntDesign name="google" size={18} style={styles.icon} />
            <Text style={styles.btnText}>Continue with Google</Text>
          </Pressable>
        </View>

        
      </View>
    </SafeAreaView>
  );
}

const BG = "#F5F3F0";
const BORDER = "#DADADA";
const TEXT = "#111";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
    paddingTop: 8,
    justifyContent: "space-between"
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: TEXT,
    marginTop: 48,
    lineHeight: 34,
    textAlign: "center"
  },
  illustration: {
    marginTop: 24,
    height: 220,
    borderRadius: 20,
    backgroundColor: "#E8E6E2",
    alignItems: "center",
    justifyContent: "center"
  },
  illustrationText: {
    color: "#7A7A7A",
    fontSize: 14
  },
  buttons: {
    marginTop: 16,
    gap: 12
  },
  btn: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16
  },
  btnPressed: {
    backgroundColor: "#F0F0F0",
    transform: [{ scale: 0.98 }]
  },
  icon: { marginRight: 12, color: TEXT },
  btnText: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: TEXT,
    marginRight: 28
  },
  link: {
    textAlign: "center",
    marginBottom: 18,
    marginTop: 18,
    fontSize: 14,
    color: "#0A66C2",
    textDecorationLine: "underline"
  }
});

