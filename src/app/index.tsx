import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MoodSelector from "../components/MoodSelector";

export default function HomeScreen() {
  const [isPremium, setIsPremium] = useState(false);
  const [totalSessions, setTotalSessions] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);

  const navigate = (pathname: string) => {
    router.push({ pathname } as any);
  };

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
      return new Date(Number(year), Number(month) - 1, Number(day)).toDateString();
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

      if (uniqueDates.includes(checkDate.toDateString())) count++;
      else break;
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

  const openAiCoach = () => {
    if (!isPremium) {
      navigate("/premium");
      return;
    }

    navigate("/chat");
  };

  const openGenerate = () => {
    if (!isPremium) {
      navigate("/premium");
      return;
    }

    navigate("/generate");
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroEmoji}>🌿</Text>
        <Text style={styles.logo}>Yoga Daily AI</Text>
        <Text style={styles.subtitle}>
          Your daily space for yoga, calm movement, progress, and wellness.
        </Text>

        <View style={styles.premiumStatus}>
          <Text style={styles.premiumStatusText}>
            {isPremium ? "✅ Premium Active" : "⭐ Premium Required"}
          </Text>
        </View>
      </View>

      <MoodSelector />

      <View style={styles.statsRow}>
        <TouchableOpacity style={styles.statCard} onPress={() => navigate("/progress")}>
          <Text style={styles.statNumber}>🔥 {currentStreak}</Text>
          <Text style={styles.statLabel}>Streak</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => navigate("/progress")}>
          <Text style={styles.statNumber}>📈 {totalSessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard} onPress={() => navigate("/progress")}>
          <Text style={styles.statNumber}>🏆 {badgeCount}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Explore</Text>

      <View style={styles.quickGrid}>
        <TouchableOpacity style={styles.quickCardDark} onPress={openGenerate}>
          <Text style={styles.quickIcon}>🧘</Text>
          <Text style={styles.quickTitleDark}>New session</Text>
          <Text style={styles.quickSubDark}>
            {isPremium ? "Create a session" : "Premium only"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={openAiCoach}>
          <Text style={styles.quickIcon}>💬</Text>
          <Text style={styles.quickTitle}>AI Coach</Text>
          <Text style={styles.quickSub}>
            {isPremium ? "Ask for guidance" : "Premium only"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard} onPress={() => navigate("/progress")}>
          <Text style={styles.quickIcon}>📊</Text>
          <Text style={styles.quickTitle}>Progress</Text>
          <Text style={styles.quickSub}>Stats & achievements</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.premiumCard} onPress={() => navigate("/premium")}>
          <Text style={styles.quickIcon}>{isPremium ? "✅" : "⭐"}</Text>
          <Text style={styles.quickTitle}>
            {isPremium ? "Premium Active" : "Premium"}
          </Text>
          <Text style={styles.quickSub}>
            {isPremium ? "All features unlocked" : "Unlock AI features"}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.quoteCard}>
        <Text style={styles.quoteTitle}>Daily Reminder</Text>
        <Text style={styles.quoteText}>
          Small, consistent movement can become a powerful daily habit.
        </Text>
      </View>

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
    borderRadius: 30,
    padding: 24,
    marginTop: 55,
    marginBottom: 18,
  },
  heroEmoji: {
    fontSize: 42,
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
    marginBottom: 22,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 21,
    fontWeight: "900",
    color: "#2E4A3F",
    marginBottom: 6,
  },
  statLabel: {
    color: "#2E4A3F",
    fontWeight: "900",
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2E4A3F",
    marginBottom: 14,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
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
  quoteCard: {
    backgroundColor: "#E7F2EB",
    borderRadius: 22,
    padding: 20,
    marginTop: 20,
  },
  quoteTitle: {
    color: "#2E4A3F",
    fontWeight: "900",
    fontSize: 18,
  },
  quoteText: {
    color: "#2E4A3F",
    lineHeight: 22,
    marginTop: 8,
    fontSize: 15,
  },
  footer: {
    textAlign: "center",
    color: "#777",
    marginTop: 24,
    marginBottom: 40,
    fontSize: 12,
  },
});