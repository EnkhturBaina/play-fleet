import {
	StyleSheet,
	Text,
	View,
	StatusBar,
	Platform,
	ScrollView,
	ActivityIndicator,
	TouchableOpacity
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Constants from "expo-constants";
import { Button, Icon } from "@rneui/base";
import { MAIN_BUTTON_HEIGHT, MAIN_COLOR, MAIN_COLOR_GREEN, MAIN_COLOR_RED, SERVER_URL } from "../../constant";
import axios from "axios";
import MainContext from "../../contexts/MainContext";
import HeaderUser from "../../components/HeaderUser";
import AsyncStorage from "@react-native-async-storage/async-storage";

const InspectionReportScreen = (props) => {
	const state = useContext(MainContext);

	const [mainData, setMainData] = useState(null);
	const [inspectionData, setInspectionData] = useState(null);
	const [loadingInspections, setLoadingInspections] = useState(false);

	const getInspections = async (inspectionId) => {
		setInspectionData(null);
		setLoadingInspections(true);
		try {
			await axios
				.post(
					`${SERVER_URL}/mobile/inspection/item`,
					{
						id: inspectionId
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					// console.log("report get Inspections response", JSON.stringify(response.data));
					if (response.data?.Type == 0) {
						setMainData(response.data?.Extra);
						setInspectionData(response.data?.Extra[0]?.inspections);
					}
				})
				.catch(function (error) {
					console.log("error report get Inspections", error.response.data);
				})
				.finally(() => {
					setLoadingInspections(false);
				});
		} catch (error) {
			console.log("CATCH get Inspections", error);
		}
	};

	useEffect(() => {
		const fetchInspectionId = async () => {
			try {
				const inspectionId = await AsyncStorage.getItem("L_inspection_id");
				if (inspectionId) {
					getInspections(inspectionId);
				}
			} catch (e) {
				console.error("Failed to fetch inspectionId:", e);
			}
		};

		fetchInspectionId(); // async функцыг дуудаж байна
	}, []);

	return (
		<View
			style={{
				flex: 1,
				paddingTop: Constants.statusBarHeight,
				backgroundColor: "#fff",
				paddingBottom: 20
			}}
		>
			<StatusBar translucent barStyle={Platform.OS == "ios" ? "dark-content" : "default"} />
			<HeaderUser isShowNotif={true} />
			<TouchableOpacity
				onPress={() => {
					props.navigation.goBack();
				}}
				style={{
					flexDirection: "row",
					alignItems: "center",
					backgroundColor: "#2C2E45",
					height: 50,
					paddingHorizontal: 10
				}}
				activeOpacity={0.8}
			>
				<Icon name="chevron-left" type="feather" size={25} color="#fff" />
				<Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>Ээлжийн өмнөх үзлэг</Text>
			</TouchableOpacity>
			<ScrollView
				contentContainerStyle={{
					flexGrow: 1,
					paddingHorizontal: 10
				}}
				bounces={false}
				showsVerticalScrollIndicator={false}
			>
				{loadingInspections ? (
					<ActivityIndicator color={MAIN_COLOR} style={{ flex: 1 }} size={"large"} />
				) : (
					inspectionData?.map((el, index) => {
						return (
							<View style={styles.eachRowContainer} key={index}>
								<Text style={{ width: "68%" }}>{el.code?.Name}</Text>
								<Button
									containerStyle={{}}
									buttonStyle={{
										backgroundColor: el.Checked ? MAIN_COLOR_GREEN : MAIN_COLOR_RED,
										paddingVertical: 10,
										height: MAIN_BUTTON_HEIGHT
									}}
									disabledStyle={{
										backgroundColor: el.Checked ? MAIN_COLOR_GREEN : MAIN_COLOR_RED,
										paddingVertical: 10,
										height: MAIN_BUTTON_HEIGHT
									}}
									title={el.Checked ? "ТЭНЦСЭН" : "ТЭНЦЭЭГҮЙ"}
									titleStyle={{
										fontSize: 14
									}}
									disabled
									disabledTitleStyle={{ color: "#fff" }}
									// onPress={() => {
									// 	const newData = [...inspectionData];

									// 	const index = newData.findIndex((item) => item.id === el.id);

									// 	if (index !== -1) {
									// 		newData[index] = { ...newData[index], Checked: !el.Checked };
									// 		setInspectionData(newData);
									// 	}
									// }}
								/>
							</View>
						);
					})
				)}
			</ScrollView>
		</View>
	);
};

export default InspectionReportScreen;

const styles = StyleSheet.create({
	eachRowContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#ebebeb"
	}
});
