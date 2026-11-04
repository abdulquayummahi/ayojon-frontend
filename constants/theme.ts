// Ayojon design tokens — used by every StyleSheet in the app.
// Keeping colours, spacing, text sizes and shadows in one place makes every
// screen look like part of the same app.

export const Colors = {
  primary: "#5B3FD6",
  primaryDark: "#4529B8",
  primaryLight: "#EEEAFD",
  primarySoft: "#F5F2FF",
  background: "#F6F5FB",
  surface: "#FFFFFF",
  text: "#16162A",
  textMuted: "#6B6B80",
  textLight: "#9A9AAE",
  border: "#E7E5F0",
  success: "#1E8E5A",
  successLight: "#E3F6EC",
  danger: "#D64545",
  dangerLight: "#FDECEC",
  warning: "#B7791F",
  warningLight: "#FEF5E7",
  dark: "#1C1A33",
  white: "#FFFFFF",
  overlay: "rgba(17, 12, 46, 0.55)",
  glass: "rgba(255, 255, 255, 0.92)",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
};

export const FontSize = {
  caption: 12,
  small: 13,
  body: 15,
  lead: 17,
  title: 20,
  heading: 26,
  display: 32,
};

// Shadow presets (iOS shadow* props + Android elevation, as in the Week 1 lab)
export const Shadow = {
  card: {
    shadowColor: "#2A1E6B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  raised: {
    shadowColor: "#2A1E6B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
  },
};
