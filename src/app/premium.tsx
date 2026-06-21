import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PremiumScreen() {
  const unlockPremiumForTesting = async () => {
    await AsyncStorage.setItem("is_premium", "true");
    alert("Premium unlocked for testing. Later this button will use Google Play Billing.");
    router.replace("/");
  };

  const resetPremiumForTesting = async () => {
    await AsyncStorage.removeItem("is_premium");
    alert("Premium reset for testing.");
    router.replace("/");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.icon}>⭐</Text>
        <Text style={styles.title}>Yoga Daily AI Premium</Text>
        <Text style={styles.subtitle}>
          Unlock AI yoga sessions, voice guidance, progress analytics, and your personal AI coach.
        </Text>
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.price}>$4.99</Text>
        <Text style={styles.period}>per month</Text>
      </View>

      <View style={styles.featuresCard}>
        <Feature text="Unlimited AI yoga sessions" />
        <Feature text="AI Coach Chat" />
        <Feature text="Voice-guided workouts" />
        <Feature text="Advanced progress analytics" />
        <Feature text="Daily streaks and achievements" />
        <Feature text="Sleep and relaxation programs" />
      </View>

      <TouchableOpacity style={styles.button} onPress={unlockPremiumForTesting}>
        <Text style={styles.buttonText}>Upgrade to Premium</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Testing mode: this unlocks Premium locally. Later we will replace it with RevenueCat / Google Play Billing.
      </Text>

      <TouchableOpacity style={styles.resetButton} onPress={resetPremiumForTesting}>
        <Text style={styles.resetText}>Reset Premium Test</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <View style={styles.featureRow}>
      <Text style={styles.check}>✓</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
    padding: 20,
  },
  hero: {
    backgroundColor: "#2E4A3F",
    borderRadius: 28,
    padding: 26,
    marginTop: 60,
    alignItems: "center",
  },
  icon: {
    fontSize: 58,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#DDEBE3",
    marginTop: 10,
    textAlign: "center",
    lineHeight: 24,
  },
  priceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginTop: 20,
  },
  price: {
    fontSize: 48,
    fontWeight: "900",
    color: "#2E4A3F",
  },
  period: {
    fontSize: 16,
    color: "#777",
    marginTop: 4,
  },
  featuresCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  check: {
    backgroundColor: "#E7F2EB",
    color: "#2E4A3F",
    fontWeight: "900",
    fontSize: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: "center",
    lineHeight: 28,
    marginRight: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#2E4A3F",
    fontWeight: "700",
    flex: 1,
  },
  button: {
    backgroundColor: "#2E4A3F",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  note: {
    color: "#777",
    fontSize: 13,
    textAlign: "center",
    marginTop: 14,
    lineHeight: 20,
  },
  resetButton: {
    backgroundColor: "#E7F2EB",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 14,
  },
  resetText: {
    color: "#2E4A3F",
    fontWeight: "800",
  },
  backButton: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  backText: {
    color: "#2E4A3F",
    fontSize: 16,
    fontWeight: "800",
  },
});