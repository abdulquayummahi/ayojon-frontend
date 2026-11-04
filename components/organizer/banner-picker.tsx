import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors, FontSize, Radius } from "../../constants/theme";
import { EventCategory } from "../../types/models";
import { isImageLink, sortPresetsFor } from "../../utils/images";
import { validateImageLink } from "../../utils/validation";
import BannerImage from "../ui/banner-image";
import Button from "../ui/button";
import FormField from "../ui/form-field";

type Mode = "gallery" | "link";

interface BannerPickerProps {
  value: string; // preset id or image link ("" = nothing chosen yet)
  category: EventCategory | "";
  onChange: (banner: string) => void;
  error?: string;
}

// Lets the organizer pick the event's banner from the built-in gallery
// or paste an image link (shown with <Image source={{ uri }}> like Week 2).
export default function BannerPicker({ value, category, onChange, error }: BannerPickerProps) {
  const [mode, setMode] = useState<Mode>(isImageLink(value) ? "link" : "gallery");
  const [linkText, setLinkText] = useState(isImageLink(value) ? value : "");
  const [linkError, setLinkError] = useState<string | undefined>(undefined);
  const [loadFailed, setLoadFailed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Banners that match the category come first; 6 are shown until "Show all"
  const sorted = sortPresetsFor(category);
  const presets = showAll ? sorted : sorted.slice(0, 6);

  const useLink = () => {
    const problem = validateImageLink(linkText) ?? (linkText.trim() ? undefined : "Paste an image link first.");
    setLinkError(problem);
    if (!problem) {
      setLoadFailed(false);
      onChange(linkText.trim());
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Event banner</Text>

      {value ? (
        <BannerImage
          banner={value}
          style={[styles.preview, error ? styles.previewError : null]}
          onLoadError={() => setLoadFailed(true)}
        >
          <View style={styles.previewTag}>
            <Ionicons name="checkmark-circle" size={15} color={Colors.success} />
            <Text style={styles.previewTagText}>Banner selected</Text>
          </View>
        </BannerImage>
      ) : (
        <View style={[styles.preview, styles.empty, error ? styles.previewError : null]}>
          <Ionicons name="image-outline" size={34} color={Colors.primary} />
          <Text style={styles.emptyTitle}>No banner yet</Text>
          <Text style={styles.emptyText}>Every event needs a banner. Pick one below.</Text>
        </View>
      )}

      {error ? (
        <View style={styles.errorRow}>
          <Ionicons name="alert-circle" size={14} color={Colors.danger} />
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}
      {loadFailed && isImageLink(value) ? (
        <Text style={styles.warning}>
          This image couldn’t be loaded. Check the link or choose from the gallery.
        </Text>
      ) : null}

      {/* Gallery / Image link switch */}
      <View style={styles.segment}>
        {(["gallery", "link"] as Mode[]).map((m) => (
          <Pressable
            key={m}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === m }}
            onPress={() => setMode(m)}
            style={[styles.segmentItem, mode === m && styles.segmentActive]}
          >
            <Ionicons
              name={m === "gallery" ? "images-outline" : "link-outline"}
              size={16}
              color={mode === m ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.segmentText, mode === m && styles.segmentTextActive]}>
              {m === "gallery" ? "Gallery" : "Image link"}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === "gallery" ? (
        <View style={styles.grid}>
          {presets.map((preset) => {
            const selected = preset.id === value;
            return (
              <Pressable
                key={preset.id}
                accessibilityRole="button"
                accessibilityLabel={`${preset.label} banner`}
                accessibilityState={{ selected }}
                onPress={() => {
                  setLoadFailed(false);
                  onChange(preset.id);
                }}
                style={styles.thumbWrap}
              >
                <BannerImage
                  banner={preset.id}
                  style={[styles.thumb, selected && styles.thumbSelected]}
                >
                  {selected ? (
                    <View style={styles.check}>
                      <Ionicons name="checkmark" size={14} color={Colors.white} />
                    </View>
                  ) : null}
                </BannerImage>
                <Text style={[styles.thumbLabel, selected && styles.thumbLabelSelected]} numberOfLines={1}>
                  {preset.label}
                </Text>
              </Pressable>
            );
          })}
          <Pressable
            accessibilityRole="button"
            onPress={() => setShowAll((prev) => !prev)}
            style={styles.showAll}
          >
            <Text style={styles.showAllText}>
              {showAll ? "Show fewer banners" : `Show all ${sorted.length} banners`}
            </Text>
            <Ionicons name={showAll ? "chevron-up" : "chevron-down"} size={16} color={Colors.primary} />
          </Pressable>
        </View>
      ) : (
        <View>
          <FormField
            label="Image link"
            icon="link-outline"
            value={linkText}
            onChangeText={(text) => {
              setLinkText(text);
              setLinkError(undefined);
            }}
            placeholder="https://example.com/banner.jpg"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            hint="Use a wide picture (about 2:1) so it fits the card."
            error={linkError}
          />
          <Button title="Use this image" icon="checkmark" variant="secondary" size="sm" onPress={useLink} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  label: { fontSize: FontSize.small, color: Colors.text, marginBottom: 8, fontWeight: "600" },
  preview: { height: 170, borderRadius: Radius.xl },
  previewError: { borderWidth: 2, borderColor: Colors.danger },
  previewTag: {
    position: "absolute",
    left: 12,
    bottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.glass,
  },
  previewTagText: { fontSize: FontSize.caption, fontWeight: "700", color: Colors.text },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CFC6F5",
    backgroundColor: Colors.primarySoft,
    padding: 16,
  },
  emptyTitle: { fontSize: FontSize.body, fontWeight: "800", color: Colors.text, marginTop: 8 },
  emptyText: { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 4, textAlign: "center" },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 8 },
  error: { fontSize: FontSize.caption, color: Colors.danger, fontWeight: "500" },
  warning: { fontSize: FontSize.caption, color: Colors.warning, marginTop: 8, fontWeight: "600" },
  segment: {
    flexDirection: "row",
    backgroundColor: Colors.primarySoft,
    borderRadius: Radius.pill,
    padding: 4,
    marginTop: 14,
    marginBottom: 14,
  },
  segmentItem: {
    flex: 1,
    height: 38,
    borderRadius: Radius.pill,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  segmentActive: { backgroundColor: Colors.surface },
  segmentText: { fontSize: FontSize.small, fontWeight: "600", color: Colors.textMuted },
  segmentTextActive: { color: Colors.primary, fontWeight: "800" },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  thumbWrap: { width: "31.5%", marginBottom: 12 },
  thumb: { height: 62, borderRadius: Radius.md, borderWidth: 2, borderColor: "transparent" },
  thumbSelected: { borderColor: Colors.primary, borderWidth: 3 },
  check: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbLabel: { fontSize: FontSize.caption, color: Colors.textMuted, marginTop: 5, textAlign: "center" },
  thumbLabelSelected: { color: Colors.primary, fontWeight: "700" },
  showAll: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
  },
  showAllText: { fontSize: FontSize.small, fontWeight: "700", color: Colors.primary },
});
