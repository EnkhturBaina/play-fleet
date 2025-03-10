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
import { MAIN_BORDER_RADIUS, MAIN_COLOR, SERVER_URL, TEXT_COLOR_GRAY } from "../../constant";
import MainContext from "../../contexts/MainContext";
import Empty from "../../components/Empty";

const NotificationScreen = (props) => {
	const state = useContext(MainContext);

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

	const getNotifications = async (inspectionId) => {
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
	}, []);

	const renderItem = ({ item }) => {
		return (
			<View
				style={{
					borderBottomWidth: 1,
					borderBottomColor: TEXT_COLOR_GRAY,
					padding: 10,
					flexDirection: "column"
				}}
			>
				<Text style={{ fontWeight: "600" }}>{item?.notification?.Title}</Text>
				<Text>{item?.notification?.Message}</Text>
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					<Text>{item?.type?.Name}</Text>
					<Text>{item.created_at}</Text>
					<Text>{item.state?.Name}</Text>
				</View>
			</View>
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
					ListEmptyComponent={<Empty text="Мэдээлэл олдсонгүй." />}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={MAIN_COLOR} />}
				/>
			)}
		</View>
	);
};

export default NotificationScreen;

const styles = StyleSheet.create({});
