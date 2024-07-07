import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { Icon } from "@rneui/base";
import { MAIN_COLOR, MAIN_COLOR_BLUE, MAIN_COLOR_GRAY, MAIN_COLOR_GREEN, MAIN_COLOR_RED } from "../../constant";
import { useNavigation } from "@react-navigation/native";

const HomeScreenSideBarSUB = (props) => {
	const navigation = useNavigation();
	const MENU_LIST = [
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
	];
	console.log("2 => ", props);

	return (
		<View>
			<TouchableOpacity style={styles.eachMenuContainer} onPress={() => props.setSideBarStep(1)}>
				<Icon name="chevron-left" type="feather" size={25} color={MAIN_COLOR} />
				<Text style={{ flex: 1, marginHorizontal: 10, color: MAIN_COLOR, fontSize: 18, fontWeight: "500" }}>Буцах</Text>
			</TouchableOpacity>
			{MENU_LIST.map((el, index) => {
				return (
					<TouchableOpacity
						key={index}
						style={styles.eachMenuContainer}
						onPress={() => {
							props.setIsOpen(false);
							navigation.navigate("StatusListScreen");
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
