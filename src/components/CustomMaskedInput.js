import { StyleSheet, Text, View } from "react-native";
import React from "react";
import {
  FONT_FAMILY_BOLD,
  FONT_FAMILY_LIGHT,
  MAIN_COLOR_GRAY,
} from "../constant";
import MaskInput from "react-native-mask-input";

const CustomMaskedInput = (props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{props.label}</Text>
      <MaskInput
        {...props}
        autoCorrect={false}
        autoCapitalize={"characters"}
        returnKeyType="done"
        style={[
          styles.generalInput,
          { backgroundColor: !props.disabled ? "#fff" : MAIN_COLOR_GRAY },
        ]}
        editable={!props.disabled}
        selectTextOnFocus={false}
      />
    </View>
  );
};

export default CustomMaskedInput;

const styles = StyleSheet.create({
  container: {},
  generalInput: {
    paddingLeft: 15,
    paddingRight: 10,
    backgroundColor: "#fff",
    marginBottom: 5,
    height: 40,
    borderRadius: 8,
    fontFamily: FONT_FAMILY_LIGHT,
    borderWidth: 1,
    borderColor: MAIN_COLOR_GRAY,
    color: "#000",
  },
  label: {
    fontFamily: FONT_FAMILY_BOLD,
    padding: 5,
  },
});
