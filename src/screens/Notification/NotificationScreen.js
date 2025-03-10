import {
	ActivityIndicator,
	Alert,
	FlatList,
	Platform,
	RefreshControl,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Constants from "expo-constants";
import HeaderUser from "../../components/HeaderUser";
import { Icon } from "@rneui/base";
import axios from "axios";
import { MAIN_COLOR, MAIN_COLOR_BLUE, MAIN_COLOR_GREEN, SERVER_URL, TEXT_COLOR_GRAY } from "../../constant";
import MainContext from "../../contexts/MainContext";
import Empty from "../../components/Empty";
import "dayjs/locale/es";
import dayjs from "dayjs";
import CustomSnackbar from "../../components/CustomSnackbar";
import { useIsFocused } from "@react-navigation/native";

const NotificationScreen = (props) => {
	const state = useContext(MainContext);
	const isFocused = useIsFocused();

	const [notificationData, setNotificationData] = useState(null);
	const [loadingNotification, setLoadingNotification] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	const [visibleSnack, setVisibleSnack] = useState(false);
	const [snackBarMsg, setSnackBarMsg] = useState("");

	//Snacbkbar харуулах
	const onToggleSnackBar = (msg) => {
		setVisibleSnack(!visibleSnack);
		setSnackBarMsg(msg);
	};

	//Snacbkbar хаах
	const onDismissSnackBar = () => setVisibleSnack(false);

	const wait = (timeout) => {
		return new Promise((resolve) => setTimeout(resolve, timeout));
	};

	const onRefresh = () => {
		setRefreshing(true);
		getNotifications();
		wait(1000).then(() => setRefreshing(false));
	};

	const getNotifications = async () => {
		setNotificationData(null);
		setLoadingNotification(true);
		try {
			await axios
				.post(
					`${SERVER_URL}/mobile/notification/list`,
					{},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					// console.log("report get Notifications response", JSON.stringify(response.data));
					if (response.data?.Type == 0) {
						setNotificationData(response.data?.Extra);
					}
				})
				.catch(function (error) {
					console.log("error report get Notifications", error);
				})
				.finally(() => {
					setLoadingNotification(false);
				});
		} catch (error) {
			console.log("CATCH get Notifications", error);
		}
	};

	useEffect(() => {
		getNotifications();
	}, [isFocused]);

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
						getNotifications();
						onToggleSnackBar(response.data?.Msg);
					}
				})
				.catch(function (error) {
					console.log("error report delete Notifications", error);
				});
		} catch (error) {
			console.log("CATCH delete Notifications", error);
		}
	};

	const renderItem = ({ item }) => {
		return (
			<TouchableOpacity
				style={styles.itemContainer}
				onPress={() =>
					props.navigation.navigate("NotificationDTLScreen", {
						data: item
					})
				}
			>
				<View
					style={{
						flex: 1,
						flexDirection: "column",
						width: "60%"
					}}
				>
					<Text style={{ fontWeight: "600", marginBottom: 5 }}>{item?.notification?.Title}</Text>
					<Text numberOfLines={2}>{item?.notification?.Message}</Text>
					<View style={{ flexDirection: "row", alignItems: "center" }}>
						<Text style={{ textTransform: "capitalize" }}>{item?.type?.Name}</Text>
						<Icon name="dot-single" type="entypo" size={15} />
						<Text>{dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss") ?? "-"}</Text>
						<Icon name="dot-single" type="entypo" size={15} />
						<Text style={{ color: item.state?.Code == "unread" ? MAIN_COLOR_BLUE : MAIN_COLOR_GREEN }}>
							{item.state?.Name}
						</Text>
					</View>
				</View>
				<TouchableOpacity
					style={styles.deleteContainer}
					onPress={() =>
						Alert.alert("Мэдэгдлийг устгах уу?", "Та мэдэгдлийг устгахдаа итгэлтэй байна уу?", [
							{
								text: "Үгүй",
								onPress: () => console.log("Cancel Pressed"),
								style: "cancel"
							},
							{
								text: "Тийм",
								onPress: () => deleteNotifications(item.id)
							}
						])
					}
				>
					<Icon name="trash" type="octicon" size={25} color="red" />
				</TouchableOpacity>
			</TouchableOpacity>
		);
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
			<CustomSnackbar visible={visibleSnack} dismiss={onDismissSnackBar} text={snackBarMsg} topPos={50} />
			<TouchableOpacity
				onPress={() => {
					props.navigation.goBack();
				}}
				style={styles.backContainer}
				activeOpacity={0.8}
			>
				<Icon name="chevron-left" type="feather" size={25} color="#fff" />
				<Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>Мэдэгдэл</Text>
			</TouchableOpacity>
			{loadingNotification ? (
				<ActivityIndicator color={MAIN_COLOR} style={{ flex: 1 }} size={"large"} />
			) : (
				<FlatList
					contentContainerStyle={{
						flexGrow: 1
					}}
					showsVerticalScrollIndicator={false}
					data={notificationData}
					renderItem={renderItem}
					keyExtractor={(item, index) => index.toString()}
					ListEmptyComponent={<Empty text="Мэдэгдэл олдсонгүй." />}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={MAIN_COLOR} />}
				/>
			)}
		</View>
	);
};

export default NotificationScreen;

const styles = StyleSheet.create({
	backContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#2C2E45",
		height: 50,
		paddingHorizontal: 10
	},
	itemContainer: {
		borderBottomWidth: 1,
		borderBottomColor: TEXT_COLOR_GRAY,
		paddingLeft: 20,
		paddingVertical: 15,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		height: 80
	},
	deleteContainer: {
		alignSelf: "center",
		justifyContent: "center",
		height: 80,
		width: 80
	}
});
