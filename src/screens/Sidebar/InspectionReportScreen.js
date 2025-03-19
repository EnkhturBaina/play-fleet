import {
	StyleSheet,
	Text,
	View,
	StatusBar,
	Platform,
	ActivityIndicator,
	TouchableOpacity,
	FlatList,
	RefreshControl
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Constants from "expo-constants";
import { Button, Icon } from "@rneui/base";
import {
	MAIN_BORDER_RADIUS,
	MAIN_BUTTON_HEIGHT,
	MAIN_COLOR,
	MAIN_COLOR_GREEN,
	MAIN_COLOR_RED,
	SERVER_URL
} from "../../constant";
import axios from "axios";
import MainContext from "../../contexts/MainContext";
import HeaderUser from "../../components/HeaderUser";
import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import "dayjs/locale/es";
import dayjs from "dayjs";
import Empty from "../../components/Empty";

const InspectionReportScreen = (props) => {
	const state = useContext(MainContext);

	const [mainData, setMainData] = useState(null);
	const [inspectionData, setInspectionData] = useState(null);
	const [loadingInspections, setLoadingInspections] = useState(false);
	const [showFromDatePicker, setShowFromDatePicker] = useState(false);
	const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
	const [selectedShift, setSelectedShift] = useState(state.shiftData.Name);

	const [refreshing, setRefreshing] = useState(false);

	const wait = (timeout) => {
		return new Promise((resolve) => setTimeout(resolve, timeout));
	};

	const onRefresh = () => {
		setRefreshing(true);
		getInspections();
		wait(1000).then(() => setRefreshing(false));
	};

	const getInspections = async () => {
		setInspectionData(null);
		setLoadingInspections(true);
		try {
			const inspectionId = await AsyncStorage.getItem("L_inspection_id");
			if (inspectionId) {
				try {
					await axios
						.post(
							`${SERVER_URL}/mobile/inspection/item`,
							{
								id: inspectionId,
								PMSEquipmentId: state.selectedEquipment?.id,
								PMSShiftId: state.shiftData?.id,
								CurrentDate: selectedDate
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
								setInspectionData(response.data?.Extra);
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
			}
		} catch (e) {
			console.error("Failed to fetch inspectionId:", e);
		}
	};

	useEffect(() => {
		getInspections(); // async функцыг дуудаж байна
	}, []);

	useEffect(() => {
		getInspections();
	}, [selectedDate]);

	const handleConfirm = (data) => {
		var month = data.getMonth() + 1;
		var day = data.getDate();

		//Тухайн сар 1 оронтой бол урд нь 0 залгах
		if (month.toString()?.length === 1) {
			month = `0${month}`;
		} else {
			month = month;
		}
		//Тухайн өдөр 1 оронтой бол урд нь 0 залгах
		if (day.toString()?.length === 1) {
			day = `0${day}`;
		} else {
			day = day;
		}
		setSelectedDate(data.getFullYear() + "-" + month + "-" + day);
		setShowFromDatePicker(false);
	};

	const renderItem = ({ item }) => {
		return (
			<View style={styles.eachRowContainer}>
				<Text style={{ flex: 1, marginRight: 5 }}>{item.code?.Name}</Text>
				<Button
					containerStyle={{
						width: "ТЭНЦЭЭГҮЙ"?.length * 16
					}}
					buttonStyle={{
						backgroundColor: item.Checked ? MAIN_COLOR_GREEN : MAIN_COLOR_RED,
						paddingVertical: 10,
						height: MAIN_BUTTON_HEIGHT
					}}
					disabledStyle={{
						backgroundColor: item.Checked ? MAIN_COLOR_GREEN : MAIN_COLOR_RED,
						paddingVertical: 10,
						height: MAIN_BUTTON_HEIGHT
					}}
					title={item.Checked ? "ТЭНЦСЭН" : "ТЭНЦЭЭГҮЙ"}
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
			<View style={styles.headerActions}>
				<View>
					<TouchableOpacity style={styles.yearMonthPicker} onPress={() => setShowFromDatePicker(true)}>
						<Text style={{ fontWeight: "600", fontSize: 16 }}>{selectedDate}</Text>
						<Icon name="keyboard-arrow-down" type="material-icons" size={30} />
					</TouchableOpacity>
					<DateTimePickerModal
						isVisible={showFromDatePicker}
						mode="date"
						onConfirm={(date) => handleConfirm(date)}
						onCancel={() => setShowFromDatePicker(false)}
						confirmTextIOS="Сонгох"
						cancelTextIOS="Хаах"
						is24Hour
						locale="en_GB"
						display="spinner"
					/>
				</View>
				<TouchableOpacity
					style={styles.shiftPicker}
					onPress={() => {
						if (selectedShift == "DS") {
							setSelectedShift("NS");
						} else {
							setSelectedShift("DS");
						}
					}}
				>
					<Text style={{ fontSize: 16, fontWeight: "600" }}>{selectedShift}:</Text>
					<Icon name={selectedShift == "DS" ? "sun" : "moon"} type="feather" size={25} />
				</TouchableOpacity>
			</View>
			<View
				style={{
					flex: 1,
					backgroundColor: "#fff"
					// backgroundColor: "red"
				}}
			>
				{loadingInspections ? (
					<ActivityIndicator color={MAIN_COLOR} style={{ flex: 1 }} size={"large"} />
				) : (
					<FlatList
						contentContainerStyle={{
							paddingHorizontal: 5,
							flexGrow: 1
						}}
						showsVerticalScrollIndicator={false}
						data={inspectionData
							?.filter((item) => item.shift?.Name === selectedShift)
							?.flatMap((item) => item.inspections)}
						renderItem={renderItem}
						keyExtractor={(item, index) => index.toString()}
						ListEmptyComponent={<Empty text="Мэдээлэл олдсонгүй." />}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={MAIN_COLOR} />}
					/>
				)}
			</View>
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
	},
	headerActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginHorizontal: 15,
		alignItems: "center",
		paddingBottom: 5,
		marginTop: 10
	},
	yearMonthPicker: {
		flexDirection: "row",
		justifyContent: "space-between",
		borderColor: MAIN_COLOR,
		borderWidth: 1,
		borderRadius: MAIN_BORDER_RADIUS,
		alignItems: "center",
		paddingVertical: 5,
		paddingLeft: 10,
		paddingRight: 5,
		alignSelf: "flex-start",
		height: MAIN_BUTTON_HEIGHT
	},
	shiftPicker: {
		flexDirection: "row",
		justifyContent: "space-between",
		borderColor: MAIN_COLOR,
		borderWidth: 1,
		borderRadius: MAIN_BORDER_RADIUS,
		alignItems: "center",
		padding: 10,
		alignSelf: "flex-start",
		height: MAIN_BUTTON_HEIGHT
	}
});
