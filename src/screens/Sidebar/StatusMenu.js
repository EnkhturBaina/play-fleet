import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext } from "react";
import { Icon } from "@rneui/base";
import { MAIN_COLOR, MAIN_COLOR_BLUE, MAIN_COLOR_GRAY, MAIN_COLOR_GREEN, MAIN_COLOR_RED } from "../../constant";
import { useNavigation } from "@react-navigation/native";
import MainContext from "../../contexts/MainContext";

const StatusMenu = (props) => {
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
				codeList: ["Performance Loss"],
				codeIds: [2]
			},
			{
				img: require("../../../assets/images/Picture12.png"),
				label: "Саатал",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR,
				codeList: ["Delay"],
				codeIds: [3]
			},
			{
				img: require("../../../assets/images/Picture11.png"),
				label: "Сул зогсолт",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_BLUE,
				codeList: ["Standby"],
				codeIds: [4]
			},
			{
				img: require("../../../assets/images/Picture13.png"),
				label: "Эвдрэл",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_RED,
				codeList: ["Planned Maintenance", "Unplanned Maintenance"],
				codeIds: [5, 6]
			}
		],
		Truck: [
			{
				img: require("../../../assets/images/Picture10.png"),
				label: "Бүтээлийн бус ажиллах",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_GREEN,
				codeList: ["Performance Loss"],
				codeIds: [2]
			},
			{
				img: require("../../../assets/images/Picture12.png"),
				label: "Саатал",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR,
				codeList: ["Delay"],
				codeIds: [3]
			},
			{
				img: require("../../../assets/images/Picture11.png"),
				label: "Сул зогсолт",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_BLUE,
				codeList: ["Standby"],
				codeIds: [4]
			},
			{
				img: require("../../../assets/images/Picture13.png"),
				label: "Эвдрэл",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_RED,
				codeList: ["Planned Maintenance", "Unplanned Maintenance"],
				codeIds: [5, 6]
			}
		],
		Other: [
			{
				img: require("../../../assets/images/Picture10.png"),
				label: "Бүтээлийн бус ажиллах",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_GREEN,
				codeList: ["Performance Loss"],
				codeIds: [2]
			},
			{
				img: require("../../../assets/images/Picture11.png"),
				label: "Саатал",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_BLUE,
				codeList: ["Delay"],
				codeIds: [3]
			},
			{
				img: require("../../../assets/images/Picture12.png"),
				label: "Сул зогсолт",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR,
				codeList: ["Standby"],
				codeIds: [4]
			},
			{
				img: require("../../../assets/images/Picture13.png"),
				label: "Эвдрэл",
				nav: "NAV_PATH",
				isMore: true,
				borderColor: MAIN_COLOR_RED,
				codeList: ["Planned Maintenance", "Unplanned Maintenance"],
				codeIds: [5, 6]
			}
		]
	};

	return (
		<View>
			{MENU_LIST[state.vehicleType].map((el, index) => {
				return (
					<TouchableOpacity
						key={index}
						style={styles.eachMenuContainer}
						onPress={() => {
							props.setIsOpen(false);
							navigation.navigate("StatusListScreen", {
								codeIds: el.codeIds
							});
							props.setSideBarStep(1);
						}}
					>
						<View
							style={{
								justifyContent: "center",
								alignItems: "center",
								borderRightWidth: 5,
								borderColor: el.borderColor,
								paddingRight: 10,
								height: "100%"
							}}
						>
							<Image source={el.img} style={{ width: 40, height: 40 }} />
						</View>
						<Text style={{ flex: 1, marginHorizontal: 10 }}>{el.label}</Text>
						{el.isMore ? <Icon name="chevron-right" type="feather" size={25} color={MAIN_COLOR_GRAY} /> : null}
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

export default StatusMenu;

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
