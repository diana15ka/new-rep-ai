import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    View
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
              {item.date}
            </Text>

            <Text style={styles.score}>
              Completion: {item.completionPercent}%
            </Text>

            <Text>
              Fully completed: {item.completed}
            </Text>

            <Text>
              Unfinished: {item.unfinished}
            </Text>

            <Text>
              Skipped: {item.skipped}
            </Text>
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
    padding: 18,
    borderRadius: 18,
    marginBottom: 14,
  },

  goal: {
    fontSize: 20,
    fontWeight: "800",
    color: "#2E4A3F",
  },

  date: {
    color: "#777",
    marginTop: 4,
    marginBottom: 10,
  },

  score: {
    fontWeight: "700",
    marginBottom: 6,
  },
});