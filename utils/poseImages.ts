export const getPoseImage = (name: string) => {
  const lower = name.toLowerCase();

  if (lower.includes("child")) {
    return require("../assets/poses/child-pose.png");
  }

  if (lower.includes("cat") || lower.includes("cow")) {
    return require("../assets/poses/cat-cow.png");
  }

  if (lower.includes("cobra")) {
    return require("../assets/poses/cobra-pose.png");
  }

  if (lower.includes("dog")) {
    return require("../assets/poses/downward-dog.png");
  }

  if (lower.includes("breath")) {
    return require("../assets/poses/breathing.png");
  }

  return require("../assets/poses/default-pose.png");
};