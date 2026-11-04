import { ImageSourcePropType } from "react-native";
import { EventCategory } from "../types/models";

// Preset event banners bundled with the app (assets/banners).
// They load offline, so the demo never shows a broken image.
// An organizer can also paste their own image link instead.
export interface BannerPreset {
  id: string;
  label: string;
  category: EventCategory | "Any";
  image: ImageSourcePropType;
}

export const BANNER_PRESETS: BannerPreset[] = [
  { id: "workshop-ideas", label: "Ideas", category: "Workshop", image: require("../assets/banners/workshop-ideas.jpg") },
  { id: "workshop-laptop", label: "Code", category: "Workshop", image: require("../assets/banners/workshop-laptop.jpg") },
  { id: "seminar-stage", label: "Stage", category: "Seminar", image: require("../assets/banners/seminar-stage.jpg") },
  { id: "seminar-career", label: "Career", category: "Seminar", image: require("../assets/banners/seminar-career.jpg") },
  { id: "sports-football", label: "Football", category: "Sports", image: require("../assets/banners/sports-football.jpg") },
  { id: "sports-run", label: "Running", category: "Sports", image: require("../assets/banners/sports-run.jpg") },
  { id: "concert-lights", label: "Lights", category: "Concert", image: require("../assets/banners/concert-lights.jpg") },
  { id: "concert-acoustic", label: "Acoustic", category: "Concert", image: require("../assets/banners/concert-acoustic.jpg") },
  { id: "community-nature", label: "Outdoors", category: "Community", image: require("../assets/banners/community-nature.jpg") },
  { id: "community-camera", label: "Photo walk", category: "Community", image: require("../assets/banners/community-camera.jpg") },
  { id: "general-celebration", label: "Celebration", category: "Any", image: require("../assets/banners/general-celebration.jpg") },
  { id: "general-waves", label: "Waves", category: "Any", image: require("../assets/banners/general-waves.jpg") },
];

// Profile photo choices — the same pravatar.cc placeholders used in the
// Week 2 StudentDirectory lab.
export const AVATAR_OPTIONS: string[] = [1, 5, 8, 9, 12, 13, 16, 32, 33, 47, 52, 59].map(
  (n) => `https://i.pravatar.cc/150?img=${n}`
);
