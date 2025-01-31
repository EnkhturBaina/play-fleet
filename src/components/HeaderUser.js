import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MAIN_COLOR } from "../constant";
import MainContext from "../contexts/MainContext";
import notif from "../../assets/notif.png";
import icon from "../../assets/icon.png";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Image } from "expo-image";

const HeaderUser = (props) => {
	const navigation = useNavigation();
	const state = useContext(MainContext);
	const route = useRoute();

	return (
		<View style={styles.headerContainer}>
			<TouchableOpacity
				activeOpacity={0.9}
				style={styles.headerFirstSection}
				onPress={() => navigation.navigate("ProfileTab")}
			>
				<Image
					source={state.userData?.Image ? { uri: state.userData?.Image } : icon}
					style={styles.userImg}
					contentFit="contain"
				/>
				<View style={styles.titleContainer}>
					<Text style={styles.topText}>Сайн байна уу?</Text>
					<Text style={styles.userName} numberOfLines={1}>
						{state.headerUserName ?? "User"}
					</Text>
				</View>
			</TouchableOpacity>
			{!props.isNotificationScreen ? (
				<TouchableOpacity
					onPress={() => {
						if (route.name == "HomeScreen") {
							navigation.navigate("NotificationScreenHome");
						} else if (route.name == "NewsScreen") {
							navigation.navigate("NotificationScreenNews");
						} else if (route.name == "ProfileScreen") {
							navigation.navigate("NotificationScreenProfile");
						}
					}}
				>
					<Image source={notif} style={{ width: 35, height: 35 }} contentFit="contain" />
				</TouchableOpacity>
			) : null}
		</View>
	);
};

export default React.memo(HeaderUser);

const styles = StyleSheet.create({
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		paddingVertical: 10,
		zIndex: 999,
		backgroundColor: "#fff"
	},
	headerFirstSection: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1
	},
	userImg: {
		width: 50,
		height: 50,
		borderRadius: 50,
		overflow: "hidden"
	},
	titleContainer: {
		flexDirection: "column",
		marginLeft: "5%",
		flex: 1
	},
	topText: {
		color: MAIN_COLOR,
		fontWeight: "bold",
		fontSize: 16
	},
	userName: {
		fontWeight: "bold",
		fontSize: 24
	}
});
