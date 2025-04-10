import { useContext, useEffect, useState } from "react";
import { Linking, Platform, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { Image } from "expo-image";
import { Button } from "@rneui/base";
import * as Location from "expo-location"; // Байршлын зөвшөөрөл авах
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR } from "../constant";
import MainContext from "../contexts/MainContext";
import { useIsFocused } from "@react-navigation/native";

const LocationPermissionScreen = () => {
	const [permissionStatus, setPermissionStatus] = useState(null);
	const state = useContext(MainContext);
	const isFocused = useIsFocused();

	useEffect(() => {
		const checkPermission = async () => {
			const { status } = await Location.getForegroundPermissionsAsync();
			setPermissionStatus(status);
			state.setLocationStatus(status);
		};

		checkPermission();
	}, [isFocused]);

	const openSettings = () => {
		if (Platform.OS === "ios") {
			Linking.openURL("app-settings:");
		} else {
			Linking.openSettings();
		}
	};

	const requestPermission = async () => {
		const { status } = await Location.requestForegroundPermissionsAsync();
		setPermissionStatus(status);
		if (status === "granted") {
			// Байршил зөвшөөрөл олгогдсон бол `locationStatus`-г шинэчлэх
			console.log("📍 Байршил зөвшөөрөгдсөн!");
		} else {
			console.warn("📍 Байршил зөвшөөрөгдөөгүй байна!");
		}
	};

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

			{/* Байршлын зөвшөөрөл олгосон эсэхийг шалгах */}
			{permissionStatus === "granted" ? (
				<Text style={{ color: "#32CD32", fontWeight: "bold" }}>Байршлын зөвшөөрөл олгогдсон!</Text>
			) : (
				<Text style={{ color: "#FF6347", fontWeight: "bold" }}>Байршлын зөвшөөрөл олгоогүй байна!</Text>
			)}

			<Button
				containerStyle={{
					marginTop: 10,
					alignSelf: "center",
					width: "80%"
				}}
				buttonStyle={styles.loginBtnStyle}
				title={permissionStatus === "granted" ? "Үргэлжлүүлэх" : "Зөвшөөрлийг олгох"}
				titleStyle={{
					fontSize: 16,
					fontWeight: "bold"
				}}
				onPress={() => {
					if (permissionStatus === "granted") {
						// Байршлын зөвшөөрөл олгогдсон бол, үйл ажиллагааг үргэлжлүүлэх
						console.log("Зөвшөөрөл олгогдсон, үргэлжлүүлж болно.");
						requestPermission();
					} else {
						// Байршлын зөвшөөрөл асуух
						openSettings();
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
