import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DashboardScreen() {
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Progress Dashboard</Text>
      <Text style={styles.subtitle}>Your yoga progress at a glance.</Text>

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

      <TouchableOpacity style={styles.button} onPress={() => router.push("/history")}>
        <Text style={styles.buttonText}>View Full History</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.replace("/")}>
        <Text style={styles.secondaryText}>Back Home</Text>
      </TouchableOpacity>
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

    if (!isNaN(minutes)) {
      return sum + minutes;
    }

    return sum;
  }, 0);
}

function calculateAverageCompletion(history: any[]) {
  if (history.length === 0) return 0;

  return Math.round(
    history.reduce(
      (sum, item) => sum + Number(item.completionPercent || 0),
      0
    ) / history.length
  );
}

function calculateBestScore(history: any[]) {
  if (history.length === 0) return 0;

  return Math.max(
    ...history.map((item) => Number(item.completionPercent || 0))
  );
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

function getInsight(
  totalSessions: number,
  averageCompletion: number,
  currentStreak: number
) {
  if (totalSessions === 0) {
    return "Complete your first yoga session to start building your wellness progress.";
  }

  if (currentStreak >= 3) {
    return "Great consistency. Your current streak shows that yoga is becoming part of your routine.";
  }

  if (averageCompletion >= 80) {
    return "Strong progress. You usually complete most of your sessions.";
  }

  if (averageCompletion >= 50) {
    return "Good start. Try choosing shorter sessions to improve completion.";
  }

  return "Small steps count. A 5-minute session can help you build the habit without pressure.";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    marginTop: 60,
    color: "#2E4A3F",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 6,
    marginBottom: 24,
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
    backgroundColor: "#FFF7E8",
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
    color: "#555",
    lineHeight: 23,
    marginTop: 8,
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
    fontWeight: "800",
  },
  secondaryButton: {
    alignItems: "center",
    marginTop: 18,
    marginBottom: 40,
  },
  secondaryText: {
    color: "#2E4A3F",
    fontSize: 16,
    fontWeight: "700",
  },
});