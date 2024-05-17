import { StyleSheet, Text } from "react-native";
import React from "react";
import { Snackbar } from "react-native-paper";
import { FONT_FAMILY_BOLD } from "../constant";

export default function ({ visible, dismiss, text, topPos }) {
  return (
    <Snackbar
      visible={visible}
      onDismiss={dismiss}
      wrapperStyle={{ top: topPos, zIndex: 9999 }}
      duration={2000}
      style={{ backgroundColor: "#89898c" }}
      action={{
        label: "Хаах",
        onPress: () => {
          // Do something
        },
      }}
    >
      <Text
        style={{
          color: "#fff",
          lineHeight: 24,
          fontFamily: FONT_FAMILY_BOLD,
          fontSize: 16,
        }}
      >
        {text}
      </Text>
    </Snackbar>
  );
}

const styles = StyleSheet.create({});
