import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import React, { useContext, useEffect, useState, useRef } from "react";
import RBSheet from "react-native-raw-bottom-sheet";
import { FONT_FAMILY_BOLD, MAIN_COLOR } from "../constant";

const BottomSheetRequest = ({
  bodyText, //sheet -н text
  dragDown, //sheet -г доош чирж хаах
  backClick, //sheet -н гадна дарж хаах
  displayName, //Дамжуулсан Object -н харуулах field
  handle,
  action, // parent Fn
  isColor,
}) => {
  const sheetRef = useRef(); //Bottomsheet
  const [heightBottomSheet, setHeightBottomSheet] = useState(0);
  useEffect(() => {
    if (bodyText && bodyText.length == 1) {
      setHeightBottomSheet(Platform.OS == "ios" ? 90 : 80);
    } else if (bodyText && bodyText.length == 2) {
      setHeightBottomSheet(130);
    } else if (bodyText && bodyText.length == 3) {
      setHeightBottomSheet(180);
    } else if (bodyText && bodyText.length == 4) {
      setHeightBottomSheet(210);
    } else if (bodyText && bodyText.length > 4) {
      setHeightBottomSheet(400);
    } else {
      setHeightBottomSheet(0);
    }
  }, [handle]);

  useEffect(() => {
    bodyText && heightBottomSheet > 0 ? sheetRef.current.open() : null;
  }, [heightBottomSheet]);

  const functionCombined = (e) => {
    sheetRef.current.close();
    action(e);
  };

  return (
    <View>
      <RBSheet
        ref={sheetRef}
        height={heightBottomSheet}
        closeOnDragDown={dragDown} //sheet -г доош чирж хаах
        closeOnPressMask={backClick} //sheet -н гадна дарж хаах
        customStyles={{
          container: {
            backgroundColor: "#fff",
            flexDirection: "column",
            borderTopEndRadius: 16,
            borderTopStartRadius: 16,
          },
          draggableIcon: {
            backgroundColor: "#000",
          },
        }}
        onClose={() => {
          setHeightBottomSheet(0);
        }}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.lookupcontainer}>
            <ScrollView
              contentContainerStyle={{
                backgroundColor: "#fff",
              }}
            >
              {bodyText?.length > 1 ? (
                bodyText?.map((el, index) => {
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => functionCombined(el)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      {isColor ? (
                        <View
                          style={{
                            height: 20,
                            width: 40,
                            borderRadius: 8,
                            backgroundColor: el?.category?.CalendarColor,
                          }}
                        ></View>
                      ) : null}
                      <Text style={styles.bottomSheetBodyLookup}>
                        {el[displayName]}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              ) : (
                <TouchableOpacity
                  onPress={() => functionCombined(bodyText[0])}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {isColor ? (
                    <View
                      style={{
                        height: 20,
                        width: 40,
                        borderRadius: 8,
                        backgroundColor: bodyText[0]?.category?.CalendarColor,
                      }}
                    ></View>
                  ) : null}
                  <Text style={styles.bottomSheetBodyLookup}>
                    {bodyText[0]?.[displayName]}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </View>
      </RBSheet>
    </View>
  );
};

export default BottomSheetRequest;

const styles = StyleSheet.create({
  bottomSheetContainer: {
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  lookupcontainer: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
    paddingBottom: Platform.OS == "ios" ? 30 : 25,
  },
  bottomSheetBodyLookup: {
    fontFamily: FONT_FAMILY_BOLD,
    fontSize: 18,
    padding: 10,
    flex: 1,
  },
});
