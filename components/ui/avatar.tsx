import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface AvatarProps {
  name: string;
  uri?: string; // profile photo link; initials are shown when empty or broken
  size?: number;
}

const PALETTE = ["#5B3FD6", "#1E8E5A", "#D9480F", "#1971C2", "#C2255C", "#7048E8", "#0C8599"];

export function getInitials(name: string) {
  return name
    .split(" ")
    .filter((part) => part.length > 0)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// The same name always gets the same colour
function colorFor(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return PALETTE[sum % PALETTE.length];
}

// Round profile picture (Image with resizeMode, as in the Week 2 lab)
export default function Avatar({ name, uri = "", size = 44 }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const box = { width: size, height: size, borderRadius: size / 2 };

  if (uri.length > 0 && !failed) {
    return (
      <Image
        source={{ uri }}
        style={[box, styles.image]}
        resizeMode="cover"
        accessibilityLabel={`${name}'s photo`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <View style={[box, styles.initials, { backgroundColor: colorFor(name) }]}>
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: "#E7E5F0" },
  initials: { alignItems: "center", justifyContent: "center" },
  text: { color: "#FFFFFF", fontWeight: "800" },
});
