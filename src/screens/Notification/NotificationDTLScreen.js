import { ActivityIndicator, Alert, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Constants from "expo-constants";
import HeaderUser from "../../components/HeaderUser";
import { Button, Icon } from "@rneui/base";
import axios from "axios";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR, SERVER_URL } from "../../constant";
import MainContext from "../../contexts/MainContext";
import "dayjs/locale/es";
import dayjs from "dayjs";

const NotificationDTLScreen = (props) => {
	const state = useContext(MainContext);
	const [notifData, setNotifData] = useState(null);
	const [loadingData, setLoadingData] = useState(true);

	useEffect(() => {
		if (props.route.params && props.route.params?.data) {
			setNotifData(props.route.params?.data);
		}
	}, []);
	useEffect(() => {
		if (notifData) {
			setLoadingData(false);
			updateNotifications(notifData?.id);
		}
	}, [notifData]);

	const updateNotifications = async (notif_id) => {
		try {
			await axios
				.post(
					`${SERVER_URL}/mobile/notification/status`,
					{
						id: notif_id
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					// console.log("report update Notifications response", JSON.stringify(response.data));
					if (response.data?.Type == 0) {
					}
				})
				.catch(function (error) {
					console.log("error report update Notifications", error);
				});
		} catch (error) {
			console.log("CATCH update Notifications", error);
		}
	};

	const deleteNotifications = async (notif_id) => {
		try {
			await axios
				.post(
					`${SERVER_URL}/mobile/notification/delete`,
					{
						id: notif_id
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					// console.log("report delete Notifications response", JSON.stringify(response.data));
					if (response.data?.Type == 0) {
						Alert.alert(response.data?.Msg, "", [
							{
								text: "Хаах",
								onPress: () => props.navigation.goBack()
							}
						]);
					}
				})
				.catch(function (error) {
					console.log("error report delete Notifications", error);
				});
		} catch (error) {
			console.log("CATCH delete Notifications", error);
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
				style={styles.backContainer}
				activeOpacity={0.8}
			>
				<Icon name="chevron-left" type="feather" size={25} color="#fff" />
				<Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>Буцах</Text>
			</TouchableOpacity>
			{loadingData ? (
				<ActivityIndicator color={MAIN_COLOR} style={{ flex: 1 }} size={"large"} />
			) : (
				<View style={{ padding: 20 }}>
					<Text style={{ fontWeight: "600", marginBottom: 5 }}>{notifData?.notification?.Title}</Text>
					<View
						style={{
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "space-between",
							marginBottom: 10
						}}
					>
						<View style={{ flexDirection: "column" }}>
							<Text style={{ textTransform: "capitalize" }}>{notifData?.type?.Name}</Text>

							<Text>{dayjs(notifData.created_at).format("YYYY-MM-DD HH:mm:ss") ?? "-"}</Text>
						</View>
						<Button
							containerStyle={{
								alignSelf: "center"
							}}
							buttonStyle={styles.loginBtnStyle}
							title="Устгах"
							titleStyle={{
								fontSize: 16,
								fontWeight: "bold"
							}}
							onPress={() =>
								Alert.alert("Мэдэгдлийг устгах уу?", "Та мэдэгдлийг устгахдаа итгэлтэй байна уу?", [
									{
										text: "Үгүй",
										onPress: () => console.log("Cancel Pressed"),
										style: "cancel"
									},
									{
										text: "Тийм",
										onPress: () => deleteNotifications(notifData?.id)
									}
								])
							}
						/>
					</View>
					<Text>{notifData?.notification?.Message}</Text>
				</View>
			)}
		</View>
	);
};

export default NotificationDTLScreen;

const styles = StyleSheet.create({
	backContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#2C2E45",
		height: 50,
		paddingHorizontal: 10
	},
	loginBtnStyle: {
		backgroundColor: MAIN_COLOR,
		borderRadius: MAIN_BORDER_RADIUS,
		paddingVertical: 10,
		height: MAIN_BUTTON_HEIGHT
	}
});
