import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MAIN_COLOR } from "../constant";
import MainContext from "../contexts/MainContext";
import notif from "../../assets/notif.png";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";

const HeaderUser = (props) => {
	const state = useContext(MainContext);
	const navigation = useNavigation();

	return (
		<View style={styles.headerContainer}>
			<TouchableOpacity
				activeOpacity={0.9}
				style={styles.headerFirstSection}
				onPress={() => {
					if (props.isSideBar) {
						navigation.openDrawer();
					}
				}}
				onLongPress={() => {
					navigation.navigate("TempLocations");
				}}
				delayLongPress={1000}
				disabled={!props.isSideBar}
			>
				<Image
					source={
						state.employeeData?.Profile ? { uri: state.employeeData.Profile } : require("../../assets/avatar.png")
					}
					style={styles.userImg}
					contentFit="contain"
				/>

				<View style={styles.titleContainer}>
					<Text style={styles.topText}>Сайн байна уу?</Text>
					<Text style={styles.userName} numberOfLines={1}>
						{`${state.employeeData?.LastName ?? " "} ${state.employeeData?.FirstName ?? "User"}`}
					</Text>
					{/* {state.showLocationInfo && state.location && (
						<View>
							<Text style={styles.text}>shift: {state.shiftData?.Name}</Text>
							<Text>EventTime: </Text>
							<View style={{ flexDirection: "row", justifyContent: "flex-start" }}>
								{state.storedItems?.map((el, index) => {
									return (
										<Text key={index} style={{ fontSize: 12 }}>
											{el}
											{index !== state.storedItems.length - 1 ? "," : ""}
										</Text>
									);
								})}
							</View>
						</View>
					)} */}
				</View>
			</TouchableOpacity>
			{props.isShowNotif ? (
				<TouchableOpacity onPress={() => navigation.navigate("NotificationScreen")}>
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
		zIndex: 999,
		backgroundColor: "#fff",
		height: 60
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
		marginLeft: 20,
		flex: 1
	},
	topText: {
		color: MAIN_COLOR,
		fontWeight: "bold",
		fontSize: 16
	},
	userName: {
		fontWeight: "bold",
		fontSize: 22
	}
});
