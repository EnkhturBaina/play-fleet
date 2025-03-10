import { Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext } from "react";
import Constants from "expo-constants";
import HeaderUser from "../../components/HeaderUser";
import { Icon } from "@rneui/base";
import axios from "axios";
import { SERVER_URL } from "../../constant";
import MainContext from "../../contexts/MainContext";

const NotificationScreen = (props) => {
	const state = useContext(MainContext);

	const [notificationData, setNotificationData] = useState(null);
	const [loadingNotification, setLoadingNotification] = useState(false);
	const getNotifications = async (inspectionId) => {
		setNotificationData(null);
		setLoadingNotification(true);
		try {
			await axios
				.post(
					`${SERVER_URL}/mobile/notification/list`,
					{
						id: inspectionId
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					// console.log("report get Inspections response", JSON.stringify(response.data));
					if (response.data?.Type == 0) {
						notificationData(response.data?.Extra);
					}
				})
				.catch(function (error) {
					console.log("error report get Inspections", error.response.data);
				})
				.finally(() => {
					setLoadingNotification(false);
				});
		} catch (error) {
			console.log("CATCH get Inspections", error);
		}
	};

	return (
		<View
			style={{
				flex: 1,
				paddingTop: Constants.statusBarHeight,
				backgroundColor: "#fff",
				paddingBottom: 20
			}}
		>
			<StatusBar translucent barStyle={Platform.OS == "ios" ? "dark-content" : "default"} />
			<HeaderUser isShowNotif={true} isBack={false} />
			<TouchableOpacity
				onPress={() => {
					props.navigation.goBack();
				}}
				style={{
					flexDirection: "row",
					alignItems: "center",
					backgroundColor: "#2C2E45",
					height: 50,
					paddingHorizontal: 10
				}}
				activeOpacity={0.8}
			>
				<Icon name="chevron-left" type="feather" size={25} color="#fff" />
				<Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>Буцах</Text>
			</TouchableOpacity>
			<Text>NotificationScreen</Text>
		</View>
	);
};

export default NotificationScreen;

const styles = StyleSheet.create({});
