import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Achievement = {
  id: string;
  icon: string;
  title: string;
  description: string;
  unlocked: boolean;
};

export default function ProgressScreen() {
  const [history, setHistory] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem("yoga_history");
    setHistory(stored ? JSON.parse(stored) : []);
  };

  const totalSessions = history.length;
  const currentStreak = calculateStreak(history);
  const totalMinutes = calculateTotalMinutes(history);
  const averageCompletion = calculateAverageCompletion(history);
  const bestScore = calculateBestScore(history);
  const thisWeekSessions = calculateThisWeekSessions(history);
  const achievements = getAchievements(history, currentStreak);
  const unlockedBadges = achievements.filter((item) => item.unlocked).length;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>📊</Text>
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>
          Track your yoga journey, streaks, sessions, and achievements.
        </Text>
      </View>

      <View style={styles.levelCard}>
        <Text style={styles.levelLabel}>Current Level</Text>
        <Text style={styles.levelTitle}>{getLevelTitle(totalSessions)}</Text>
        <Text style={styles.levelText}>
          Complete more sessions to unlock higher levels and future rewards.
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={styles.cardDark}>
          <Text style={styles.bigNumberDark}>🔥 {currentStreak}</Text>
          <Text style={styles.labelDark}>Current Streak</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.bigNumber}>{totalSessions}</Text>
          <Text style={styles.label}>Total Sessions</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.bigNumber}>{totalMinutes}</Text>
          <Text style={styles.label}>Total Minutes</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.bigNumber}>{averageCompletion}%</Text>
          <Text style={styles.label}>Average Completion</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.bigNumber}>{bestScore}%</Text>
          <Text style={styles.label}>Best Score</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.bigNumber}>{thisWeekSessions}</Text>
          <Text style={styles.label}>This Week</Text>
        </View>
      </View>

      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>AI Wellness Insight</Text>
        <Text style={styles.insightText}>
          {getInsight(totalSessions, averageCompletion, currentStreak)}
        </Text>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.sectionMeta}>{unlockedBadges}/{achievements.length} unlocked</Text>
      </View>

      {achievements.map((item) => (
        <View
          key={item.id}
          style={[styles.badgeCard, item.unlocked ? styles.unlockedCard : styles.lockedCard]}
        >
          <Text style={styles.badgeIcon}>{item.unlocked ? item.icon : "🔒"}</Text>

          <View style={styles.badgeTextBox}>
            <Text style={styles.badgeTitle}>{item.title}</Text>
            <Text style={styles.badgeDescription}>{item.description}</Text>
            <Text style={item.unlocked ? styles.unlockedText : styles.lockedText}>
              {item.unlocked ? "Unlocked" : "Locked"}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No workouts completed yet.</Text>
        </View>
      ) : (
        history.slice(0, 5).map((item, index) => (
          <View key={index} style={styles.historyCard}>
            <Text style={styles.historyTitle}>{item.goal || "Yoga Session"}</Text>
            <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
            <Text style={styles.historyScore}>Completion: {item.completionPercent || 0}%</Text>

            <View style={styles.historyRow}>
              <Text style={styles.historyInfo}>Completed: {item.completed || 0}</Text>
              <Text style={styles.historyInfo}>Skipped: {item.skipped || 0}</Text>
            </View>

            {item.duration && (
              <Text style={styles.historyDuration}>⏱ Duration: {item.duration}</Text>
            )}
          </View>
        ))
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/generate",
          } as any)
        }
      >
        <Text style={styles.buttonText}>✨ Create New Session</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() =>
          router.replace({
            pathname: "/",
          } as any)
        }
      >
        <Text style={styles.secondaryText}>Back Home</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Wellness guidance only. Not medical advice.</Text>
    </ScrollView>
  );
}

function parseWorkoutDate(raw: string) {
  if (!raw) return new Date("invalid");

  if (raw.includes(".")) {
    const [datePart] = raw.split(",");
    const [day, month, year] = datePart.split(".");
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  return new Date(raw);
}

function calculateStreak(history: any[]) {
  if (history.length === 0) return 0;

  const uniqueDates = Array.from(
    new Set(
      history
        .map((item) => parseWorkoutDate(item.date).toDateString())
        .filter((date) => !isNaN(new Date(date).getTime()))
    )
  );

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date();
    checkDate.setDate(today.getDate() - i);

    if (uniqueDates.includes(checkDate.toDateString())) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function calculateTotalMinutes(history: any[]) {
  return history.reduce((sum, item) => {
    const durationText = item.duration || item.totalDuration || "";
    const minutes = parseInt(durationText);

    return !isNaN(minutes) ? sum + minutes : sum;
  }, 0);
}

function calculateAverageCompletion(history: any[]) {
  if (history.length === 0) return 0;

  return Math.round(
    history.reduce((sum, item) => sum + Number(item.completionPercent || 0), 0) /
      history.length
  );
}

function calculateBestScore(history: any[]) {
  if (history.length === 0) return 0;
  return Math.max(...history.map((item) => Number(item.completionPercent || 0)));
}

function calculateThisWeekSessions(history: any[]) {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return history.filter((item) => {
    const date = parseWorkoutDate(item.date);
    return date >= startOfWeek;
  }).length;
}

function getAchievements(history: any[], streak: number): Achievement[] {
  const totalWorkouts = history.length;
  const hasHighCompletion = history.some(
    (item: any) => Number(item.completionPercent || 0) >= 90
  );

  return [
    {
      id: "first_workout",
      icon: "🥇",
      title: "First Session",
      description: "Complete your first yoga session.",
      unlocked: totalWorkouts >= 1,
    },
    {
      id: "streak_3",
      icon: "🔥",
      title: "3 Day Streak",
      description: "Practice yoga for 3 days in a row.",
      unlocked: streak >= 3,
    },
    {
      id: "streak_7",
      icon: "🔥",
      title: "7 Day Streak",
      description: "Practice yoga for 7 days in a row.",
      unlocked: streak >= 7,
    },
    {
      id: "ten_workouts",
      icon: "🧘",
      title: "10 Sessions",
      description: "Complete 10 yoga sessions.",
      unlocked: totalWorkouts >= 10,
    },
    {
      id: "high_completion",
      icon: "⭐",
      title: "90% Completion",
      description: "Finish a session with 90% or higher completion.",
      unlocked: hasHighCompletion,
    },
  ];
}

function getInsight(totalSessions: number, averageCompletion: number, currentStreak: number) {
  if (totalSessions === 0) {
    return "Complete your first yoga session to start building your wellness progress.";
  }

  if (currentStreak >= 3) {
    return "Great consistency. Your streak shows that yoga is becoming part of your routine.";
  }

  if (averageCompletion >= 80) {
    return "Strong progress. You usually complete most of your sessions.";
  }

  if (averageCompletion >= 50) {
    return "Good start. Try choosing shorter sessions to improve completion.";
  }

  return "Small steps count. A 5-minute session can help you build the habit without pressure.";
}

function getLevelTitle(totalSessions: number) {
  if (totalSessions >= 100) return "Diamond Yogi 💎";
  if (totalSessions >= 50) return "Gold Yogi 🥇";
  if (totalSessions >= 20) return "Silver Yogi 🥈";
  if (totalSessions >= 5) return "Bronze Yogi 🥉";
  return "New Yogi 🌱";
}

function formatDate(rawDate: string) {
  try {
    const date = new Date(rawDate);

    if (isNaN(date.getTime())) {
      return rawDate;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year}, ${hours}:${minutes}`;
  } catch {
    return rawDate;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
    padding: 20,
  },
  hero: {
    backgroundColor: "#2E4A3F",
    borderRadius: 30,
    padding: 24,
    marginTop: 55,
    marginBottom: 18,
  },
  heroIcon: {
    fontSize: 42,
    marginBottom: 10,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 16,
    color: "#DDEBE3",
    marginTop: 10,
    lineHeight: 24,
  },
  levelCard: {
    backgroundColor: "#FFF7E8",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
  levelLabel: {
    color: "#777",
    fontWeight: "800",
  },
  levelTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#2E4A3F",
    marginTop: 6,
  },
  levelText: {
    color: "#555",
    marginTop: 8,
    lineHeight: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    width: "48%",
    minHeight: 125,
    justifyContent: "center",
  },
  cardDark: {
    backgroundColor: "#2E4A3F",
    borderRadius: 22,
    padding: 18,
    width: "48%",
    minHeight: 125,
    justifyContent: "center",
  },
  bigNumber: {
    fontSize: 34,
    fontWeight: "900",
    color: "#2E4A3F",
  },
  bigNumberDark: {
    fontSize: 34,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  label: {
    fontSize: 14,
    color: "#777",
    marginTop: 6,
    fontWeight: "700",
  },
  labelDark: {
    fontSize: 14,
    color: "#DDEBE3",
    marginTop: 6,
    fontWeight: "700",
  },
  insightCard: {
    backgroundColor: "#E7F2EB",
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
  },
  insightTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#2E4A3F",
  },
  insightText: {
    fontSize: 15,
    color: "#2E4A3F",
    lineHeight: 23,
    marginTop: 8,
  },
  sectionHeader: {
    marginTop: 26,
    marginBottom: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2E4A3F",
  },
  sectionMeta: {
    color: "#777",
    fontWeight: "800",
  },
  badgeCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  unlockedCard: {
    backgroundColor: "#FFFFFF",
  },
  lockedCard: {
    backgroundColor: "#E7E7E7",
    opacity: 0.8,
  },
  badgeIcon: {
    fontSize: 42,
    marginRight: 16,
  },
  badgeTextBox: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#2E4A3F",
  },
  badgeDescription: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  unlockedText: {
    marginTop: 8,
    fontWeight: "900",
    color: "#2E4A3F",
  },
  lockedText: {
    marginTop: 8,
    fontWeight: "900",
    color: "#777",
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 14,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#2E4A3F",
  },
  historyDate: {
    color: "#777",
    marginTop: 6,
    marginBottom: 10,
  },
  historyScore: {
    color: "#2E4A3F",
    fontWeight: "900",
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: "row",
    gap: 16,
  },
  historyInfo: {
    color: "#333",
  },
  historyDuration: {
    marginTop: 8,
    color: "#2E4A3F",
    fontWeight: "800",
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
  secondaryButton: {
    alignItems: "center",
    marginTop: 18,
  },
  secondaryText: {
    color: "#2E4A3F",
    fontSize: 16,
    fontWeight: "800",
  },
  footer: {
    textAlign: "center",
    color: "#777",
    marginTop: 24,
    marginBottom: 40,
    fontSize: 12,
  },
});