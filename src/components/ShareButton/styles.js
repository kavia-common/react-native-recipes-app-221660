import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  btnContainer: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    padding: 10,
    margin: 8,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.2,
    elevation: 3,
    minWidth: 40,
    minHeight: 40,
  },
  btnContainerDisabled: {
    opacity: 0.55,
  },
  iconContainer: {
    height: 20,
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  /**
   * A tiny "share" glyph built from borders so we don't add dependencies.
   * It resembles an "up-right" arrow leaving a box.
   */
  shareGlyph: {
    width: 16,
    height: 16,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: "#111827",
    transform: [{ rotate: "-45deg" }],
    borderTopRightRadius: 2,
  },
});

export default styles;
