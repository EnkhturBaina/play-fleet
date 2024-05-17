import { StyleSheet, Text, Image, View } from "react-native";
import React from "react";
import { MAIN_BORDER_RADIUS, FONT_FAMILY_BOLD, MAIN_COLOR } from "../constant";
import { Dialog, Button } from "@rneui/themed";

export default function ({
  visible,
  confirmFunction,
  declineFunction,
  text,
  confirmBtnText,
  DeclineBtnText,
  type,
}) {
  var imageType = null;
  if (type == "warning") {
    imageType = require("../../assets/warning.png");
  } else if (type == "error") {
    imageType = require("../../assets/checkmark.png");
  } else {
    imageType = require("../../assets/checkmark.png");
  }

  return (
    <Dialog
      isVisible={visible}
      overlayStyle={{
        padding: 10,
        backgroundColor: "#fff",
        borderRadius: MAIN_BORDER_RADIUS,
        alignItems: "center",
      }}
    >
      <Image source={imageType} style={{ width: 100, height: 100 }} />
      <Text
        style={{
          fontFamily: FONT_FAMILY_BOLD,
          textAlign: "center",
          marginVertical: 10,
        }}
      >
        {text}
      </Text>
      <Dialog.Actions>
        <View
          style={{
            width: "100%",
            flexDirection: "column",
          }}
        >
          <View style={{ marginHorizontal: 50 }}>
            <Button
              containerStyle={{
                width: "100%",
              }}
              buttonStyle={{
                backgroundColor: MAIN_COLOR,
                borderRadius: MAIN_BORDER_RADIUS,
                paddingVertical: 10,
              }}
              title={confirmBtnText}
              titleStyle={{
                fontSize: 16,
                fontFamily: FONT_FAMILY_BOLD,
              }}
              onPress={() => confirmFunction()}
            />
          </View>
          {DeclineBtnText != "" ? (
            <Dialog.Button
              title={DeclineBtnText}
              onPress={() => declineFunction()}
              containerStyle={styles.dialogDeclineBtn}
              radius={MAIN_BORDER_RADIUS}
              titleStyle={{
                fontFamily: FONT_FAMILY_BOLD,
                color: "#000",
              }}
            />
          ) : null}
        </View>
      </Dialog.Actions>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  dialogBtn: {
    marginBottom: 10,
    marginHorizontal: 50,
    backgroundColor: MAIN_COLOR,
  },
  dialogDeclineBtn: {
    marginHorizontal: 50,
    marginVertical: 5,
  },
});
