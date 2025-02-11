import { ActivityIndicator, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import MainContext from "../contexts/MainContext";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR, MAIN_COLOR_GRAY } from "../constant";
import { Button } from "@rneui/themed";

const SelectEquipmentScreen = () => {
	const state = useContext(MainContext);
	const [selectedEq, setSelectedEq] = useState(null);

	useEffect(() => {
		console.log("state", state.equipmentsData);
	}, []);

	const data = [
		{ id: 1, TypeName: "Truck", Name: "CAT-773-04" },
		{ id: 2, TypeName: "Loader", Name: "CAT-773-03" }
	];
	return (
		<View
			style={{
				flex: 1,
				paddingTop: Constants.statusBarHeight,
				backgroundColor: "#fff",
				paddingBottom: 50
			}}
		>
			<StatusBar translucent hidden={false} barStyle={Platform.OS == "ios" ? "dark-content" : "default"} />
			<Text style={{ textAlign: "center", fontSize: 24, fontWeight: "600", marginTop: 20 }}>Төхөөрөмж сонгоно уу.</Text>
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					flexDirection: state.orientation == "PORTRAIT" ? "column" : "row",
					alignItems: "center"
				}}
			>
				{state.equipmentsData &&
					state.equipmentsData?.map((el, index) => {
						var imageType = null;
						if (el.TypeName == "Truck") {
							imageType = require("../../assets/status/truck_main.png");
						} else if (el.TypeName == "Loader") {
							imageType = require("../../assets/status/loader_main.png");
						} else {
							imageType = require("../../assets/status/other_main.png");
						}
						return (
							<TouchableOpacity
								key={index}
								style={{
									justifyContent: "center",
									flexDirection: "column",
									alignItems: "center",
									borderWidth: selectedEq?.id == el.id ? 3 : 2,
									borderRadius: MAIN_BORDER_RADIUS,
									borderColor: selectedEq?.id == el.id ? MAIN_COLOR : "#504b5a",
									padding: 10,
									margin: 10
								}}
								onPress={() => {
									setSelectedEq(el);
								}}
							>
								<Image source={imageType} contentFit="contain" style={{ width: 100, height: 100 }} />
								<Text style={{ fontWeight: "600" }}>{el.Name}</Text>
							</TouchableOpacity>
						);
					})}
			</View>
			<Button
				disabled={selectedEq == null}
				containerStyle={{
					width: state.orientation == "PORTRAIT" ? "80%" : "40%",
					marginTop: 10,
					alignSelf: "center"
				}}
				buttonStyle={styles.loginBtnStyle}
				title="Үргэлжлүүлэх"
				titleStyle={{
					fontSize: 16,
					fontWeight: "bold"
				}}
				onPress={() => {
					console.log("selectedEq", selectedEq);

					state.setSelectedEquipment(selectedEq);
				}}
			/>
		</View>
	);
};

export default SelectEquipmentScreen;

const styles = StyleSheet.create({
	loginBtnStyle: {
		backgroundColor: MAIN_COLOR,
		borderRadius: MAIN_BORDER_RADIUS,
		paddingVertical: 10,
		height: MAIN_BUTTON_HEIGHT
	}
});
