import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Share, TouchableOpacity, View } from "react-native";
import PropTypes from "prop-types";
import styles from "./styles";

/**
 * Normalizes a value to a string (or undefined) for RN Share.
 * RN Share expects "message" and/or "url" depending on platform.
 */
function normalizeString(value) {
  if (value === null || value === undefined) return undefined;
  const str = String(value).trim();
  return str.length > 0 ? str : undefined;
}

/**
 * Builds the payload for Share.share based on provided props.
 * Prefer message; include url when present.
 */
function buildShareContent({ message, url, title }) {
  const normalizedMessage = normalizeString(message);
  const normalizedUrl = normalizeString(url);
  const normalizedTitle = normalizeString(title);

  // Share API requires at least one of message/url in most cases.
  // We keep this as defensive programming; caller can pass either/both.
  const content = {};
  if (normalizedMessage) content.message = normalizedMessage;
  if (normalizedUrl) content.url = normalizedUrl;

  // Title is supported on Android (and some other surfaces).
  // It's safe to include.
  if (normalizedTitle) content.title = normalizedTitle;

  return content;
}

/**
 * A reusable share button for Expo/React Native apps.
 *
 * - Uses the built-in React Native Share API (no extra dependencies).
 * - Supports custom rendering via `children` for full UI control.
 * - Otherwise renders a default icon-only circular button.
 */
export default function ShareButton(props) {
  const {
    message,
    url,
    title,
    disabled,
    onShareStart,
    onShareSuccess,
    onShareCancel,
    onShareError,
    children,
    style,
    accessibilityLabel,
    testID,
  } = props;

  const [sharing, setSharing] = useState(false);

  const shareContent = useMemo(
    () => buildShareContent({ message, url, title }),
    [message, url, title]
  );

  const canShare =
    !disabled &&
    !sharing &&
    (typeof shareContent.message === "string" ||
      typeof shareContent.url === "string");

  const handlePress = useCallback(async () => {
    if (!canShare) return;

    setSharing(true);
    try {
      onShareStart?.();

      const result = await Share.share(shareContent);

      // RN returns { action, activityType }.
      if (result?.action === Share.sharedAction) {
        onShareSuccess?.(result);
      } else if (result?.action === Share.dismissedAction) {
        onShareCancel?.();
      }
    } catch (err) {
      onShareError?.(err);
    } finally {
      setSharing(false);
    }
  }, [canShare, onShareStart, onShareSuccess, onShareCancel, onShareError, shareContent]);

  return (
    <TouchableOpacity
      testID={testID}
      onPress={handlePress}
      disabled={!canShare}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[
        styles.btnContainer,
        !canShare ? styles.btnContainerDisabled : null,
        style,
      ]}
      activeOpacity={0.7}
    >
      {children ? (
        children
      ) : (
        <View style={styles.iconContainer}>
          {sharing ? (
            <ActivityIndicator size="small" />
          ) : (
            // Simple "share" glyph made from shapes (no external icon libs).
            <View style={styles.shareGlyph} />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

ShareButton.propTypes = {
  /**
   * Text message to share. Recommended for most use cases.
   */
  message: PropTypes.string,
  /**
   * URL to share. Often used alongside message; platform behavior varies.
   */
  url: PropTypes.string,
  /**
   * Share dialog title (Android-supported). Optional.
   */
  title: PropTypes.string,
  /**
   * Disable interactions.
   */
  disabled: PropTypes.bool,
  /**
   * Callbacks for share lifecycle.
   */
  onShareStart: PropTypes.func,
  onShareSuccess: PropTypes.func,
  onShareCancel: PropTypes.func,
  onShareError: PropTypes.func,
  /**
   * Optional custom content to render inside the button.
   * If provided, the component will render children instead of the default glyph/spinner.
   */
  children: PropTypes.node,
  /**
   * Style override for the outer button container.
   */
  style: PropTypes.object,
  /**
   * Accessibility label for screen readers.
   */
  accessibilityLabel: PropTypes.string,
  /**
   * Test identifier.
   */
  testID: PropTypes.string,
};

ShareButton.defaultProps = {
  message: undefined,
  url: undefined,
  title: undefined,
  disabled: false,
  onShareStart: undefined,
  onShareSuccess: undefined,
  onShareCancel: undefined,
  onShareError: undefined,
  children: null,
  style: undefined,
  accessibilityLabel: "Share",
  testID: undefined,
};
