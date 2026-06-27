import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Mood = {
  id: string;
  emoji: string;
  label: string;
  recommendation: string;
  goal: string;
  level: string;
  duration: string;
};

const moods: Mood[] = [
  {
    id: "happy",
    emoji: "😊",
    label: "Happy",
    recommendation: "Morning Energy Flow",
    goal: "⚡ Morning Energy",
    level: "Beginner",
    duration: "10 min",
  },
  {
    id: "relaxed",
    emoji: "😌",
    label: "Relaxed",
    recommendation: "Mindful Relaxation Flow",
    goal: "😌 Relaxation",
    level: "Beginner",
    duration: "10 min",
  },
  {
    id: "tired",
    emoji: "😴",
    label: "Tired",
    recommendation: "Gentle Stretch Session",
    goal: "🌙 Better Sleep",
    level: "Beginner",
    duration: "5 min",
  },
  {
    id: "stressed",
    emoji: "😟",
    label: "Stressed",
    recommendation: "Stress Relief Practice",
    goal: "🌿 Stress Relief",
    level: "Beginner",
    duration: "10 min",
  },
  {
    id: "energized",
    emoji: "⚡",
    label: "Energized",
    recommendation: "Active Flexibility Flow",
    goal: "🤸 Flexibility",
    level: "Beginner",
    duration: "15 min",
  },
];

export default function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTodayMood();
    }, [])
  );

  const getTodayKey = () => {
    return new Date().toDateString();
  };

  const loadTodayMood = async () => {
    const saved = await AsyncStorage.getItem("today_mood");
    const savedDate = await AsyncStorage.getItem("today_mood_date");

    if (saved && savedDate === getTodayKey()) {
      const mood = moods.find((item) => item.id === saved);
      setSelectedMood(mood || null);
    } else {
      setSelectedMood(null);
    }
  };

  const chooseMood = async (mood: Mood) => {
    await AsyncStorage.setItem("today_mood", mood.id);
    await AsyncStorage.setItem("today_mood_date", getTodayKey());
    setSelectedMood(mood);
  };

  const startRecommendedSession = async () => {
    if (!selectedMood) return;

    setLoading(true);

    try {
      const response = await fetch(
        "https://new-rep-ai.onrender.com/api/generate-yoga-plan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            goal: selectedMood.goal,
            level: selectedMood.level,
            duration: selectedMood.duration,
          }),
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

      const parsedPlan = JSON.parse(cleanedPlan);

      router.push({
        pathname: "/plan",
        params: {
          plan: JSON.stringify(parsedPlan),
        },
      } as any);
    } catch (error) {
      alert("Failed to create recommended session");
      console.error("Recommended session error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedMood) {
    return (
      <View style={styles.recommendationCard}>
        <Text style={styles.smallLabel}>AI Recommendation</Text>

        <Text style={styles.recommendationTitle}>
          {selectedMood.emoji} {selectedMood.recommendation}
        </Text>

        <Text style={styles.recommendationText}>
          Based on how you feel today, this session is designed to support your
          mood and energy.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={startRecommendedSession}
          disabled={loading}
        >
          <Text style={styles.primaryButtonText}>
            {loading ? "Creating session..." : "Start Recommended Session"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.changeButton} onPress={() => setSelectedMood(null)}>
          <Text style={styles.changeText}>Change mood</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>How are you feeling today?</Text>

      <Text style={styles.subtitle}>
        Choose your mood and Yoga Daily AI will suggest a practice for you.
      </Text>

      <View style={styles.moodGrid}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.id}
            style={styles.moodCard}
            onPress={() => chooseMood(mood)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 23,
    fontWeight: "900",
    color: "#2E4A3F",
  },
  subtitle: {
    color: "#555",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    marginBottom: 16,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  moodCard: {
    backgroundColor: "#E7F2EB",
    borderRadius: 20,
    padding: 15,
    width: "30%",
    alignItems: "center",
  },
  moodEmoji: {
    fontSize: 30,
    marginBottom: 6,
  },
  moodLabel: {
    color: "#2E4A3F",
    fontWeight: "900",
    fontSize: 13,
  },
  recommendationCard: {
    backgroundColor: "#FFF7E8",
    borderRadius: 26,
    padding: 20,
    marginBottom: 16,
  },
  smallLabel: {
    color: "#777",
    fontWeight: "800",
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2E4A3F",
  },
  recommendationText: {
    color: "#555",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: "#2E4A3F",
    padding: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  changeButton: {
    alignItems: "center",
    marginTop: 14,
  },
  changeText: {
    color: "#2E4A3F",
    fontWeight: "800",
  },
});