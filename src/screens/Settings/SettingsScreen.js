import React, { useLayoutEffect } from "react";
import { View, Text } from "react-native";
import styles from "./styles";

// PUBLIC_INTERFACE
export default function SettingsScreen(props) {
  /** Settings screen (placeholder) shown when user taps Settings in the drawer. */
  const { navigation } = props;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Settings",
      headerTitleStyle: {
        fontWeight: "bold",
      },
      headerTitleAlign: "center",
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>
        This is a placeholder Settings screen.
      </Text>
    </View>
  );
}
