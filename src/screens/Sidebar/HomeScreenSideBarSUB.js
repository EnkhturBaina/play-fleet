import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext } from "react";
import { Icon } from "@rneui/base";
import { MAIN_COLOR, MAIN_COLOR_BLUE, MAIN_COLOR_GRAY, MAIN_COLOR_GREEN, MAIN_COLOR_RED } from "../../constant";
import { useNavigation } from "@react-navigation/native";
import MainContext from "../../contexts/MainContext";
import StatusMenu from "./StatusMenu";
import ConfigMenu from "./ConfigMenu";

const HomeScreenSideBarSUB = (props) => {
	const state = useContext(MainContext);
	const navigation = useNavigation();
	const MENU_LIST = {
		Loader: [
			{
				img: require("../../../assets/images/Picture10.png"),
				label: "Бүтээлийн бус ажиллах",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_GREEN,
				code: "Delay"
			},
			{
				img: require("../../../assets/images/Picture11.png"),
				label: "Саатал",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_BLUE,
				code: "Delay"
			},
			{
				img: require("../../../assets/images/Picture12.png"),
				label: "Сул зогсолт",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR,
				code: "Standby"
			},
			{
				img: require("../../../assets/images/Picture13.png"),
				label: "Эвдрэл",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_RED,
				code: "Delay"
			}
		],
		Truck: [
			{
				img: require("../../../assets/images/Picture10.png"),
				label: "Бүтээлийн бус ажиллах",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_GREEN,
				code: "Delay"
			},
			{
				img: require("../../../assets/images/Picture11.png"),
				label: "Саатал",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_BLUE,
				code: "Delay"
			},
			{
				img: require("../../../assets/images/Picture12.png"),
				label: "Сул зогсолт",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR,
				code: "Standby"
			},
			{
				img: require("../../../assets/images/Picture13.png"),
				label: "Эвдрэл",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_RED,
				code: "Delay"
			}
		],
		Other: [
			{
				img: require("../../../assets/images/Picture10.png"),
				label: "Бүтээлийн бус ажиллах",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_GREEN,
				code: "Delay"
			},
			{
				img: require("../../../assets/images/Picture11.png"),
				label: "Саатал",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_BLUE,
				code: "Delay"
			},
			{
				img: require("../../../assets/images/Picture12.png"),
				label: "Сул зогсолт",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR,
				code: "Standby"
			},
			{
				img: require("../../../assets/images/Picture13.png"),
				label: "Эвдрэл",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_RED,
				code: "Delay"
			}
		]
	};

	return (
		<View>
			<TouchableOpacity style={styles.eachMenuContainer} onPress={() => props.setSideBarStep(1)}>
				<Icon name="chevron-left" type="feather" size={25} color={MAIN_COLOR} />
				<Text style={{ flex: 1, marginHorizontal: 10, color: MAIN_COLOR, fontSize: 18, fontWeight: "500" }}>Буцах</Text>
			</TouchableOpacity>
			{props.menuType === "STATUS" && <StatusMenu {...props} />}
			{props.menuType === "CONFIG" && <ConfigMenu {...props} />}
		</View>
	);
};

export default HomeScreenSideBarSUB;

const styles = StyleSheet.create({
	eachMenuContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomColor: MAIN_COLOR_GRAY,
		borderBottomWidth: 1,
		paddingHorizontal: 10,
		height: 60
	}
});
