import { StyleSheet, Text, View, Image } from "react-native";
import React from "react";
import empty from "../../assets/empty.png";
import { FONT_FAMILY_BOLD } from "../constant";

const Empty = ({ text }) => {
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Image
        source={empty}
        style={{ width: "45%", height: "60%" }}
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
};

export default Empty;

const styles = StyleSheet.create({
  emptyText: {
    fontFamily: FONT_FAMILY_BOLD,
    textAlign: "center",
    marginTop: 10,
  },
});
