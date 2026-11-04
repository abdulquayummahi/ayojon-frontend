import { Ionicons } from "@expo/vector-icons";
import { ReactNode, useEffect, useState } from "react";
import { Image, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { Colors } from "../../constants/theme";
import { getBannerSource } from "../../utils/images";

interface BannerImageProps {
  banner: string; // preset id or image link (see AppEvent.banner)
  style?: StyleProp<ViewStyle>; // size and corner radius of the image box
  children?: ReactNode; // anything drawn on top of the image (badges, buttons)
  onLoadError?: () => void;
}

// Event banner picture. Shows a calm placeholder if a pasted link can't load.
export default function BannerImage({
  banner,
  style,
  children,
  onLoadError,
}: BannerImageProps) {
  const [failed, setFailed] = useState(false);

  // A new banner gets a new chance to load
  useEffect(() => {
    setFailed(false);
  }, [banner]);

  return (
    <View style={[styles.box, style]}>
      {failed ? (
        <View style={styles.fallback}>
          <Ionicons name="image-outline" size={34} color={Colors.primary} />
        </View>
      ) : (
        <Image
          source={getBannerSource(banner)}
          style={styles.image}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
          onError={() => {
            setFailed(true);
            onLoadError?.();
          }}
        />
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { overflow: "hidden", backgroundColor: Colors.primaryLight },
  // width/height 100% (not only absoluteFill) so web doesn't use the file's own size
  image: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  fallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
});
