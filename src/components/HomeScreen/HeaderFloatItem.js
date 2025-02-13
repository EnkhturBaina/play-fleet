import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { MAIN_BORDER_RADIUS, MAIN_COLOR, MAIN_COLOR_BLUE, WEEKDAYS } from "../../constant";
import { Dropdown } from "react-native-element-dropdown";
import MainContext from "../../contexts/MainContext";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "@rneui/base";
import { Image } from "expo-image";

const width = Dimensions.get("screen").width;

const HeaderFloatItem = (props) => {
	const state = useContext(MainContext);
	const navigation = useNavigation();
	const [isFocus, setIsFocus] = useState(false);

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
					path: "blockNo"
				},
				{
					id: 2,
					name: "Материал",
					path: "material"
				},
				{
					id: 3,
					name: "Ачилтын тоо",
					path: "totalLoads"
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
					path: "startPosition"
				},
				{
					id: 2,
					name: "Блокын дугаар",
					path: "blockNo"
				},
				{
					id: 3,
					name: "Хүргэх байршил",
					path: "endLocation"
				},
				{
					id: 4,
					name: "Экскаватор",
					path: "exca"
				},
				{
					id: 5,
					name: "Материал",
					path: "material"
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

	useEffect(() => {
		state.detectOrientation();
	}, []);

	return (
		<View style={styles.floatButtons}>
			<View style={styles.mainContainer}>
				<Text style={{ color: MAIN_COLOR, fontSize: 18 }}>{VEHICLE_TYPE[state.vehicleType]?.title}</Text>
				<View style={styles.itemsContainer}>
					{VEHICLE_TYPE[state.vehicleType]?.fields.map((el, index) => {
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
									style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
									placeholderStyle={styles.placeholderStyle}
									selectedTextStyle={styles.selectedTextStyle}
									inputSearchStyle={styles.inputSearchStyle}
									data={WEEKDAYS}
									maxHeight={300}
									labelField="label"
									valueField="value"
									placeholder={!isFocus ? "Сонгох" : "..."}
									value={state.headerSelections?.[el.path]}
									onFocus={() => setIsFocus(true)}
									onBlur={() => setIsFocus(false)}
									onChange={(item) => {
										setIsFocus(false);
										state.setHeaderSelections((prevState) => ({
											...prevState,
											[el.path]: item.value
										}));
									}}
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
				<TouchableOpacity onPress={() => props.setIsOpen(!props.isOpen)} style={styles.eachFloatButton}>
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
		height: 30,
		borderRadius: MAIN_BORDER_RADIUS
	},
	placeholderStyle: {
		fontSize: 16,
		fontWeight: "bold"
	},
	selectedTextStyle: {
		fontSize: 16,
		fontWeight: "bold"
	},
	inputSearchStyle: {
		height: 40,
		fontSize: 16
	},
	stack1: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 5,
		alignSelf: "flex-start"
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
		padding: 10,
		width: width - 10,
		marginHorizontal: 5,
		borderRadius: MAIN_BORDER_RADIUS
	}
});
