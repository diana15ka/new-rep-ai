import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function HistoryScreen() {
  const [history, setHistory] = useState<any[]>([]);

  const loadHistory = async () => {
    const stored = await AsyncStorage.getItem("yoga_history");

    if (stored) {
      setHistory(JSON.parse(stored));
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const formatDate = (rawDate: string) => {
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
      const seconds = String(date.getSeconds()).padStart(2, "0");

      return `${day}.${month}.${year}, ${hours}:${minutes}:${seconds}`;
    } catch {
      return rawDate;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📈 Workout History</Text>

      {history.length === 0 ? (
        <Text style={styles.empty}>
          No workouts completed yet.
        </Text>
      ) : (
        history.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.goal}>{item.goal}</Text>

            <Text style={styles.date}>
              {formatDate(item.date)}
            </Text>

            <Text style={styles.score}>
              Completion: {item.completionPercent}%
            </Text>

            <Text style={styles.info}>
              Fully completed: {item.completed}
            </Text>

            <Text style={styles.info}>
              Unfinished: {item.unfinished}
            </Text>

            <Text style={styles.info}>
              Skipped: {item.skipped}
            </Text>

            {item.duration && (
              <Text style={styles.duration}>
                ⏱ Duration: {item.duration}
              </Text>
            )}
          </View>
        ))
      )}
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

  empty: {
    fontSize: 16,
    color: "#666",
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
  },

  goal: {
    fontSize: 22,
    fontWeight: "900",
    color: "#2E4A3F",
  },

  date: {
    color: "#777",
    marginTop: 6,
    marginBottom: 12,
    fontSize: 14,
  },

  score: {
    fontWeight: "800",
    fontSize: 16,
    marginBottom: 10,
    color: "#2E4A3F",
  },

  info: {
    fontSize: 15,
    color: "#333",
    marginBottom: 4,
  },

  duration: {
    marginTop: 10,
    color: "#2E4A3F",
    fontWeight: "700",
  },
});