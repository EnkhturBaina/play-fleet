import { Linking, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { Button } from "@rneui/base";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR } from "../constant";

const LocationPermissionScreen = () => {
	return (
		<SafeAreaView
			style={{
				flex: 1,
				flexDirection: "column",
				justifyContent: "center",
				alignItems: "center",
				marginHorizontal: 20
			}}
		>
			<Image
				source={require("../../assets/location_permission.png")}
				style={{ width: 200, height: 200 }}
				contentFit="contain"
			/>
			<Text style={{ fontWeight: "600", fontSize: 22, textAlign: "center", marginBottom: 10 }}>
				Байршлын тохиргоо зөвшөөрнө үү
			</Text>
			<Text style={{ fontSize: 14, textAlign: "center", marginBottom: 10, color: "#667085" }}>
				Байршлын тохиргоо зөвшөөрснөөр та өөрийн болон уурхайн байршлыг харах боломжтой болно.
			</Text>
			<Button
				containerStyle={{
					marginTop: 10,
					alignSelf: "center",
					width: "80%"
				}}
				buttonStyle={styles.loginBtnStyle}
				title="Үргэлжлүүлэх"
				titleStyle={{
					fontSize: 16,
					fontWeight: "bold"
				}}
				onPress={() => {
					if (Platform.OS === "ios") {
						Linking.openURL("app-settings:");
					} else {
						Linking.openSettings();
					}
				}}
			/>
		</SafeAreaView>
	);
};

export default LocationPermissionScreen;

const styles = StyleSheet.create({
	loginBtnStyle: {
		backgroundColor: MAIN_COLOR,
		borderRadius: MAIN_BORDER_RADIUS,
		paddingVertical: 10,
		height: MAIN_BUTTON_HEIGHT
	}
});
