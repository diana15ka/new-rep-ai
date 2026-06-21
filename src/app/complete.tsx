import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CompleteScreen() {
  const params = useLocalSearchParams();

  const completionPercent = Number(params.completionPercent || 0);
  const unfinishedCount = Number(params.unfinishedCount || 0);
  const skippedCount = Number(params.skippedCount || 0);
  const totalExercises = Number(params.totalExercises || 0);
  const duration = String(params.duration || "");

  useEffect(() => {
    saveWorkout();
    updateStreak();
  }, []);

  const saveWorkout = async () => {
    const stored = (await AsyncStorage.getItem("yoga_history")) || "[]";
    const history = JSON.parse(stored);

    history.unshift({
      date: new Date().toISOString(),
      completionPercent,
      completed: totalExercises - unfinishedCount - skippedCount,
      unfinished: unfinishedCount,
      skipped: skippedCount,
      duration,
      goal: "Yoga Session",
    });

    await AsyncStorage.setItem("yoga_history", JSON.stringify(history));
  };

  const updateStreak = async () => {
    const today = new Date().toDateString();
    const lastWorkout = await AsyncStorage.getItem("last_workout");
    let streak = Number(await AsyncStorage.getItem("streak")) || 0;

    if (lastWorkout !== today) {
      streak += 1;
      await AsyncStorage.setItem("streak", String(streak));
      await AsyncStorage.setItem("last_workout", today);
    }
  };

  const getMessage = () => {
    if (completionPercent >= 90) {
      return "Excellent work! You completed almost the full session.";
    }

    if (completionPercent >= 60) {
      return "Good job! You completed most of the workout. Try to hold each pose a little longer next time.";
    }

    if (completionPercent >= 30) {
      return "Nice start! Some exercises were not fully completed. Next time, try to stay longer in each pose.";
    }

    return "You started the workout, and that already matters. Try to complete more time in each exercise next session.";
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🎉</Text>

      <Text style={styles.title}>Workout Complete</Text>

      <View style={styles.scoreCard}>
        <Text style={styles.score}>{completionPercent}%</Text>
        <Text style={styles.scoreLabel}>Workout Completion</Text>
      </View>

      <Text style={styles.subtitle}>{getMessage()}</Text>

      <View style={styles.statsCard}>
        <Text style={styles.statText}>
          Fully completed: {totalExercises - unfinishedCount - skippedCount}/
          {totalExercises}
        </Text>

        <Text style={styles.statText}>Unfinished: {unfinishedCount}</Text>
        <Text style={styles.statText}>Skipped: {skippedCount}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.replace("/")}>
        <Text style={styles.buttonText}>Back Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EE",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: { fontSize: 76, marginBottom: 16 },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#2E4A3F",
    textAlign: "center",
  },
  scoreCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
    marginTop: 24,
  },
  score: { fontSize: 56, fontWeight: "900", color: "#2E4A3F" },
  scoreLabel: { fontSize: 16, color: "#777", marginTop: 6 },
  subtitle: {
    fontSize: 17,
    color: "#555",
    textAlign: "center",
    lineHeight: 26,
    marginTop: 20,
    marginBottom: 20,
  },
  statsCard: {
    backgroundColor: "#E7F2EB",
    borderRadius: 18,
    padding: 16,
    width: "100%",
    marginBottom: 24,
  },
  statText: {
    fontSize: 16,
    color: "#2E4A3F",
    fontWeight: "700",
    marginBottom: 6,
  },
  button: {
    backgroundColor: "#2E4A3F",
    padding: 18,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});