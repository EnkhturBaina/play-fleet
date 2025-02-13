import { ActivityIndicator, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import MainContext from "../contexts/MainContext";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR } from "../constant";
import { Button } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SelectEquipmentScreen = () => {
	const state = useContext(MainContext);
	const [selectedEq, setSelectedEq] = useState(null);
	const [savingEq, setSavingEq] = useState(false);

	useEffect(() => {
		getLocalSelectedEq();
	}, []);

	const data = [
		{ id: 1, TypeName: "Truck", Name: "CAT-773-04" },
		{ id: 2, TypeName: "Loader", Name: "CAT-773-03" }
	];

	const saveSelectedEqToLocal = async () => {
		//Local руу сонгогдсон Equipment хадгалах
		try {
			setSavingEq(true);

			await AsyncStorage.setItem("selected_eq", JSON.stringify(selectedEq)).then(() => {
				state.setSelectedEquipment(selectedEq);
				setSavingEq(false);
			});
		} catch (error) {
			console.log("Saving selected EQ error=> ", error);
		}
	};
	const getLocalSelectedEq = async () => {
		//Өмнө сонгогдсон Equipment Local -с авах
		try {
			setSavingEq(true);
			const jsonValue = await AsyncStorage.getItem("selected_eq");
			console.log("jsonValue", jsonValue);

			if (jsonValue != null) {
				const selectedLocalEq = JSON.parse(jsonValue);
				state.setSelectedEquipment(selectedLocalEq);
				setSavingEq(false);
			} else {
				setSavingEq(false);
			}
		} catch (error) {
			console.error("Error getting object", error);
		}
	};

	return (
		<View
			style={{
				flex: 1,
				paddingTop: Constants.statusBarHeight,
				backgroundColor: "#fff",
				paddingBottom: 20
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
									console.log("el", el);
								}}
							>
								<Image source={imageType} contentFit="contain" style={{ width: 100, height: 100 }} />
								<Text style={{ fontWeight: "600" }}>{el.Name}</Text>
							</TouchableOpacity>
						);
					})}
			</View>
			<Button
				disabled={savingEq || selectedEq == null}
				containerStyle={{
					width: state.orientation == "PORTRAIT" ? "90%" : "50%",
					marginTop: 10,
					alignSelf: "center"
				}}
				buttonStyle={styles.loginBtnStyle}
				title={
					<>
						<Text
							style={{
								fontSize: 16,
								color: "#fff",
								fontWeight: "bold"
							}}
						>
							Үргэлжлүүлэх
						</Text>
						{savingEq ? <ActivityIndicator style={{ marginLeft: 10 }} color="#fff" /> : null}
					</>
				}
				titleStyle={{
					fontSize: 16,
					fontWeight: "bold"
				}}
				onPress={() => {
					saveSelectedEqToLocal();
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
