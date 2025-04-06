import { StyleSheet, Text, View, StatusBar, Platform, ScrollView, ActivityIndicator } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import HeaderUser from "../components/HeaderUser";
import Constants from "expo-constants";
import { Button } from "@rneui/base";
import {
	MAIN_BORDER_RADIUS,
	MAIN_BUTTON_HEIGHT,
	MAIN_COLOR,
	MAIN_COLOR_GREEN,
	MAIN_COLOR_RED,
	SERVER_URL
} from "../constant";
import MainContext from "../contexts/MainContext";
import axios from "axios";
import "dayjs/locale/es";
import dayjs from "dayjs";
import CustomDialog from "../components/CustomDialog";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OrientationContext } from "../helper/OrientationContext";

const InspectionScreen = () => {
	const state = useContext(MainContext);
	const orientation = useContext(OrientationContext);

	const [mainData, setMainData] = useState(null);
	const [inspectionData, setInspectionData] = useState(null);
	const [loadingInspections, setLoadingInspections] = useState(false);
	const [savingInspections, setSavingInspections] = useState(false);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogType, setDialogType] = useState(null); //Dialog харуулах төрөл
	const [dialogText, setDialogText] = useState("Та итгэлтэй байна уу?"); //Dialog харуулах text

	const getLocalInspectionId = async () => {
		console.log("RUN get Local InspectionId");

		//Өмнө хадгалсан InspectionId LOCAL -с авах
		try {
			setSavingInspections(true);
			const jsonValue = await AsyncStorage.getItem("L_inspection_id");
			// console.log("LOCAL inspectionId", jsonValue);

			if (jsonValue != null) {
				const savedLocalInspectionId = JSON.parse(jsonValue);
				state.setSavedInspectionId(savedLocalInspectionId);
				state.setInspectionDone(true);
				setSavingInspections(false);
			} else {
				getInspections();
				setSavingInspections(false);
			}
		} catch (error) {
			console.error("Error getting object", error);
		}
	};

	const getInspections = async () => {
		setInspectionData(null);
		setLoadingInspections(true);
		try {
			await axios
				.post(
					`${SERVER_URL}/mobile/inspection/save`,
					{
						PMSEquipmentId: state.selectedEquipment?.id,
						PMSShiftId: state.shiftData?.id,
						PMSRosterId: state.rosterData?.id,
						PMSEmployeeId: state.employeeData?.id,
						CurrentDate: dayjs().format("YYYY-MM-DD")
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					// console.log("get Inspections response", JSON.stringify(response.data));
					if (response.data?.Type == 0) {
						setMainData(response.data?.Extra);
						setInspectionData(response.data?.Extra?.inspections);
					}
				})
				.catch(function (error) {
					console.log("error get Inspections", error.response.data);
				})
				.finally(() => {
					setLoadingInspections(false);
				});
		} catch (error) {
			console.log("CATCH get Inspections", error);
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			const accessToken = await AsyncStorage.getItem("L_access_token");

			if (accessToken) {
				getLocalInspectionId(accessToken);
			}
		};

		fetchData();
	}, []);

	const saveInspections = async () => {
		const checkedList = [];
		const uncheckedList = [];

		inspectionData.forEach((item) => {
			if (item.Checked === true || item.Checked === 1) {
				checkedList.push(item.id);
			} else {
				uncheckedList.push(item.id);
			}
		});

		setSavingInspections(true);
		try {
			await axios
				.post(
					`${SERVER_URL}/mobile/inspection/save`,
					{
						PMSEquipmentId: state.selectedEquipment?.id,
						PMSShiftId: state.shiftData?.id,
						PMSRosterId: state.rosterData?.id,
						PMSEmployeeId: state.employeeData?.id,
						CurrentDate: dayjs().format("YYYY-MM-DD"),
						Checked: checkedList?.join(","),
						UnChecked: uncheckedList?.join(","),
						id: mainData?.id
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					// console.log("save Inspections response", JSON.stringify(response.data));
					if (response.data?.Type == 0) {
						setDialogType("success");
					} else {
						setDialogType("warning");
					}
					setDialogText(response.data?.Msg);
				})
				.catch(function (error) {
					console.log("error save Inspections", error.response.data);
				})
				.finally(async () => {
					await AsyncStorage.setItem("L_inspection_id", JSON.stringify(mainData?.id)).then(() => {
						setSavingInspections(false);
						setVisibleDialog(true);
					});
				});
		} catch (error) {
			console.log("CATCH save Inspections", error);
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
			<HeaderUser isShowNotif={false} />
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
								<Text style={{ flex: 1, marginRight: 5 }}>{el.code?.Name}</Text>
								<Button
									containerStyle={{
										width: "ТЭНЦЭЭГҮЙ"?.length * 16
									}}
									buttonStyle={{
										backgroundColor: el.Checked ? MAIN_COLOR_GREEN : MAIN_COLOR_RED,
										paddingVertical: 10,
										height: MAIN_BUTTON_HEIGHT
									}}
									title={el.Checked ? "ТЭНЦСЭН" : "ТЭНЦЭЭГҮЙ"}
									titleStyle={{
										fontSize: 14
									}}
									onPress={() => {
										const newData = [...inspectionData];

										const index = newData.findIndex((item) => item.id === el.id);

										if (index !== -1) {
											newData[index] = { ...newData[index], Checked: !el.Checked };
											setInspectionData(newData);
										}
									}}
								/>
							</View>
						);
					})
				)}
			</ScrollView>
			<Button
				disabled={savingInspections}
				containerStyle={{
					width: "100%",
					paddingHorizontal: 20,
					paddingTop: 10
				}}
				buttonStyle={{
					backgroundColor: MAIN_COLOR,
					paddingVertical: 10,
					borderRadius: MAIN_BORDER_RADIUS,
					height: MAIN_BUTTON_HEIGHT
				}}
				title={
					<>
						<Text
							style={{
								fontSize: 16,
								color: "#fff",
								fontWeight: "bold"
							}}
						>
							Болсон
						</Text>
						{savingInspections ? <ActivityIndicator style={{ marginLeft: 10 }} color="#fff" /> : null}
					</>
				}
				titleStyle={{
					fontSize: 14
				}}
				onPress={() => {
					saveInspections();
				}}
			/>

			<CustomDialog
				visible={visibleDialog}
				confirmFunction={() => {
					dialogType == "success" && state.setInspectionDone(true);
					setVisibleDialog(false);
				}}
				declineFunction={() => {
					setVisibleDialog(false);
				}}
				text={dialogText}
				confirmBtnText="Үргэлжлүүлэх"
				DeclineBtnText=""
				type={dialogType}
				screenOrientation={orientation}
			/>
		</View>
	);
};

export default InspectionScreen;

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
