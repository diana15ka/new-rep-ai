import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Exercise = {
  name: string;
  time: string;
  instruction: string;
  benefit: string;
};

type YogaPlan = {
  title: string;
  goal: string;
  level: string;
  duration: string;
  exercises: Exercise[];
  breathingTip: string;
  safetyNote: string;
};

export default function GenerateScreen() {
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const goals = [
    "😌 Relaxation",
    "🤸 Flexibility",
    "🌙 Better Sleep",
    "⚡ Morning Energy",
    "🦴 Back Comfort",
    "🌿 Stress Relief",
  ];

  const levels = ["Beginner", "Intermediate", "Advanced"];
  const durations = ["5 min", "10 min", "15 min", "20 min", "30 min"];

  const navigate = (pathname: string, params?: any) => {
    router.push({ pathname, params } as any);
  };

  useFocusEffect(
    useCallback(() => {
      loadPremiumStatus();
    }, [])
  );

  const loadPremiumStatus = async () => {
    const premium = await AsyncStorage.getItem("is_premium");
    setIsPremium(premium === "true");
  };

  const generatePlan = async () => {
    if (!isPremium) {
      navigate("/premium");
      return;
    }

    if (!goal || !level || !duration) {
      alert("Please choose goal, level and duration");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://new-rep-ai.onrender.com/api/generate-yoga-plan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ goal, level, duration }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Backend error");
      }

      const cleanedPlan = data.plan
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsedPlan: YogaPlan = JSON.parse(cleanedPlan);

      navigate("/plan", {
        plan: JSON.stringify(parsedPlan),
      });
    } catch (error) {
      alert("Failed to create session");
      console.error("Create session error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>✨</Text>
        <Text style={styles.title}>Create Your Session</Text>
        <Text style={styles.subtitle}>
          Let Yoga Daily AI build a personalized practice based on your goal,
          experience, and available time.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>What would you like today?</Text>

        {goals.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.option, goal === item && styles.selectedOption]}
            onPress={() => setGoal(item)}
          >
            <Text style={[styles.optionText, goal === item && styles.selectedText]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Experience</Text>

        <View style={styles.pillRow}>
          {levels.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.pill, level === item && styles.selectedPill]}
              onPress={() => setLevel(item)}
            >
              <Text style={[styles.pillText, level === item && styles.selectedText]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>How much time do you have?</Text>

        <View style={styles.pillRow}>
          {durations.map((item) => (
            <TouchableOpacity
              key={item}
              style={[styles.pill, duration === item && styles.selectedPill]}
              onPress={() => setDuration(item)}
            >
              <Text style={[styles.pillText, duration === item && styles.selectedText]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.generateButton, !isPremium && styles.lockedButton]}
        onPress={generatePlan}
      >
        <Text style={styles.generateText}>
          {loading
            ? "Creating your session..."
            : isPremium
              ? "✨ Create My Session"
              : "Unlock Premium to Create"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back Home</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Wellness guidance only. Not medical advice.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EE", padding: 18 },
  header: {
    backgroundColor: "#2E4A3F",
    borderRadius: 28,
    padding: 24,
    marginTop: 55,
    marginBottom: 18,
  },
  headerIcon: { fontSize: 42, marginBottom: 10 },
  title: { fontSize: 32, fontWeight: "900", color: "#FFFFFF" },
  subtitle: {
    color: "#DDEBE3",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 14,
    color: "#2E4A3F",
  },
  option: {
    backgroundColor: "#E7F2EB",
    padding: 16,
    borderRadius: 17,
    marginBottom: 12,
  },
  selectedOption: { backgroundColor: "#2E4A3F" },
  optionText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E4A3F",
  },
  selectedText: { color: "#FFFFFF" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  pill: {
    backgroundColor: "#E7F2EB",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  selectedPill: { backgroundColor: "#2E4A3F" },
  pillText: { color: "#2E4A3F", fontWeight: "800" },
  generateButton: {
    backgroundColor: "#2E4A3F",
    padding: 18,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 4,
  },
  lockedButton: { backgroundColor: "#A8842C" },
  generateText: { color: "#FFFFFF", fontSize: 18, fontWeight: "900" },
  backButton: { alignItems: "center", marginTop: 18 },
  backText: { color: "#2E4A3F", fontWeight: "800", fontSize: 16 },
  footer: {
    textAlign: "center",
    color: "#777",
    marginTop: 24,
    marginBottom: 40,
    fontSize: 12,
  },
});