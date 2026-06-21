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

export default function AchievementsScreen() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadAchievements();
    }, [])
  );

  const loadAchievements = async () => {
    const stored = await AsyncStorage.getItem("yoga_history");
    const history = stored ? JSON.parse(stored) : [];

    const streak = await calculateStreak(history);
    const totalWorkouts = history.length;
    const hasHighCompletion = history.some(
      (item: any) => Number(item.completionPercent || 0) >= 90
    );

    const list: Achievement[] = [
      {
        id: "first_workout",
        icon: "🥇",
        title: "First Workout",
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
        title: "10 Workouts",
        description: "Complete 10 yoga sessions.",
        unlocked: totalWorkouts >= 10,
      },
      {
        id: "high_completion",
        icon: "⭐",
        title: "90% Completion",
        description: "Finish a workout with 90% or higher completion.",
        unlocked: hasHighCompletion,
      },
    ];

    setAchievements(list);
  };

  const calculateStreak = async (history: any[]) => {
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

  const parseWorkoutDate = (raw: string) => {
    if (raw.includes(".")) {
      const [datePart] = raw.split(",");
      const [day, month, year] = datePart.split(".");

      return new Date(Number(year), Number(month) - 1, Number(day)).toDateString();
    }

    return new Date(raw).toDateString();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🏆 Achievements</Text>

      {achievements.map((item) => (
        <View
          key={item.id}
          style={[
            styles.card,
            item.unlocked ? styles.unlockedCard : styles.lockedCard,
          ]}
        >
          <Text style={styles.icon}>{item.unlocked ? item.icon : "🔒"}</Text>

          <View style={styles.textBox}>
            <Text style={styles.achievementTitle}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={item.unlocked ? styles.unlockedText : styles.lockedText}>
              {item.unlocked ? "Unlocked" : "Locked"}
            </Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={() => router.replace("/")}>
        <Text style={styles.buttonText}>Back Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
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
    marginBottom: 20,
    color: "#2E4A3F",
  },
  card: {
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
  icon: {
    fontSize: 42,
    marginRight: 16,
  },
  textBox: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2E4A3F",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  unlockedText: {
    marginTop: 8,
    fontWeight: "800",
    color: "#2E4A3F",
  },
  lockedText: {
    marginTop: 8,
    fontWeight: "800",
    color: "#777",
  },
  button: {
    backgroundColor: "#2E4A3F",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 16,
    marginBottom: 40,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
});