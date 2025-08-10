import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

export default function LocationSearch() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.text}>Location search (coming soon)</Text>
      </View>
    </SafeAreaView>
  );
}

const BG = "#F5F3F0";
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { color: "#374151" },
});
