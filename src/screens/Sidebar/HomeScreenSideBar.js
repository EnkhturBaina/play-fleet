import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Icon } from "@rneui/base";
import { MAIN_COLOR_GRAY } from "../../constant";
import { useNavigation } from "@react-navigation/native";

const HomeScreenSideBar = (props) => {
	const navigation = useNavigation();
	const MENU_LIST = [
		{
			img: require("../../../assets/images/Picture14.png"),
			label: "Ээлжийн өмнөх үзлэг",
			nav: "NAV_PATH",
			isMore: true
		},
		{
			img: require("../../../assets/images/Picture15.png"),
			label: "Мото цагийн болон түлшний бүртгэл",
			nav: "NAV_PATH",
			isMore: true,
			action: () => {
				props.setIsOpen(false);
				navigation.navigate("MotoHoursAndFuelScreen");
			}
		},
		{
			img: require("../../../assets/images/Picture16.png"),
			label: "Төлөв бүртгэл",
			nav: "NAV_PATH",
			isMore: true,
			action: () => {
				props.setSideBarStep(2);
			}
		},
		{
			img: require("../../../assets/images/Picture16.png"),
			label: "Бүтээлийн бүртгэл",
			nav: "NAV_PATH",
			isMore: true,
			action: () => {
				props.setIsOpen(false);
				navigation.navigate("WorkRegistrationScreen");
			}
		},
		{
			img: require("../../../assets/images/Picture17.png"),
			label: "Системийн тохиргоо",
			nav: "NAV_PATH",
			isMore: false
		},
		{
			img: require("../../../assets/images/Picture18.png"),
			label: "Хэл солих",
			nav: "NAV_PATH",
			isMore: false
		}
	];
	return (
		<View>
			{MENU_LIST.map((el, index) => {
				return (
					<TouchableOpacity key={index} style={styles.eachMenuContainer} onPress={el.action}>
						<Image source={el.img} style={{ width: 40, height: 40 }} />
						<Text style={{ flex: 1, marginHorizontal: 10 }}>{el.label}</Text>
						{el.isMore ? <Icon name="chevron-right" type="feather" size={25} color={MAIN_COLOR_GRAY} /> : null}
					</TouchableOpacity>
				);
			})}
		</View>
	);
};

export default HomeScreenSideBar;

const styles = StyleSheet.create({
	eachMenuContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomColor: MAIN_COLOR_GRAY,
		borderBottomWidth: 1,
		padding: 10
	}
});
