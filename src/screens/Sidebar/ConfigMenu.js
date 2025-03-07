import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext } from "react";
import { fonts, Icon } from "@rneui/base";
import { MAIN_COLOR, MAIN_COLOR_BLUE, MAIN_COLOR_GRAY, MAIN_COLOR_GREEN, MAIN_COLOR_RED } from "../../constant";
import { useNavigation } from "@react-navigation/native";
import MainContext from "../../contexts/MainContext";
import useTileLoader from "../../helper/useTileLoader";

const ConfigMenu = (props) => {
	const { callFnc, progress } = useTileLoader(false);
	const state = useContext(MainContext);
	const navigation = useNavigation();
	const MENU_LIST = {
		Loader: [
			{
				img: require("../../../assets/images/Picture10.png"),
				label: "Бүтээлийн бус ажиллах",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_GREEN
			},
			{
				img: require("../../../assets/images/Picture11.png"),
				label: "Саатал",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_BLUE
			},
			{
				img: require("../../../assets/images/Picture12.png"),
				label: "Сул зогсолт",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR
			},
			{
				img: require("../../../assets/images/Picture13.png"),
				label: "Эвдрэл",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_RED
			}
		],
		Truck: [
			{
				img: require("../../../assets/images/Picture10.png"),
				label: "Бүтээлийн бус ажиллах",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_GREEN
			},
			{
				img: require("../../../assets/images/Picture11.png"),
				label: "Саатал",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_BLUE
			},
			{
				img: require("../../../assets/images/Picture12.png"),
				label: "Сул зогсолт",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR
			},
			{
				img: require("../../../assets/images/Picture13.png"),
				label: "Эвдрэл",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_RED
			}
		],
		Other: [
			{
				img: require("../../../assets/images/Picture10.png"),
				label: "Бүтээлийн бус ажиллах",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_GREEN
			},
			{
				img: require("../../../assets/images/Picture11.png"),
				label: "Саатал",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_BLUE
			},
			{
				img: require("../../../assets/images/Picture12.png"),
				label: "Сул зогсолт",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR
			},
			{
				img: require("../../../assets/images/Picture13.png"),
				label: "Эвдрэл",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_RED
			}
		]
	};

	return (
		<View>
			{/* https://chatgpt.com/share/67a5cf70-7c60-8013-af37-7e2d50f59fc7 */}
			<TouchableOpacity
				style={styles.eachItemContainer}
				onPress={() => {
					Alert.alert("Амжилттай", "KML амжилттай шинэчлэгдлээ", [
						{ text: "Хаах", onPress: () => console.log("OK Pressed") }
					]);
				}}
			>
				<Text style={{ fontSize: 16, fontWeight: "600" }}>KML шинэчлэх</Text>
				<Icon name="chevron-right" type="feather" size={25} color={MAIN_COLOR_GRAY} />
			</TouchableOpacity>
			<TouchableOpacity
				style={styles.eachItemContainer}
				onPress={() => {
					Alert.alert("Оффлайн мэп татах уу?", "", [
						{
							text: "Үгүй",
							onPress: () => console.log("Cancel Pressed"),
							style: "cancel"
						},
						,
						{
							text: "Тийм",
							onPress: () => callFnc()
						}
					]);
				}}
			>
				<View>
					<Text style={{ fontSize: 16, fontWeight: "600" }}>Газрын зураг татах</Text>
					<Text style={{ fontSize: 12 }}>{progress}</Text>
				</View>
				<Icon name="chevron-right" type="feather" size={25} color={MAIN_COLOR_GRAY} />
			</TouchableOpacity>
		</View>
	);
};

export default ConfigMenu;

const styles = StyleSheet.create({
	eachItemContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		height: 60,
		paddingHorizontal: 10,
		borderBottomColor: MAIN_COLOR_GRAY,
		borderBottomWidth: 1,
		paddingHorizontal: 10
	}
});
