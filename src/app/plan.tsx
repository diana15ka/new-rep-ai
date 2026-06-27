import { router, useLocalSearchParams } from "expo-router";
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

export default function PlanScreen() {
  const params = useLocalSearchParams();

  const plan: YogaPlan | null = params.plan
    ? JSON.parse(params.plan as string)
    : null;

  if (!plan) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No session found</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() =>
            router.replace({
              pathname: "/generate",
            } as any)
          }
        >
          <Text style={styles.primaryButtonText}>Create Session</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const beginSession = () => {
    router.push({
      pathname: "/workout",
      params: {
        exercises: JSON.stringify(plan.exercises),
        duration: plan.duration,
        goal: plan.goal,
      },
    } as any);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🌿</Text>
        <Text style={styles.label}>Your Personalized Session</Text>
        <Text style={styles.title}>{plan.title}</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaChip}>
            <Text style={styles.metaText}>{plan.duration}</Text>
          </View>

          <View style={styles.metaChip}>
            <Text style={styles.metaText}>{plan.level}</Text>
          </View>

          <View style={styles.metaChip}>
            <Text style={styles.metaText}>{plan.exercises.length} poses</Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Session Focus</Text>
        <Text style={styles.summaryText}>{plan.goal}</Text>
      </View>

      <Text style={styles.sectionTitle}>Practice Flow</Text>

      {plan.exercises.map((exercise, index) => (
        <View key={index} style={styles.exerciseCard}>
          <Image source={getPoseImage(exercise.name)} style={styles.poseImage} />

          <View style={styles.exerciseContent}>
            <Text style={styles.exerciseNumber}>Step {index + 1}</Text>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <Text style={styles.exerciseTime}>⏱ {exercise.time}</Text>
            <Text style={styles.exerciseText}>{exercise.instruction}</Text>
          </View>
        </View>
      ))}

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>🌬 Breathing Tip</Text>
        <Text style={styles.tipText}>{plan.breathingTip}</Text>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>⚠️ Safety Note</Text>
        <Text style={styles.tipText}>{plan.safetyNote}</Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={beginSession}>
        <Text style={styles.startText}>🧘 Begin Session</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() =>
          router.replace({
            pathname: "/generate",
          } as any)
        }
      >
        <Text style={styles.secondaryText}>Create Another Session</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Wellness guidance only. Not medical advice.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EE", padding: 18 },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#F5F3EE",
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#2E4A3F",
    marginBottom: 20,
  },
  hero: {
    backgroundColor: "#2E4A3F",
    borderRadius: 30,
    padding: 24,
    marginTop: 55,
    marginBottom: 18,
  },
  heroIcon: { fontSize: 42, marginBottom: 10 },
  label: {
    color: "#DDEBE3",
    fontWeight: "800",
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 38,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  metaChip: {
    backgroundColor: "#E7F2EB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  metaText: {
    color: "#2E4A3F",
    fontWeight: "900",
    fontSize: 13,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
  },
  summaryTitle: {
    color: "#777",
    fontWeight: "800",
    marginBottom: 6,
  },
  summaryText: {
    color: "#2E4A3F",
    fontSize: 20,
    fontWeight: "900",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#2E4A3F",
    marginBottom: 14,
  },
  exerciseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
    flexDirection: "row",
    gap: 14,
  },
  poseImage: {
    width: 95,
    height: 95,
    borderRadius: 18,
    resizeMode: "contain",
    backgroundColor: "#E7F2EB",
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseNumber: {
    color: "#777",
    fontSize: 12,
    fontWeight: "700",
  },
  exerciseName: {
    color: "#2E4A3F",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 3,
  },
  exerciseTime: {
    color: "#555",
    marginTop: 4,
    fontWeight: "700",
  },
  exerciseText: {
    color: "#333",
    marginTop: 6,
    lineHeight: 20,
    fontSize: 14,
  },
  tipCard: {
    backgroundColor: "#FFF7E8",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
  },
  tipTitle: {
    color: "#2E4A3F",
    fontSize: 17,
    fontWeight: "900",
  },
  tipText: {
    color: "#555",
    lineHeight: 22,
    marginTop: 8,
  },
  startButton: {
    backgroundColor: "#2E4A3F",
    padding: 18,
    borderRadius: 20,
    alignItems: "center",
    marginTop: 10,
  },
  startText: {
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
  primaryButton: {
    backgroundColor: "#2E4A3F",
    padding: 18,
    borderRadius: 18,
    width: "100%",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  footer: {
    textAlign: "center",
    color: "#777",
    marginTop: 24,
    marginBottom: 40,
    fontSize: 12,
  },
});