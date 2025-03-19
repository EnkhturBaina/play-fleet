import { ActivityIndicator, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import MainContext from "../contexts/MainContext";
import Constants from "expo-constants";
import { Image } from "expo-image";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR } from "../constant";
import { Button } from "@rneui/themed";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Empty from "../components/Empty";

const SelectEquipmentScreen = () => {
	const state = useContext(MainContext);
	const [selectedEq, setSelectedEq] = useState(null);
	const [savingEq, setSavingEq] = useState(false);

	useEffect(() => {
		console.log("SelectEquipmentScreen=================>");

		getLocalSelectedEq();
	}, []);

	const saveSelectedEqToLocal = async () => {
		//Local руу сонгогдсон Equipment хадгалах
		try {
			setSavingEq(true);

			await AsyncStorage.setItem("L_selected_eq", JSON.stringify(selectedEq)).then(() => {
				console.log("selectedEq==============>", selectedEq);
				setSelectedEqCode(selectedEq.TypeName);
				state.setSelectedEquipment(selectedEq);
				setSavingEq(false);
			});
		} catch (error) {
			console.log("error Saving selected EQ => ", error);
		}
	};
	const getLocalSelectedEq = async () => {
		console.log("RUN get LocalSelectedEq");

		//Өмнө сонгогдсон Equipment Local -с авах
		try {
			setSavingEq(true);
			const jsonValue = await AsyncStorage.getItem("L_selected_eq");
			console.log("getLocalSelectedEq =============>", jsonValue);

			if (jsonValue != null) {
				const selectedLocalEq = JSON.parse(jsonValue);
				setSelectedEqCode(selectedLocalEq.TypeName);
				state.setSelectedEquipment(selectedLocalEq);
				setSavingEq(false);
			} else {
				setSavingEq(false);
			}
		} catch (error) {
			console.error("Error getting object", error);
		}
	};

	const setSelectedEqCode = (data) => {
		if (data == "Truck") {
			state.setSelectedEquipmentCode(0);
		} else if (data == "Loader") {
			state.setSelectedEquipmentCode(1);
		} else {
			state.setSelectedEquipmentCode(999);
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
				{state.equipmentsData?.length == 0 ? (
					<View>
						<Empty text="Төхөөрөмж олдсонгүй" />
					</View>
				) : (
					state.equipmentsData &&
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
					})
				)}
			</View>
			{state.equipmentsData?.length == 0 ? (
				<Button
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
								Буцах
							</Text>
							{savingEq ? <ActivityIndicator style={{ marginLeft: 10 }} color="#fff" /> : null}
						</>
					}
					titleStyle={{
						fontSize: 16,
						fontWeight: "bold"
					}}
					onPress={() => {
						state.logout();
					}}
				/>
			) : (
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
			)}
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
