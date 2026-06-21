import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
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

type ProgressItem = {
  name: string;
  requiredSeconds: number;
  completedSeconds: number;
};

export default function WorkoutScreen() {
  const params = useLocalSearchParams();

  const exercises: Exercise[] = params.exercises
    ? JSON.parse(params.exercises as string)
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [requiredSeconds, setRequiredSeconds] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<ProgressItem[]>([]);

  const currentExercise = exercises[currentIndex];

  useEffect(() => {
    if (!currentExercise) return;

    const minutes = parseInt(currentExercise.time);
    const totalSeconds = isNaN(minutes) ? 60 : minutes * 60;

    setRequiredSeconds(totalSeconds);
    setSecondsLeft(totalSeconds);
    setIsRunning(false);

    Speech.stop();
    Speech.speak(
      `Begin ${currentExercise.name}. ${currentExercise.instruction}`,
      { language: "en" }
    );
  }, [currentIndex]);

  useEffect(() => {
    if (!isRunning) return;

    if (secondsLeft <= 0) {
      setIsRunning(false);
      return;
    }

    if (secondsLeft === Math.floor(requiredSeconds / 2)) {
      Speech.speak("Halfway there. Keep breathing slowly.", {
        language: "en",
      });
    }

    if (secondsLeft === 1) {
      Speech.speak("Great job. You can move to the next pose.", {
        language: "en",
      });
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, secondsLeft, requiredSeconds]);

  const saveCurrentProgress = () => {
    if (!currentExercise) return;

    const completedSeconds = requiredSeconds - secondsLeft;

    setProgress((prev) => {
      const updated = [...prev];
      updated[currentIndex] = {
        name: currentExercise.name,
        requiredSeconds,
        completedSeconds,
      };
      return updated;
    });

    return {
      name: currentExercise.name,
      requiredSeconds,
      completedSeconds,
    };
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const finishWorkout = (finalProgress: ProgressItem[]) => {
    const totalRequired = finalProgress.reduce(
      (sum, item) => sum + item.requiredSeconds,
      0
    );

    const totalCompleted = finalProgress.reduce(
      (sum, item) => sum + item.completedSeconds,
      0
    );

    const completionPercent =
      totalRequired > 0
        ? Math.round((totalCompleted / totalRequired) * 100)
        : 0;

    const skippedCount = finalProgress.filter(
      (item) => item.completedSeconds === 0
    ).length;

    const unfinishedCount = finalProgress.filter(
      (item) =>
        item.completedSeconds > 0 &&
        item.completedSeconds < item.requiredSeconds
    ).length;

    Speech.stop();

    router.replace({
      pathname: "/complete",
      params: {
        completionPercent: String(completionPercent),
        unfinishedCount: String(unfinishedCount),
        skippedCount: String(skippedCount),
        totalExercises: String(exercises.length),
        duration: String(
          Math.round(
            finalProgress.reduce(
              (sum, item) => sum + item.requiredSeconds,
              0
            ) / 60
          )
        ),
      },
    });
  };

  const nextExercise = () => {
    Speech.stop();

    const currentProgress = saveCurrentProgress();

    const updatedProgress = [...progress];
    if (currentProgress) {
      updatedProgress[currentIndex] = currentProgress;
    }

    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishWorkout(updatedProgress);
    }
  };

  const previousExercise = () => {
    Speech.stop();
    saveCurrentProgress();

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (!currentExercise) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No workout found</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            Speech.stop();
            router.back();
          }}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const completedSeconds = requiredSeconds - secondsLeft;
  const exerciseProgress = Math.round(
    (completedSeconds / requiredSeconds) * 100
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.progress}>
        Exercise {currentIndex + 1} of {exercises.length}
      </Text>

      <View style={styles.mainCard}>
        <Image
          source={getPoseImage(currentExercise.name)}
          style={styles.workoutImage}
        />

        <Text style={styles.title}>{currentExercise.name}</Text>

        <Text style={styles.timer}>{formatTime(secondsLeft)}</Text>

        <Text style={styles.progressText}>Completed: {exerciseProgress}%</Text>

        <Text style={styles.instruction}>{currentExercise.instruction}</Text>

        <View style={styles.benefitBox}>
          <Text style={styles.benefitTitle}>Benefit</Text>
          <Text style={styles.benefitText}>{currentExercise.benefit}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => {
          if (!isRunning) {
            Speech.stop();
            Speech.speak(
              `Timer started. ${currentExercise.instruction}. Breathe slowly.`,
              { language: "en" }
            );
          } else {
            Speech.stop();
            Speech.speak("Paused.", { language: "en" });
          }

          setIsRunning(!isRunning);
        }}
      >
        <Text style={styles.startText}>
          {isRunning ? "Pause" : "Start Timer"}
        </Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.disabledButton]}
          onPress={previousExercise}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navText}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={nextExercise}>
          <Text style={styles.navText}>
            {currentIndex === exercises.length - 1 ? "Finish" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>

      {secondsLeft > 0 && completedSeconds > 0 ? (
        <Text style={styles.softWarning}>
          You can skip, but completing the full time improves your workout score.
        </Text>
      ) : null}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          Speech.stop();
          router.back();
        }}
      >
        <Text style={styles.backText}>Back to Plan</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F3EE", padding: 20 },

  progress: {
    marginTop: 60,
    textAlign: "center",
    color: "#777",
    fontSize: 16,
  },

  mainCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 24,
    marginTop: 20,
    alignItems: "center",
  },

  workoutImage: {
    width: "100%",
    height: 220,
    borderRadius: 24,
    resizeMode: "contain",
    marginBottom: 18,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#2E4A3F",
    textAlign: "center",
  },

  timer: {
    fontSize: 64,
    fontWeight: "900",
    color: "#2E4A3F",
    marginTop: 20,
  },

  progressText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#2E4A3F",
    marginBottom: 20,
  },

  instruction: {
    fontSize: 17,
    color: "#333",
    lineHeight: 26,
    textAlign: "center",
  },

  benefitBox: {
    backgroundColor: "#E7F2EB",
    borderRadius: 18,
    padding: 16,
    marginTop: 25,
    width: "100%",
  },

  benefitTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2E4A3F",
    marginBottom: 6,
  },

  benefitText: { fontSize: 15, color: "#333", lineHeight: 22 },

  startButton: {
    backgroundColor: "#2E4A3F",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 24,
  },

  startText: { color: "#fff", fontSize: 18, fontWeight: "800" },

  row: { flexDirection: "row", gap: 12, marginTop: 16 },

  navButton: {
    flex: 1,
    backgroundColor: "#2E4A3F",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  disabledButton: { backgroundColor: "#AAB7B0" },

  navText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  softWarning: {
    textAlign: "center",
    color: "#777",
    marginTop: 14,
    fontSize: 14,
  },

  backButton: { alignItems: "center", marginTop: 22, marginBottom: 40 },

  backText: { color: "#2E4A3F", fontSize: 16, fontWeight: "700" },

  button: {
    backgroundColor: "#2E4A3F",
    padding: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 30,
  },

  buttonText: { color: "#fff", fontSize: 18, fontWeight: "800" },
});