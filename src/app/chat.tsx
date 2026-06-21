import { router } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type ChatMessage = {
  role: "user" | "ai";
  text: string;
};

export default function ChatScreen() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "ai",
      text: "Hi! I’m your AI Yoga Coach. Ask me for short yoga routines, stretching tips, breathing exercises, or relaxation advice.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const cleanText = (text: string) => {
    return text
      .replace(/#{1,6}\s?/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/`/g, "")
      .trim();
  };

  const sendMessage = async () => {
    if (!message.trim() || loading) return;

    const userMessage = message.trim();

    setChat((prev) => [...prev, { role: "user", text: userMessage }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://new-rep-ai.onrender.com/api/yoga-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `${userMessage}

Please answer in a short, friendly way. Avoid markdown symbols like ### or **. Use simple numbered steps if needed. Keep it practical and safe.`,
        }),
      });

      const data = await response.json();

      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          text: cleanText(data.reply || "Sorry, I could not answer."),
        },
      ]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Connection error. Please make sure the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>💬 AI Yoga Coach</Text>

      <ScrollView style={styles.chatBox}>
        {chat.map((item, index) => {
          const isUser = item.role === "user";

          return (
            <View
              key={index}
              style={[
                styles.messageBubble,
                isUser ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={[styles.messageRole, isUser && styles.userRole]}>
                {isUser ? "You" : "Yoga AI"}
              </Text>

              <Text style={[styles.messageText, isUser && styles.userText]}>
                {item.text}
              </Text>
            </View>
          );
        })}

        {loading ? <Text style={styles.loading}>AI is thinking...</Text> : null}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask your yoga coach..."
          placeholderTextColor="#888"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity
          style={[styles.sendButton, loading && styles.disabledButton]}
          onPress={sendMessage}
          disabled={loading}
        >
          <Text style={styles.sendText}>{loading ? "..." : "Send"}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>Back Home</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
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

  chatBox: {
    flex: 1,
    marginBottom: 12,
  },

  messageBubble: {
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
  },

  userBubble: {
    backgroundColor: "#2E4A3F",
    alignSelf: "flex-end",
    maxWidth: "85%",
  },

  aiBubble: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    maxWidth: "90%",
  },

  messageRole: {
    fontSize: 12,
    fontWeight: "800",
    color: "#777",
    marginBottom: 6,
  },

  userRole: {
    color: "#DCEBE3",
  },

  messageText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },

  userText: {
    color: "#FFFFFF",
  },

  loading: {
    color: "#777",
    marginBottom: 10,
    fontStyle: "italic",
  },

  inputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    minHeight: 52,
    maxHeight: 110,
    fontSize: 15,
    color: "#222",
  },

  sendButton: {
    backgroundColor: "#2E4A3F",
    padding: 16,
    borderRadius: 16,
  },

  disabledButton: {
    opacity: 0.6,
  },

  sendText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  backButton: {
    alignItems: "center",
    marginTop: 14,
    marginBottom: 20,
  },

  backText: {
    color: "#2E4A3F",
    fontSize: 16,
    fontWeight: "700",
  },
});
