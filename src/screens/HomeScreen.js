import {
	StyleSheet,
	Text,
	View,
	Platform,
	Image,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	StatusBar,
	Linking
} from "react-native";
import React, { useContext, useEffect, useState, useRef } from "react";
import { Icon, Button } from "@rneui/base";
import {
	MAIN_BORDER_RADIUS,
	MAIN_COLOR,
	MAIN_COLOR_GRAY,
	MAIN_COLOR_GREEN,
	MAIN_COLOR_RED,
	SERVER_URL
} from "../constant";
import HeaderUser from "../components/HeaderUser";
import axios from "axios";
import MainContext from "../contexts/MainContext";
import CustomDialog from "../components/CustomDialog";
import * as Location from "expo-location";
import { useIsFocused } from "@react-navigation/native";
import Constants from "expo-constants";
import RBSheet from "react-native-raw-bottom-sheet";

const HomeScreen = (props) => {
	const state = useContext(MainContext);
	const [loadingOut, setLoadingOut] = useState(false);
	const [loadingIn, setLoadingIn] = useState(false);

	//Screen LOAD хийхэд дахин RENDER хийх
	const isFocused = useIsFocused();

	const menu = [
		{ img: "", label: "Ирц", nav: "AttendanceScreen" },
		{ img: "", label: "Хүсэлт", nav: "RequestListScreen" },
		{ img: "", label: "Даалгавар", nav: "TaskCategoryScreen" },
		// { img: task, label: "Даалгавар", nav: "TaskScreen" },
		{ img: "", label: "Ажилтан", nav: "EmployeesScreen" },
		{ img: "", label: "Цалин", nav: "SalaryScreen" },
		{ img: "", label: "Санал хүсэлт", nav: "SurveyListScreenHome" },
		{ img: "", label: "Лавлагаа", nav: "ReferenceScreen" },
		{
			img: "",
			label: "Сургалт",
			nav: "TrainingScreen"
		},
		{
			img: "",
			label: "Тусламж",
			nav: "",
			action: () => {
				Linking.canOpenURL("https://talentmn.tawk.help").then((supported) => {
					if (supported) {
						Linking.openURL("https://talentmn.tawk.help");
					} else {
						console.log("Don't know how to open URI: " + "https://talentmn.tawk.help");
					}
				});
			}
		}
	];

	return (
		<View
			style={{
				flex: 1,
				paddingTop: Constants.statusBarHeight,
				backgroundColor: "#fff"
			}}
		>
			<StatusBar translucent barStyle={Platform.OS == "ios" ? "dark-content" : "default"} />
			<HeaderUser />

			<ScrollView
				contentContainerStyle={{
					flexGrow: 1
				}}
				bounces={false}
				showsVerticalScrollIndicator={false}
			>
				<Text>HOMESCREEEEEEEEEEEEEEEEEEN</Text>
			</ScrollView>
		</View>
	);
};

export default HomeScreen;

const edge = {
	borderColor: "white",
	borderLeftWidth: 3,
	borderTopWidth: 3,
	position: "absolute",
	height: 50,
	width: 44
};

const styles = StyleSheet.create({
	mainContainer: {},
	containerQR: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "space-around",
		borderColor: "#fff",
		alignItems: "center"
	},
	bottomRight: {
		transform: [{ rotate: "180deg" }],
		...edge,
		right: 0,
		bottom: 0
	},
	bottomLeft: {
		transform: [{ rotateX: "180deg" }],
		...edge,
		bottom: 0,
		left: 0
	},
	captureBox: {
		height: 240,
		width: 240,
		backgroundColor: "transparent",
		justifyContent: "center",
		alignItems: "center"
	},
	topLeft: {
		...edge,
		left: 0,
		top: 0
	},
	topRight: {
		transform: [{ rotateY: "180deg" }],
		...edge,
		top: 0,
		right: 0
	},
	cancelBtn: {
		width: "60%",
		marginTop: 20
	},
	attendanceContainer: {
		marginTop: 10,
		backgroundColor: "#fff",
		borderWidth: 0.5,
		alignItems: "center",
		borderColor: MAIN_COLOR_GRAY,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 1
		},
		shadowOpacity: 0.18,
		shadowRadius: 1.0,
		elevation: 1,
		marginHorizontal: 20,
		borderRadius: 20,
		paddingVertical: 20,
		paddingHorizontal: 10
	},
	menuContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginVertical: 20,
		marginHorizontal: 20,
		alignContent: "center",
		alignItems: "center",
		justifyContent: "space-evenly"
	},
	currentTime: {
		fontSize: 34,
		fontWeight: "bold"
	},
	timeContainer: {
		flexDirection: "column",
		alignItems: "center"
	},
	registerContainer: {
		marginTop: 10,
		width: "90%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-evenly"
	},
	inOutClockImg: {
		width: 40,
		height: 40,
		resizeMode: "contain"
	},
	eachMenuContiner: {
		backgroundColor: "#fff",
		width: "30%",
		borderWidth: 0.5,
		alignItems: "center",
		borderColor: MAIN_COLOR_GRAY,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 1
		},
		shadowOpacity: 0.18,
		shadowRadius: 1.0,
		elevation: 1,
		borderRadius: 20,
		flexDirection: "column",
		justifyContent: "center",
		margin: 5,
		minHeight: 100,
		maxHeight: 100
	},
	eachMenuImg: {
		width: 50,
		height: 50,
		resizeMode: "contain"
	},
	menuName: {
		fontSize: 14,
		marginTop: 5,
		lineHeight: Platform.OS == "ios" ? 20 : 16,
		textAlignVertical: "center",
		textAlign: "center"
	},
	Ccamera: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "space-around",
		alignItems: "center"
	}
});
