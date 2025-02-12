import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	StatusBar,
	Platform,
	TouchableOpacity,
	FlatList,
	RefreshControl
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import HeaderUser from "../../components/HeaderUser";
import Constants from "expo-constants";
import { useNavigation } from "@react-navigation/native";
import { Button, Icon } from "@rneui/base";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR, SERVER_URL } from "../../constant";
import Empty from "../../components/Empty";
import axios from "axios";
import MainContext from "../../contexts/MainContext";
import "dayjs/locale/es";
import dayjs from "dayjs";

const MotoHoursAndFuelScreen = (props) => {
	const state = useContext(MainContext);
	const navigation = useNavigation();

	const [refreshing, setRefreshing] = useState(false);

	const [smuData, setSmuData] = useState(null);
	const [loadingSmuData, setLoadingSmuData] = useState(false);

	const wait = (timeout) => {
		return new Promise((resolve) => setTimeout(resolve, timeout));
	};

	const onRefresh = () => {
		setRefreshing(true);
		getSmuData();
		wait(1000).then(() => setRefreshing(false));
	};

	const getSmuData = async () => {
		// console.log("projectData", state.projectData?.id);
		// console.log("selectedEquipment", state.selectedEquipment?.id);
		// console.log("employeeData", state.employeeData?.id);

		setSmuData(null);
		setLoadingSmuData(true);
		try {
			await axios
				.post(
					`${SERVER_URL}/mobile/progress/stop`,
					{
						PMSProjectId: state.projectData?.id,
						PMSEquipmentId: state.selectedEquipment?.id,
						// PMSProgressStateId: state.shiftData?.id,
						CurrentDate: dayjs().format("YYYY-MM-DD"),
						PMSEmployeeId: state.employeeData?.id
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					console.log("get SmuData response", JSON.stringify(response.data));
					if (response.data?.Type == 0) {
						setSmuData(response.data?.Extra);
					}
				})
				.catch(function (error) {
					console.log("error get SmuData", error.response.data);
				})
				.finally(() => {
					setLoadingSmuData(false);
				});
		} catch (error) {
			console.log("CATCH get SmuData", error);
		}
	};

	useEffect(() => {
		getSmuData();
	}, []);

	const renderItem = ({ item }) => {
		return <Text>{item.id}</Text>;
	};
	return (
		<SafeAreaView
			style={{
				...StyleSheet.absoluteFillObject,
				flex: 1,
				paddingTop: Constants.statusBarHeight,
				backgroundColor: "#fff",
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0
			}}
		>
			<StatusBar translucent barStyle={Platform.OS == "ios" ? "dark-content" : "default"} />
			<HeaderUser />
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
				<Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>Мото цагийн болон түлшний бүртгэл</Text>
			</TouchableOpacity>
			<View style={{ paddingHorizontal: 20, marginTop: 10 }}>
				<Button
					buttonStyle={{
						backgroundColor: MAIN_COLOR,
						borderRadius: MAIN_BORDER_RADIUS,
						height: MAIN_BUTTON_HEIGHT
					}}
					title="Бүртгэл нэмэх"
					titleStyle={{
						fontSize: 16,
						fontWeight: "bold"
					}}
					onPress={() => navigation.navigate("CreateMotoHourAndFuelScreen")}
					style={{ alignSelf: "flex-end" }}
				/>
			</View>
			<View style={{ flex: 1, backgroundColor: "#fff" }}>
				<FlatList
					contentContainerStyle={{
						flexGrow: 1,
						paddingHorizontal: 10
					}}
					showsVerticalScrollIndicator={false}
					data={smuData}
					renderItem={renderItem}
					keyExtractor={(item, index) => index.toString()}
					ListEmptyComponent={<Empty text="Мэдээлэл олдсонгүй." />}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={MAIN_COLOR} />}
				></FlatList>
			</View>
		</SafeAreaView>
	);
};

export default MotoHoursAndFuelScreen;

const styles = StyleSheet.create({});
