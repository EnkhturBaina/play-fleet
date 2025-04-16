import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import HeaderUser from "../components/HeaderUser";
import Constants from "expo-constants";
import { Icon } from "@rneui/base";
import { MAIN_COLOR_BLUE, MAIN_COLOR_GRAY } from "../constant";
import CustomDialog from "../components/CustomDialog";
import MainContext from "../contexts/MainContext";
import { sendSelectedState } from "../helper/apiService";
import { useNetworkStatus } from "../contexts/NetworkContext";
import { OrientationContext } from "../helper/OrientationContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "dayjs/locale/es";
import dayjs from "dayjs";

const StatusListScreen = (props) => {
	const state = useContext(MainContext);
	const { isConnected } = useNetworkStatus();
	const orientation = useContext(OrientationContext);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogType, setDialogType] = useState("warning"); //Dialog харуулах төрөл
	const [dialogText, setDialogText] = useState(""); //Dialog харуулах text
	const [statusList, setStatusList] = useState(null);
	const [selectedState, setSelectedState] = useState(null);

	useEffect(() => {
		if (props.route?.params?.codeIds) {
			const filteredData = state.refStates?.filter((item) => props.route?.params?.codeIds.includes(item.PMSGroupId));
			// console.log("filteredData", filteredData);
			if (filteredData) {
				setStatusList(filteredData);
			}
		}
	}, []);

	const statusListScreenSendSelectedState = async () => {
		try {
			// console.log("now", now);
			// console.log("stateTime", stateTime);

			const response = await sendSelectedState(
				state.token,
				state.projectData,
				state.selectedEquipment,
				selectedState,
				state.employeeData,
				state.headerSelections,
				state.location,
				isConnected,
				dayjs().format("YYYY-MM-DD"),
				dayjs().format("YYYY-MM-DD HH:mm:ss"),
				null,
				state.shiftData
			);

			// console.log("statusListScreen Send Selected State response=>", response);
			if (response?.Type === 0) {
			} else {
				// setDialogText(response?.Msg);
			}
			state.handleReset();
			state.handleStart();
			state.setSelectedState(selectedState);
			setVisibleDialog(false);
			props.navigation.goBack();
		} catch (error) {
			console.log("Error in stopProgressHandler:", error);
		}
	};

	return (
		<View
			style={{
				flex: 1,
				paddingTop: orientation == "PORTRAIT" ? Constants.statusBarHeight : 20,
				backgroundColor: "#fff"
			}}
		>
			<HeaderUser isShowNotif={true} />
			<TouchableOpacity
				onPress={() => {
					props.navigation.goBack();
				}}
				style={styles.backContainer}
				activeOpacity={0.8}
			>
				<Icon name="chevron-left" type="feather" size={25} color="#fff" />
				<Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>{props.route?.params?.label ?? "Буцах"}</Text>
			</TouchableOpacity>
			<View style={{ flex: 1, backgroundColor: MAIN_COLOR_GRAY }}>
				<ScrollView
					contentContainerStyle={{
						flexGrow: 1,
						backgroundColor: "#fff"
					}}
					bounces={false}
					showsVerticalScrollIndicator={false}
				>
					{statusList?.map((el, index) => {
						return (
							<TouchableOpacity
								style={styles.eachStatus}
								key={index}
								onPress={() => {
									setDialogText("Та итгэлтэй байна уу?");
									setSelectedState(el);
									setVisibleDialog(true);
								}}
							>
								<Text style={{ width: "68%", color: MAIN_COLOR_BLUE }}>{el.Activity}</Text>
								<Icon name="chevron-right" type="feather" size={25} color={MAIN_COLOR_GRAY} />
							</TouchableOpacity>
						);
					})}
				</ScrollView>
			</View>
			<CustomDialog
				visible={visibleDialog}
				confirmFunction={() => {
					statusListScreenSendSelectedState();
				}}
				declineFunction={() => {
					setVisibleDialog(false);
				}}
				text={dialogText}
				confirmBtnText="Тийм"
				DeclineBtnText="Үгүй"
				type={dialogType}
				screenOrientation={orientation}
			/>
		</View>
	);
};

export default StatusListScreen;

const styles = StyleSheet.create({
	eachStatus: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 15,
		borderBottomWidth: 1,
		borderBottomColor: "#ebebeb",
		paddingHorizontal: 20
	},
	backContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#2C2E45",
		height: 50,
		paddingHorizontal: 10
	}
});
