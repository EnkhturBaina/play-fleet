import {
	ActivityIndicator,
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
import { MAIN_COLOR, MAIN_COLOR_GRAY, SERVER_URL } from "../../constant";
import MainContext from "../../contexts/MainContext";
import Empty from "../../components/Empty";
import "dayjs/locale/es";
import dayjs from "dayjs";
import { useIsFocused } from "@react-navigation/native";

const NotificationScreen = (props) => {
	const state = useContext(MainContext);
	const isFocused = useIsFocused();

	const [notificationData, setNotificationData] = useState(null);
	const [loadingNotification, setLoadingNotification] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

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
						width: "100%"
					}}
				>
					<View style={{ flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between" }}>
						<View style={{ flexDirection: "row", alignItems: "center", marginBottom: 7 }}>
							{item.state?.Code == "unread" ? (
								<Icon name="circle" type="font-awesome" size={10} color={MAIN_COLOR} />
							) : null}
							<Text
								style={{
									flex: 1,
									textTransform: "uppercase",
									marginLeft: item.state?.Code == "unread" ? 5 : 0,
									color: "#6b6d75"
								}}
							>
								{item?.type?.Name}
							</Text>
						</View>
						<Text style={{ fontWeight: "600", color: "#191a2b", marginBottom: 4 }} numberOfLines={1}>
							{item?.notification?.Title}
						</Text>
						<Text style={{ fontWeight: "600", marginBottom: 5 }} numberOfLines={1}>
							<Text style={{ textTransform: "capitalize", color: "#575b62" }}>{item?.notification?.Message}</Text>
						</Text>
						<Text style={{ color: "#b7b8be" }}>{dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss") ?? "-"}</Text>
					</View>
				</View>
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
			<HeaderUser isShowNotif={true} />
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
		borderBottomColor: MAIN_COLOR_GRAY,
		marginHorizontal: 20,
		paddingVertical: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	}
});
