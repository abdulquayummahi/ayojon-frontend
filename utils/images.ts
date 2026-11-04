import { ImageSourcePropType } from "react-native";
import { BANNER_PRESETS } from "../data/banners";
import { EventCategory } from "../types/models";

export function isImageLink(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value.trim());
}

export function findPreset(id: string) {
  return BANNER_PRESETS.find((b) => b.id === id);
}

// Turns an event's `banner` value into something <Image source> accepts:
// a bundled preset → require(...) result, a link → { uri }.
export function getBannerSource(banner: string): ImageSourcePropType {
  if (isImageLink(banner)) return { uri: banner.trim() };
  return (findPreset(banner) ?? BANNER_PRESETS[BANNER_PRESETS.length - 1]).image;
}

// Presets that match the chosen category come first in the picker
export function sortPresetsFor(category: EventCategory | "") {
  return [...BANNER_PRESETS].sort((a, b) => {
    const score = (c: string) => (c === category ? 0 : c === "Any" ? 1 : 2);
    return score(a.category) - score(b.category);
  });
}
