import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { MAIN_BORDER_RADIUS, MAIN_COLOR, MAIN_COLOR_BLUE, SERVER_URL, TEXT_COLOR_GRAY } from "../../constant";
import { Dropdown } from "react-native-element-dropdown";
import MainContext from "../../contexts/MainContext";
import { Icon } from "@rneui/base";
import { Image } from "expo-image";
import axios from "axios";

const width = Dimensions.get("screen").width;

const HeaderFloatItem = (props) => {
	const state = useContext(MainContext);
	const [focusStates, setFocusStates] = useState({});
	const [visibleLines, setVisibleLines] = useState(null);
	const [assignedData, setAssignedData] = useState(null);

	const startLines = 3;
	const totalLines = 5;

	const VEHICLE_TYPE = {
		Loader: {
			value: 1,
			code: "Loader",
			name: "Экскаватор",
			title: "АЧИЛТЫН БЛОК",
			fields: [
				{
					id: 1,
					name: "Блокын дугаар",
					path: "blockNo",
					dataPath: "refShots",
					valuePath: "ShotName"
				},
				{
					id: 2,
					name: "Материал",
					path: "material",
					dataPath: "refMaterials",
					valuePath: "Name"
				},
				{
					id: 3,
					name: "Ачилтын тоо",
					path: "totalLoads",
					dataPath: "shot",
					valuePath: "Name"
				}
			]
		},
		Truck: {
			name: 2,
			code: "Truck",
			label: "Автосамосвал",
			title: "МАТЕРИАЛЫН УРСГАЛ",
			fields: [
				{
					id: 1,
					name: "Эхлэх байршил",
					path: "startPosition",
					dataPath: "refLocations",
					valuePath: "Name"
				},
				{
					id: 2,
					name: "Блокын дугаар",
					path: "blockNo",
					dataPath: "refShots",
					valuePath: "ShotName"
				},
				{
					id: 3,
					name: "Хүргэх байршил",
					path: "endLocation",
					dataPath: "refLocations",
					valuePath: "Name"
				},
				{
					id: 4,
					name: "Экскаватор",
					path: "exca",
					dataPath: "refLoaders",
					valuePath: "Name"
				},
				{
					id: 5,
					name: "Материал",
					path: "material",
					dataPath: "refMaterials",
					valuePath: "Name"
				}
			]
		},
		Other: {
			name: 3,
			code: "Other",
			label: "Туслах тоног төхөөрөмж",
			title: "ДААЛГАВАР",
			fields: [
				{
					id: 1,
					name: "Ногдуулсан даалгавар",
					path: "assignedTask",
					valuePath: "Name"
				}
			]
		}
	};
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
		getDefaultAssignedTask();
		state.detectOrientation();
	}, []);
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
						PMSEquipmentId: state.selectedEquipment?.id
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					console.log("get DefaultAssignedTask response", JSON.stringify(response.data));
					if (response.data?.Type == 0) {
						setAssignedData(response.data?.Extra);
						state.setHeaderSelections((prev) => ({
							...prev,
							startPosition: response.data?.Extra?.PMSSrcId,
							blockNo: response.data?.Extra?.PMSBlastShotId,
							endLocation: response.data?.Extra?.PMSDstId,
							exca: response.data?.Extra?.PMSLoaderId,
							material: response.data?.Extra?.PMSMaterialId
						}));
					}
				})
				.catch(function (error) {
					console.log("error get DefaultAssignedTask", error.response.data);
				});
		} catch (error) {
			console.log("CATCH get DefaultAssignedTask", error);
		}
	};

	return (
		<View style={styles.floatButtons}>
			<View style={styles.mainContainer}>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ color: MAIN_COLOR, fontSize: 18, height: 15 }}>{VEHICLE_TYPE[state.vehicleType]?.title}</Text>
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
					{VEHICLE_TYPE[state.vehicleType]?.fields.slice(0, visibleLines).map((el, index) => {
						const fieldData = refData[el.dataPath] || [];

						// Хэрэв fieldData хоосон бол "Сонголт байхгүй" гэж харуулах
						const isEmpty = fieldData.length === 0;

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
				{/* <TouchableOpacity
					onPress={() => {
						navigation.navigate("TestTilesScreen");
					}}
					style={styles.eachFloatButton}
				>
					<Image
						source={require("../../../assets/images/route.png")}
						style={{
							height: 35,
							width: 35
						}}
						contentFit="contain"
					/>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => {
						// props.navigation.navigate("TestSQL");
						navigation.navigate("TestRenderUurhai");
						// navigation.navigate("TestTilesScreen");
					}}
					style={styles.eachFloatButton}
				>
					<Image
						source={require("../../../assets/images/Picture2.png")}
						style={{
							height: 35,
							width: 35
						}}
						contentFit="contain"
					/>
				</TouchableOpacity> */}
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
		width: width - 10,
		marginHorizontal: 5,
		borderRadius: MAIN_BORDER_RADIUS
	}
});
