import { StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import {
	MAIN_BORDER_RADIUS,
	MAIN_COLOR,
	MAIN_COLOR_BLUE,
	MAIN_COLOR_GREEN,
	MAIN_COLOR_RED,
	SERVER_URL,
	TEXT_COLOR_GRAY
} from "../../constant";
import { Dropdown } from "react-native-element-dropdown";
import MainContext from "../../contexts/MainContext";
import { Icon } from "@rneui/base";
import { Image } from "expo-image";
import axios from "axios";
import VEHICLE_TYPE from "../../helper/vehicleType.json";
import CustomDialog from "../CustomDialog";
import "dayjs/locale/es";
import dayjs from "dayjs";
import { useNavigation } from "@react-navigation/native";
import { useNetworkStatus } from "../../contexts/NetworkContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { OrientationContext } from "../../helper/OrientationContext";

const HeaderFloatItem = (props) => {
	const state = useContext(MainContext);
	const orientation = useContext(OrientationContext);

	const navigation = useNavigation();

	const { connectionQuality } = useNetworkStatus();

	const [focusStates, setFocusStates] = useState({});
	const [visibleLines, setVisibleLines] = useState(null);
	const [assignedData, setAssignedData] = useState(null);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogText, setDialogText] = useState(null); //Dialog харуулах text
	const [showDialogDecline, setShowDialogDecline] = useState(true);
	const [confirmText, setConfirmText] = useState("Дуусгах");
	const [declineText, setDeclineText] = useState("Үгүй");

	// Зөвхөн ээлж дуусахаас 20 мин өмнө сануулж байгаа үед ээлж дуусгах process ажлуулах
	const [isEndShift, setIsEndShift] = useState(false);

	const startLines = 3;
	const totalLines = 6;

	const refData = {
		refStates: state.refStates,
		refLocations: state.refLocations,
		refMovements: state.refMovements,
		refOperators: state.refOperators,
		refMaterials: state.refMaterials,
		refStateGroups: state.refStateGroups,
		refLocationTypes: state.refLocationTypes,
		refLoaders: state.refLoaders,
		refShots: state.refShots
	};

	useEffect(() => {
		// var tempShift = "DS";
		setLines();
		getDefaultAssignedTask();

		if (state.projectData?.ShiftTime && state.shiftData?.Name) {
			const shiftDateTime = dayjs(state.projectData?.ShiftTime);
			// const shiftDateTime = dayjs("2025-02-02 22:38:00");

			// Эхлэх цагийг зөвхөн цаг, минут, секундын утгаар авах
			const startTime = dayjs()
				.startOf("day")
				.add(shiftDateTime.hour(), "hour")
				.add(shiftDateTime.minute(), "minute")
				.add(shiftDateTime.second(), "second");
			// Эхлэх цагаас 12 цаг нэмээд дуусах цагийг тооцоолох
			const endTime = startTime.add(12, "hour");

			// Дуусах цагаас дараагийн ээлжийн эхлэх цагийг тооцоолох (12 цаг нэмэх)
			const nextShiftStart = endTime;
			const nextShiftEnd = endTime.add(12, "hour");

			// 12 цаг нэмээд дуусах цагийг анхааруулах цагийг тооцоолох (20 минут хасах)
			const endTimeAlert = startTime.add(12, "hour").subtract(10, "minute");
			// console.log("endTimeAlert", endTimeAlert.format("HH:mm:ss"));

			// Секунд тутамд цагийг шалгах
			const interval = setInterval(() => {
				const now = dayjs()
					.startOf("day")
					.add(dayjs().hour(), "hour")
					.add(dayjs().minute(), "minute")
					.add(dayjs().second(), "second");
				// console.log("now", now.format("HH:mm:ss"));

				// Ээлж дуусах цаг анхааруулах
				if (now.isSame(endTimeAlert, "second")) {
					setIsEndShift(true);
					setDialogText("Та ээлжээ дуусгах уу?");
					setConfirmText("Дуусгах");
					setDeclineText("Үгүй");
					setVisibleDialog(true);
					clearInterval(interval);
				}

				// console.log("now", now.format("YYYY-MM-DD HH:mm:ss"));
				// console.log("startTime", startTime.format("YYYY-MM-DD HH:mm:ss"));
				// console.log("endTime", endTime.format("YYYY-MM-DD HH:mm:ss"));

				let newShift = "OFF";

				// Өгөгдсөн ээлжийн цаг(Нэвтэрсэн)
				if (now.isAfter(startTime) && now.isBefore(endTime)) {
					newShift = "DS";
				} else {
					newShift = "NS";
				}
				// If the input time is exactly at 19:00 or later, consider it as Night Shift (NS)
				if (now.isAfter(endTime)) {
					newShift = "NS";
				}

				// console.log("newShift", newShift);

				// Ээлж солигдсон үед
				if (state.shiftData?.Name != newShift) {
					setIsEndShift(false);
					setShowDialogDecline(false);
					setDialogText("Ээлж дууссан байна. Та дахин нэвтэрнэ үү");
					setConfirmText("ОК");
					setDeclineText("");
					setVisibleDialog(true);
					clearInterval(interval);
				}
			}, 1000); // 1 секунд тутамд шалгана

			// Компонент унтрах үед interval-ийг цэвэрлэнэ
			return () => clearInterval(interval);
		}
	}, []); // Зөвхөн эхний удаа ажиллана

	useEffect(() => {
		// setLines();
	}, [orientation]);

	const setLines = () => {
		if (orientation == "PORTRAIT") {
			setVisibleLines(startLines);
		} else {
			setVisibleLines(totalLines);
		}
	};
	// Хэрэглэгч focus хийсэн үед isFocus-г зөвшөөрөх, эсвэл түдгэлзүүлэх
	const handleFocus = (path) => {
		setFocusStates((prevState) => ({
			...prevState,
			[path]: true // focus-ийг идэвхжүүлнэ
		}));
	};

	const handleBlur = (path) => {
		setFocusStates((prevState) => ({
			...prevState,
			[path]: false // focus-ийг салгана
		}));
	};

	const getDefaultAssignedTask = async () => {
		setAssignedData(null);
		try {
			await axios
				.post(
					`${SERVER_URL}/mobile/task/assigned`,
					{
						cid: state.companyData?.id,
						PMSEquipmentId: state.selectedEquipment?.id,
						PMSShiftId: state.shiftData?.id
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					// console.log("get DefaultAssignedTask response ", JSON.stringify(response.data));
					if (response.data?.Type == 0) {
						setAssignedData(response.data?.Extra);
						if (response.data?.Extra?.ShiftChanged) {
							setIsEndShift(false);
							setDialogText("Ээлж дууссан байна. Та дахин нэвтэрнэ үү.");
							setConfirmText("ОК");
							setDeclineText("");
							setVisibleDialog(true);
						} else {
							state.setHeaderSelections((prev) => ({
								...prev,
								PMSSrcId: response.data?.Extra?.PMSSrcId,
								PMSBlastShotId: response.data?.Extra?.PMSBlastShotId,
								PMSDstId: response.data?.Extra?.PMSDstId,
								PMSLoaderId: response.data?.Extra?.PMSLoaderId,
								PMSMaterialId: response.data?.Extra?.PMSMaterialId
							}));

							const mainState = state.refStates?.filter((item) => item.id === response.data?.Extra?.PMSProgressStateId);

							// console.log("mainState", mainState);
							if (mainState && mainState?.length > 0) {
								if (mainState[0].ActivityShort == "W1") {
									const filteredDefaultState = state.refStates?.filter(
										(item) => item.id === response.data?.Extra?.PMSSubProgressStateId
									);
									// console.log("default assign from header PMSSubProgressStateId != null", filteredDefaultState);

									// Default assign -с тухайн төхөөрөмжиййн төлөв авах
									state.setSelectedState(filteredDefaultState[0]);
								} else {
									const filteredDefaultState = state.refStates?.filter(
										(item) => item.id === response.data?.Extra?.PMSProgressStateId
									);
									// console.log("default assign from header PMSSubProgressStateId == null", filteredDefaultState);

									// Default assign -с тухайн төхөөрөмжиййн төлөв авах
									state.setSelectedState(filteredDefaultState[0]);
								}
							} else {
								getLocalLastState();
							}
						}
					}
				})
				.catch(function (error) {
					console.log("error get DefaultAssignedTask", error);

					getLocalLastState();
				});
		} catch (error) {
			console.log("CATCH get DefaultAssignedTask", error);
		}
	};

	const getLocalLastState = async () => {
		// Assign service -д ямар 1 асуудал гарвал local -д хадгалсан хамгийн сүүлд сонгогдсон төлөв харуулах

		const jsonValue = await AsyncStorage.getItem("L_last_state");
		console.log("jsonValue", JSON.parse(jsonValue));
		if (jsonValue && JSON.parse(jsonValue)?.id) {
			const filteredDefaultState = state.refStates?.filter((item) => item.id === JSON.parse(jsonValue)?.id);
			state.setSelectedState(filteredDefaultState[0]);
		}
	};

	const stopProgress = async () => {
		try {
			await axios
				.post(
					`${SERVER_URL}/mobile/progress/stop`,
					{
						PMSProjectId: state.projectData?.id,
						PMSEquipmentId: state.selectedEquipment?.id,
						PMSProgressStateId: state.selectedState?.id,
						CurrentDate: dayjs().format("YYYY-MM-DD"),
						PMSEmployeeId: state.employeeData?.id
						// IsTest: 1
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					console.log("stop progress response", JSON.stringify(response.data));

					if (response.data?.Type == 0) {
						navigation.navigate("CreateMotoHourAndFuelScreenHOME");
						setVisibleDialog(false);
					} else {
						setDialogText(response.data?.Msg);
						setVisibleDialog(true);
					}
				})
				.catch(function (error) {
					console.log("error stop progress", error);
				});
		} catch (error) {
			console.log("CATCH stop progress", error);
		}
	};

	return (
		<View style={[styles.floatButtons, { width: orientation == "PORTRAIT" ? "100%" : "50%" }]}>
			<View style={styles.mainContainer}>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						{connectionQuality !== "good" && (
							<Icon
								name="wifi"
								type="feather"
								size={20}
								color={
									connectionQuality === "good"
										? MAIN_COLOR_GREEN
										: connectionQuality === "medium"
										? MAIN_COLOR
										: MAIN_COLOR_RED
								}
								style={{ marginRight: 5 }}
							/>
						)}
						<Text style={{ color: MAIN_COLOR, fontSize: 16 }}>{VEHICLE_TYPE[state.vehicleType]?.title}</Text>
					</View>
					{orientation == orientation ? (
						<TouchableOpacity
							onPress={() => {
								if (visibleLines == totalLines) {
									setVisibleLines(startLines);
								} else {
									setVisibleLines(totalLines);
								}
							}}
						>
							<Icon
								name={`${totalLines == visibleLines ? "chevron-up" : "chevron-down"}`}
								type="ionicon"
								size={30}
								color={MAIN_COLOR}
							/>
						</TouchableOpacity>
					) : null}
				</View>
				<View style={styles.itemsContainer}>
					{VEHICLE_TYPE[state.vehicleType]?.fields?.slice(0, visibleLines).map((el, index) => {
						const fieldData = refData[el.dataPath] || [];

						// Хэрэв fieldData хоосон бол "Сонголт байхгүй" гэж харуулах
						const isEmpty = fieldData?.length === 0;

						return (
							<View style={[styles.stack1, { width: orientation == orientation ? "100%" : "48%" }]} key={el.path}>
								<Text
									style={{
										color: MAIN_COLOR_BLUE,
										fontSize: 16
									}}
								>
									{el.name}
								</Text>
								{el.path == "reis" ? (
									<TextInput style={styles.inputStyle} value={String(state.trackCount)} editable={false} />
								) : null}
								{el.path != "reis" ? (
									<Dropdown
										style={[styles.dropdown, focusStates[el.path] && { borderColor: "blue" }]}
										placeholderStyle={[styles.placeholderStyle, { color: isEmpty ? TEXT_COLOR_GRAY : "#000" }]}
										selectedTextStyle={styles.selectedTextStyle}
										data={fieldData}
										maxHeight={300}
										labelField={el.valuePath}
										valueField="id"
										placeholder={isEmpty ? "Сонголт байхгүй" : !focusStates[el.path] ? "Сонгох" : "..."}
										value={state.headerSelections?.[el.path]}
										onFocus={() => handleFocus(el.path)} // focus болох үед handleFocus
										onBlur={() => handleBlur(el.path)} // blur болох үед handleBlur
										onChange={(item) => {
											setFocusStates((prevState) => ({
												...prevState,
												[el.path]: false // select хийснээр focus-ийг салгана
											}));
											state.setHeaderSelections((prevState) => ({
												...prevState,
												[el.path]: item.id
											}));
										}}
										disable={isEmpty}
									/>
								) : null}
							</View>
						);
					})}
				</View>
			</View>
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: orientation == "PORTRAIT" ? "flex-end" : "flex-start",
					marginTop: 10,
					marginLeft: 10
				}}
			>
				<TouchableOpacity
					onPress={() => {
						props.mapRef();
					}}
					style={styles.eachFloatButton}
					activeOpacity={0.8}
				>
					<Icon name="location-sharp" type="ionicon" size={35} color={MAIN_COLOR} />
				</TouchableOpacity>
				<TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.eachFloatButton} activeOpacity={0.8}>
					<Image
						source={require("../../../assets/images/Picture3.png")}
						style={{
							height: 35,
							width: 35
						}}
						contentFit="contain"
					/>
				</TouchableOpacity>
			</View>
			<CustomDialog
				visible={visibleDialog}
				confirmFunction={() => {
					if (isEndShift) {
						stopProgress();
					} else {
						state.logout();
					}
				}}
				declineFunction={() => {
					showDialogDecline && setVisibleDialog(false);
				}}
				text={dialogText}
				confirmBtnText={confirmText}
				DeclineBtnText={declineText}
				type={"warning"}
				screenOrientation={orientation}
			/>
		</View>
	);
};

export default HeaderFloatItem;

const styles = StyleSheet.create({
	floatButtons: {
		// backgroundColor: "red",
		position: "absolute",
		left: 0,
		top: 65, // HeaderUser -н өндөр
		alignSelf: "flex-end",
		zIndex: 10
	},
	dropdown: {
		borderColor: "#aeaeae",
		borderWidth: 0.5,
		paddingHorizontal: 8,
		width: 200,
		height: 35,
		borderRadius: MAIN_BORDER_RADIUS
	},
	placeholderStyle: {
		fontSize: 16,
		fontWeight: "bold"
	},
	selectedTextStyle: {
		fontSize: 16,
		fontWeight: "bold",
		lineHeight: 16
	},
	stack1: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 5,
		alignSelf: "flex-start",
		alignItems: "center",
		height: 35
	},
	eachFloatButton: {
		height: 50,
		width: 50,
		padding: 5,
		backgroundColor: "#fff",
		borderRadius: 50,
		marginRight: 8,
		alignItems: "center",
		justifyContent: "center"
	},
	itemsContainer: {
		flex: 1,
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginTop: 10
	},
	mainContainer: {
		flex: 1,
		flexDirection: "column",
		backgroundColor: "#fff",
		paddingHorizontal: 10,
		paddingVertical: 5,
		marginHorizontal: 5,
		borderRadius: MAIN_BORDER_RADIUS
	},
	inputStyle: {
		borderColor: "#aeaeae",
		borderWidth: 0.5,
		paddingHorizontal: 8,
		width: 200,
		height: 35,
		borderRadius: MAIN_BORDER_RADIUS,
		fontWeight: "600"
	}
});
