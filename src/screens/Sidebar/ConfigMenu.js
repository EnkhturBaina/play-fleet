import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useContext, useRef } from "react";
import { Icon } from "@rneui/base";
import { MAIN_COLOR_GRAY } from "../../constant";
import useTileLoader from "../../helper/useTileLoader";
import { useNetworkStatus } from "../../contexts/NetworkContext";
import MainContext from "../../contexts/MainContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ConfigMenu = (props) => {
	const state = useContext(MainContext);
	const { callFnc, progress } = useTileLoader(false);
	const { isConnected } = useNetworkStatus();
	const isInitialMount = useRef(true);

	useEffect(() => {
		if (isInitialMount.current) {
			// Skip the effect on initial mount
			isInitialMount.current = false;
		} else {
			// Call the function only when state.mapType changes after the initial render
			callFnc();
		}
	}, [state.mapType]);

	return (
		<View>
			{/* https://chatgpt.com/share/67a5cf70-7c60-8013-af37-7e2d50f59fc7 */}
			<TouchableOpacity
				style={styles.eachItemContainer}
				onPress={() => {
					Alert.alert("Амжилттай", "KML амжилттай шинэчлэгдлээ", [
						{ text: "Хаах", onPress: () => console.log("OK Pressed") }
					]);
				}}
			>
				<Text style={{ fontSize: 16, fontWeight: "600" }}>KML шинэчлэх</Text>
				<Icon name="chevron-right" type="feather" size={25} color={MAIN_COLOR_GRAY} />
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.eachItemContainer}
				onPress={() => {
					if (isConnected) {
						Alert.alert("Оффлайн газрын зураг татах уу?", "", [
							{
								text: "Үгүй",
								onPress: () => console.log("Cancel Pressed"),
								style: "cancel"
							},
							,
							{
								text: "Тийм",
								onPress: () => callFnc()
							}
						]);
					} else {
						Alert.alert("Интернэт холболт шалгана уу?", "", [
							,
							{
								text: "Хаах",
								onPress: () => null
							}
						]);
					}
				}}
			>
				<View>
					<Text style={{ fontSize: 16, fontWeight: "600" }}>Газрын зураг татах</Text>
					<Text style={{ fontSize: 12 }}>{progress}</Text>
				</View>
				<Icon name="chevron-right" type="feather" size={25} color={MAIN_COLOR_GRAY} />
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.eachItemContainer}
				onPress={() => {
					if (isConnected) {
						Alert.alert("Газрын зураг солих уу?", "Оффлайн газрын зураг шинээр татагдана.", [
							{
								text: "Үгүй",
								onPress: () => console.log("Cancel Pressed"),
								style: "cancel"
							},
							,
							{
								text: "Тийм",
								onPress: async () => {
									var mapType = "";
									if (state.mapType == "standard") {
										mapType = "satellite";
									} else {
										mapType = "standard";
									}
									await AsyncStorage.setItem("L_map_type", mapType).then(() => {
										state.setMapType(mapType);
									});
								}
							}
						]);
					} else {
						Alert.alert("Интернэт холболт шалгана уу?", "", [
							,
							{
								text: "Хаах",
								onPress: () => null
							}
						]);
					}
				}}
			>
				<View>
					<Text style={{ fontSize: 16, fontWeight: "600" }}>Газрын зураг солих</Text>
					<Text style={{ fontSize: 12 }}>
						{state.mapType == "satellite" ? "Satellite – Хиймэл дагуул" : "Standard – Стандарт"}
					</Text>
				</View>
				<Icon name="chevron-right" type="feather" size={25} color={MAIN_COLOR_GRAY} />
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.eachItemContainer}
				onPress={() => state.setShowLocationInfo(!state.showLocationInfo)}
			>
				<Text style={{ fontSize: 16, fontWeight: "600" }}>Байршил харах</Text>
				<Icon name="chevron-right" type="feather" size={25} color={MAIN_COLOR_GRAY} />
			</TouchableOpacity>
			<TouchableOpacity style={styles.eachItemContainer} onPress={() => state.setIsTrack(!state.isTrack)}>
				<View>
					<Text style={{ fontSize: 16, fontWeight: "600" }}>Байршил дагах</Text>
					<Text style={{ fontSize: 12 }}>{state.isTrack ? "Тийм" : "Үгүй"}</Text>
				</View>
				<Icon name="chevron-right" type="feather" size={25} color={MAIN_COLOR_GRAY} />
			</TouchableOpacity>
		</View>
	);
};

export default ConfigMenu;

const styles = StyleSheet.create({
	eachItemContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		height: 60,
		paddingHorizontal: 10,
		borderBottomColor: MAIN_COLOR_GRAY,
		borderBottomWidth: 1,
		paddingHorizontal: 10
	}
});
