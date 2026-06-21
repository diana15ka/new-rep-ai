import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function StreakScreen() {
  const [streak, setStreak] = useState(0);
  const [lastWorkout, setLastWorkout] = useState("");

  useFocusEffect(
    useCallback(() => {
      loadStreakFromHistory();
    }, [])
  );

  const parseWorkoutDate = (raw: string) => {
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

  const loadStreakFromHistory = async () => {
    const stored = await AsyncStorage.getItem("yoga_history");
    const history = stored ? JSON.parse(stored) : [];

    if (history.length === 0) {
      setStreak(0);
      setLastWorkout("");
      return;
    }

    const uniqueDates = Array.from(
      new Set(history.map((item: any) => parseWorkoutDate(item.date)))
    ).filter((date) => date !== "Invalid Date");

    setLastWorkout((uniqueDates[0] as string) || "");

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

    setStreak(count);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔥</Text>
      <Text style={styles.title}>Daily Streak</Text>

      <View style={styles.card}>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.label}>day streak</Text>
      </View>

      <Text style={styles.subtitle}>
        Last workout: {lastWorkout || "No workout yet"}
      </Text>

      <Text style={styles.tip}>
        Any completed session counts toward your streak. Try to practice a
        little every day.
      </Text>

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
  icon: {
    fontSize: 80,
    marginBottom: 14,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#2E4A3F",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 28,
    width: "100%",
    alignItems: "center",
    marginTop: 24,
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: "900",
    color: "#2E4A3F",
  },
  label: {
    fontSize: 18,
    color: "#777",
    marginTop: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    marginTop: 22,
    textAlign: "center",
  },
  tip: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginTop: 14,
    marginBottom: 28,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#2E4A3F",
    padding: 18,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});