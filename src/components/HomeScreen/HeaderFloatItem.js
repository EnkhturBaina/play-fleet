import { Dimensions, StyleSheet, Text, TouchableOpacity, View, TextInput } from "react-native";
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
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useNetworkStatus } from "../../contexts/NetworkContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const width = Dimensions.get("screen").width;

const HeaderFloatItem = (props) => {
	const state = useContext(MainContext);
	const navigation = useNavigation();

	const { connectionQuality } = useNetworkStatus();
	const isFocused = useIsFocused();

	const [focusStates, setFocusStates] = useState({});
	const [visibleLines, setVisibleLines] = useState(null);
	const [assignedData, setAssignedData] = useState(null);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogText, setDialogText] = useState(null); //Dialog харуулах text

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
		// console.log("projectData", state.projectData);
		getDefaultAssignedTask();
		state.detectOrientation();

		if (state.projectData && state.projectData?.ShiftTime !== null) {
			// Эхлэх цаг
			const startTime = dayjs(state.projectData?.ShiftTime);
			// const startTime = dayjs("2025-02-02 01:29:00");
			// console.log("startTime", startTime);

			// Дуусах цагийг тооцоолох (12 цаг нэмэх, 20 мин хасах)
			const endTime = startTime?.add(12, "hour")?.subtract(20, "minute");
			// console.log("endTime", endTime);

			// Секунд тутамд цагийг шалгах
			const interval = setInterval(() => {
				const now = dayjs(); // Одоогийн цагийг авах
				// console.log("now", now.format("HH:mm:ss"));
				// console.log("endTime", endTime.format("HH:mm:ss"));

				if (now?.format("HH:mm:ss") === endTime?.format("HH:mm:ss")) {
					setDialogText("Та ээлжээ дуусгах уу.?");
					setVisibleDialog(true);
					clearInterval(interval); // Давхардахгүй байх үүднээс interval-ийг цэвэрлэх
				}
			}, 1000); // 1 секунд тутамд шалгана

			return () => clearInterval(interval); // Компонент унтрах үед interval-ийг цэвэрлэнэ
		}
	}, [isFocused]);

	useEffect(() => {
		if (state.orientation == "PORTRAIT") {
			setVisibleLines(startLines);
		} else {
			setVisibleLines(totalLines);
		}
	}, [state.orientation]);

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
						state.setHeaderSelections((prev) => ({
							...prev,
							PMSSrcId: response.data?.Extra?.PMSSrcId,
							PMSBlastShotId: response.data?.Extra?.PMSBlastShotId,
							PMSDstId: response.data?.Extra?.PMSDstId,
							PMSLoaderId: response.data?.Extra?.PMSLoaderId,
							PMSMaterialId: response.data?.Extra?.PMSMaterialId
						}));

						if (response.data?.Extra?.PMSSubProgressStateId != null) {
							const filteredDefaultState = state.refStates?.filter(
								(item) => item.id === response.data?.Extra?.PMSSubProgressStateId
							);
							// console.log("default assign from header", filteredDefaultState);

							// Default assign -с тухайн төхөөрөмжиййн төлөв авах
							state.setSelectedState(filteredDefaultState[0]);
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

		const jsonValue = await AsyncStorage.getItem("lastState");
		// console.log("jsonValue", JSON.parse(jsonValue));
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
						PMSEmployeeId: state.employeeData?.id,
						IsTest: 1
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					// console.log("stop progress response", JSON.stringify(response.data));
					setDialogText(response.data?.Msg);

					if (response.data?.Type == 0) {
						navigation.navigate("CreateMotoHourAndFuelScreenHOME");
						setVisibleDialog(false);
					} else {
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
		<View style={styles.floatButtons}>
			<View style={styles.mainContainer}>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
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
						/>
						<Text style={{ color: MAIN_COLOR, fontSize: 18, marginLeft: 5 }}>
							{VEHICLE_TYPE[state.vehicleType]?.title}
						</Text>
					</View>
					{state.orientation == "PORTRAIT" ? (
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
							<View style={[styles.stack1, { width: state.orientation == "PORTRAIT" ? "100%" : "48%" }]} key={index}>
								<Text
									style={{
										color: MAIN_COLOR_BLUE,
										fontSize: 18
									}}
								>
									{el.name}
								</Text>
								{el.path == "reis" ? <TextInput style={styles.inputStyle} value={"0"} editable={false} /> : null}
								{el.path != "reis" ? (
									<Dropdown
										key={index}
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
			<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 10 }}>
				<TouchableOpacity
					onPress={() => {
						props.mapRef();
					}}
					style={styles.eachFloatButton}
					activeOpacity={0.8}
				>
					<Icon name="location-sharp" type="ionicon" size={35} color={MAIN_COLOR} />
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => props.setIsOpen(!props.isOpen)}
					style={styles.eachFloatButton}
					activeOpacity={0.8}
				>
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
					stopProgress();
				}}
				declineFunction={() => {
					setVisibleDialog(false);
				}}
				text={dialogText}
				confirmBtnText="Дуусгах"
				DeclineBtnText="Үгүй"
				type={"warning"}
				screenOrientation={state.orientation}
			/>
		</View>
	);
};

export default HeaderFloatItem;

const styles = StyleSheet.create({
	floatButtons: {
		position: "absolute", //use absolute position to show button on top of the map
		left: 0,
		top: 5,
		alignSelf: "flex-end" //for align to right
	},
	dropdown: {
		borderColor: "#aeaeae",
		borderWidth: 0.5,
		paddingHorizontal: 8,
		width: 150,
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
		width: width - 10,
		marginHorizontal: 5,
		borderRadius: MAIN_BORDER_RADIUS
	},
	inputStyle: {
		borderColor: "#aeaeae",
		borderWidth: 0.5,
		paddingHorizontal: 8,
		width: 150,
		height: 35,
		borderRadius: MAIN_BORDER_RADIUS,
		fontWeight: "600"
	}
});
