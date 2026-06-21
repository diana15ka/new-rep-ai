import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getPoseImage } from "../../utils/poseImages";

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

export default function HomeScreen() {
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [duration, setDuration] = useState("");
  const [plan, setPlan] = useState<YogaPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const [isPremium, setIsPremium] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);

  const goals = [
    "😌 Relaxation",
    "🤸 Flexibility",
    "🌙 Better Sleep",
    "⚡ Morning Energy",
    "🦴 Back Comfort",
  ];

  const levels = ["Beginner", "Intermediate", "Advanced"];
  const durations = ["5 min", "10 min", "15 min", "20 min", "30 min"];

  useFocusEffect(
    useCallback(() => {
      loadPremiumStatus();
      loadHomeStats();
    }, [])
  );

  const loadPremiumStatus = async () => {
    const premium = await AsyncStorage.getItem("is_premium");
    setIsPremium(premium === "true");
  };

  const parseWorkoutDate = (raw: string) => {
    if (!raw) return "Invalid Date";

    if (raw.includes(".")) {
      const [datePart] = raw.split(",");
      const [day, month, year] = datePart.split(".");

      return new Date(
        Number(year),
        Number(month) - 1,
        Number(day)
      ).toDateString();
    }

    return new Date(raw).toDateString();
  };

  const calculateStreak = (history: any[]) => {
    if (history.length === 0) return 0;

    const uniqueDates = Array.from(
      new Set(
        history
          .map((item: any) => parseWorkoutDate(item.date))
          .filter((date: string) => date !== "Invalid Date")
      )
    );

    let count = 0;
    const today = new Date();

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() - i);

      if (uniqueDates.includes(checkDate.toDateString())) {
        count++;
      } else {
        break;
      }
    }

    return count;
  };

  const calculateBadges = (history: any[], streak: number) => {
    const totalWorkouts = history.length;
    const hasHighCompletion = history.some(
      (item: any) => Number(item.completionPercent || 0) >= 90
    );

    let count = 0;

    if (totalWorkouts >= 1) count++;
    if (streak >= 3) count++;
    if (streak >= 7) count++;
    if (totalWorkouts >= 10) count++;
    if (hasHighCompletion) count++;

    return count;
  };

  const loadHomeStats = async () => {
    const stored = await AsyncStorage.getItem("yoga_history");
    const history = stored ? JSON.parse(stored) : [];

    const streak = calculateStreak(history);
    const badges = calculateBadges(history, streak);

    setTotalSessions(history.length);
    setCurrentStreak(streak);
    setBadgeCount(badges);
  };

  const generatePlan = async () => {
    if (!isPremium) {
      router.push("/premium");
      return;
    }

    if (!goal || !level || !duration) {
      alert("Please choose goal, level and duration");
      return;
    }

    setLoading(true);
    setPlan(null);

    try {
      const response = await fetch("https://new-rep-ai.onrender.com/api/generate-yoga-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, level, duration }),
      });

      const data = await response.json();
      const parsedPlan = JSON.parse(data.plan);
      setPlan(parsedPlan);
    } catch (error) {
      alert("Failed to generate plan");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openAiCoach = () => {
    if (!isPremium) {
      router.push("/premium");
      return;
    }

    router.push("/chat");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🧘‍♀️</Text>
        <Text style={styles.logo}>Yoga Daily AI</Text>
        <Text style={styles.subtitle}>
          Personalized yoga sessions for relaxation, flexibility, sleep, and daily wellness.
        </Text>

        <View style={styles.premiumStatus}>
          <Text style={styles.premiumStatusText}>
            {isPremium ? "✅ Premium Active" : "⭐ Premium Required"}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statCard} onPress={() => router.push("/streak")}>
          <Text style={styles.statNumber}>🔥 {currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => router.push("/history")}>
          <Text style={styles.statNumber}>📈 {totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => router.push("/achievements")}>
          <Text style={styles.statNumber}>🏆 {badgeCount}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCardDark} onPress={openAiCoach}>
          <Text style={styles.quickIcon}>💬</Text>
          <Text style={styles.quickTitleDark}>AI Coach</Text>
          <Text style={styles.quickSubDark}>
            {isPremium ? "Ask for guidance" : "Premium only"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={() => router.push("/dashboard")}>
          <Text style={styles.quickIcon}>📊</Text>
          <Text style={styles.quickTitle}>Dashboard</Text>
          <Text style={styles.quickSub}>View insights</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={() => router.push("/history")}>
          <Text style={styles.quickIcon}>📈</Text>
          <Text style={styles.quickTitle}>History</Text>
          <Text style={styles.quickSub}>Past sessions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.premiumCard}
          onPress={() => router.push("/premium")}
        >
          <Text style={styles.quickIcon}>{isPremium ? "✅" : "⭐"}</Text>
          <Text style={styles.quickTitle}>
            {isPremium ? "Premium Active" : "Premium"}
          </Text>
          <Text style={styles.quickSub}>
            {isPremium ? "All features unlocked" : "Unlock all features"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionMainTitle}>Create your session</Text>
        <Text style={styles.sectionSubtitle}>
          {isPremium
            ? "Choose what your body needs today."
            : "Premium is required to generate AI yoga sessions."}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Goal</Text>

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
        <Text style={styles.sectionTitle}>Level</Text>

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
        <Text style={styles.sectionTitle}>Duration</Text>

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
            ? "Creating your plan..."
            : isPremium
              ? "Generate Yoga Session"
              : "Unlock Premium to Generate"}
        </Text>
      </TouchableOpacity>

      {plan && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>{plan.title}</Text>

          <Text style={styles.resultMeta}>
            {plan.goal} • {plan.level} • {plan.duration}
          </Text>

          {plan.exercises.map((exercise, index) => (
            <View key={index} style={styles.exerciseCard}>
              <Image source={getPoseImage(exercise.name)} style={styles.poseImage} />

              <Text style={styles.exerciseNumber}>Exercise {index + 1}</Text>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <Text style={styles.exerciseTime}>⏱ {exercise.time}</Text>
              <Text style={styles.exerciseText}>{exercise.instruction}</Text>
              <Text style={styles.benefit}>Benefit: {exercise.benefit}</Text>
            </View>
          ))}

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>🌬 Breathing Tip</Text>
            <Text style={styles.exerciseText}>{plan.breathingTip}</Text>
          </View>

          <View style={styles.tipCard}>
            <Text style={styles.tipTitle}>⚠️ Safety Note</Text>
            <Text style={styles.exerciseText}>{plan.safetyNote}</Text>
          </View>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => {
              router.push({
                pathname: "/workout",
                params: { exercises: JSON.stringify(plan.exercises) },
              });
            }}
          >
            <Text style={styles.startText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.footer}>Wellness guidance only. Not medical advice.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
    padding: 18,
  },

  hero: {
    backgroundColor: "#2E4A3F",
    borderRadius: 28,
    padding: 24,
    marginTop: 55,
    marginBottom: 16,
  },

  heroEmoji: {
    fontSize: 44,
    marginBottom: 10,
  },

  logo: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
  },

  subtitle: {
    fontSize: 16,
    color: "#DDEBE3",
    marginTop: 10,
    lineHeight: 24,
    maxWidth: 620,
  },

  premiumStatus: {
    backgroundColor: "#E7F2EB",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginTop: 16,
  },

  premiumStatusText: {
    color: "#2E4A3F",
    fontWeight: "900",
    fontSize: 13,
  },

  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 6,
    color: "#2E4A3F",
  },

  statLabel: {
    color: "#2E4A3F",
    fontWeight: "900",
    fontSize: 13,
    textAlign: "center",
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },

  quickCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    width: "48%",
    minHeight: 118,
    justifyContent: "center",
  },

  quickCardDark: {
    backgroundColor: "#2E4A3F",
    borderRadius: 22,
    padding: 18,
    width: "48%",
    minHeight: 118,
    justifyContent: "center",
  },

  premiumCard: {
    backgroundColor: "#FFF7E8",
    borderRadius: 22,
    padding: 18,
    width: "48%",
    minHeight: 118,
    justifyContent: "center",
  },

  quickIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  quickTitle: {
    color: "#2E4A3F",
    fontWeight: "900",
    fontSize: 17,
  },

  quickSub: {
    color: "#777",
    fontSize: 13,
    marginTop: 4,
  },

  quickTitleDark: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 17,
  },

  quickSubDark: {
    color: "#DDEBE3",
    fontSize: 13,
    marginTop: 4,
  },

  sectionHeader: {
    marginBottom: 18,
    alignItems: "center",
  },

  sectionMainTitle: {
    fontSize: 29,
    fontWeight: "900",
    color: "#2E4A3F",
    textAlign: "center",
  },

  sectionSubtitle: {
    color: "#666",
    marginTop: 5,
    fontSize: 15,
    textAlign: "center",
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

  selectedOption: {
    backgroundColor: "#2E4A3F",
  },

  optionText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E4A3F",
  },

  selectedText: {
    color: "#FFFFFF",
  },

  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  pill: {
    backgroundColor: "#E7F2EB",
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 999,
  },

  selectedPill: {
    backgroundColor: "#2E4A3F",
  },

  pillText: {
    color: "#2E4A3F",
    fontWeight: "800",
  },

  generateButton: {
    backgroundColor: "#2E4A3F",
    padding: 18,
    borderRadius: 22,
    alignItems: "center",
    marginTop: 4,
  },

  lockedButton: {
    backgroundColor: "#A8842C",
  },

  generateText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
  },

  resultTitle: {
    fontSize: 25,
    fontWeight: "900",
    color: "#2E4A3F",
  },

  resultMeta: {
    fontSize: 14,
    color: "#777",
    marginTop: 6,
    marginBottom: 18,
  },

  exerciseCard: {
    backgroundColor: "#F0F7F2",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
  },

  poseImage: {
    width: "100%",
    height: 170,
    borderRadius: 18,
    resizeMode: "contain",
    marginBottom: 14,
  },

  exerciseNumber: {
    fontSize: 12,
    color: "#777",
    marginBottom: 4,
  },

  exerciseName: {
    fontSize: 19,
    fontWeight: "900",
    color: "#2E4A3F",
  },

  exerciseTime: {
    fontSize: 14,
    color: "#555",
    marginTop: 6,
  },

  exerciseText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
    marginTop: 8,
  },

  benefit: {
    fontSize: 14,
    color: "#2E4A3F",
    marginTop: 8,
    fontWeight: "700",
  },

  tipCard: {
    backgroundColor: "#FFF7E8",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },

  tipTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#2E4A3F",
  },

  startButton: {
    backgroundColor: "#2E4A3F",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 8,
  },

  startText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },

  footer: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
    marginBottom: 40,
    fontSize: 12,
  },
});