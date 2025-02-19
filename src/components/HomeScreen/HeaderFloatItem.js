import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { MAIN_BORDER_RADIUS, MAIN_COLOR, MAIN_COLOR_BLUE, TEXT_COLOR_GRAY } from "../../constant";
import { Dropdown } from "react-native-element-dropdown";
import MainContext from "../../contexts/MainContext";
import { Icon } from "@rneui/base";
import { Image } from "expo-image";

const width = Dimensions.get("screen").width;

const HeaderFloatItem = (props) => {
	const state = useContext(MainContext);
	const [focusStates, setFocusStates] = useState({});
	const [visibleLines, setVisibleLines] = useState(null);
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
					dataPath: "refShots"
				},
				{
					id: 2,
					name: "Материал",
					path: "material",
					dataPath: "refMaterials"
				},
				{
					id: 3,
					name: "Ачилтын тоо",
					path: "totalLoads",
					dataPath: "shot"
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
					dataPath: "refLocations"
				},
				{
					id: 2,
					name: "Блокын дугаар",
					path: "blockNo",
					dataPath: "refShots"
				},
				{
					id: 3,
					name: "Хүргэх байршил",
					path: "endLocation",
					dataPath: "refLocations"
				},
				{
					id: 4,
					name: "Экскаватор",
					path: "exca",
					dataPath: "refShots"
				},
				{
					id: 5,
					name: "Материал",
					path: "material",
					dataPath: "refMaterials"
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
					path: "assignedTask"
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
		refLocationTypes: state.refLocationTypes
	};

	useEffect(() => {
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
									labelField="Name"
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
