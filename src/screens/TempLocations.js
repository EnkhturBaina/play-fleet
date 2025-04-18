import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import MainContext from "../contexts/MainContext";
import Constants from "expo-constants";
import { Icon } from "@rneui/base";
import { MAIN_BORDER_RADIUS, MAIN_COLOR } from "../constant";
import Empty from "../components/Empty";
import { useNetworkStatus } from "../contexts/NetworkContext";
import TempSendState from "./TempSendState";

const TempLocations = () => {
	const state = useContext(MainContext);
	const navigation = useNavigation();
	const { isConnected } = useNetworkStatus();
	const [selectedMenu, setSelectedMenu] = useState("send_state"); //send_state, send_location

	useEffect(() => {}, []);

	const renderItem = ({ item }) => {
		return (
			<View
				style={{
					borderWidth: 0.5,
					borderRadius: MAIN_BORDER_RADIUS,
					borderColor: "#ebebeb",
					padding: 10,
					marginBottom: 10
				}}
			>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>CurrentDate</Text>
					<Text>{item.CurrentDate}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>EventTime</Text>
					<Text>{item.EventTime}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>Latitude</Text>
					<Text>{item.Latitude}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>Longitude</Text>
					<Text>{item.Longitude}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>PMSEquipmentId</Text>
					<Text>{item.PMSEquipmentId}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>Speed</Text>
					<Text>{item.Speed}</Text>
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
			{/* <HeaderUser isShowNotif={true} /> */}
			<TouchableOpacity
				onPress={() => {
					navigation.goBack();
				}}
				style={styles.backBtnContainer}
				activeOpacity={0.8}
			>
				<Icon name="chevron-left" type="feather" size={25} color="#fff" />
				<Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>Offline locations</Text>
			</TouchableOpacity>
			<View style={{ flexDirection: "row", justifyContent: "space-around", alignItems: "center", marginVertical: 10 }}>
				<TouchableOpacity
					style={{ padding: 5, borderWidth: 1, backgroundColor: selectedMenu == "send_state" ? MAIN_COLOR : "#fff" }}
					onPress={() => setSelectedMenu("send_state")}
				>
					<Text style={{ fontSize: 18 }}>SEND_STATE</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={{ padding: 5, borderWidth: 1, backgroundColor: selectedMenu == "send_location" ? MAIN_COLOR : "#fff" }}
					onPress={() => setSelectedMenu("send_location")}
				>
					<Text style={{ fontSize: 18 }}>SEND_LOCATION</Text>
				</TouchableOpacity>
			</View>
			<View style={{ padding: 20 }}>
				<Text>Platform: {state.monitorData.Platform}</Text>
				<Text>ModelName: {state.monitorData.ModelName}</Text>
				<Text>RunLocationFunctionName: {state.monitorData.RunLocationFunctionName}</Text>
				<Text>Shift: {state.monitorData.Shift}</Text>
			</View>
			{selectedMenu == "send_location" ? (
				<>
					<ScrollView style={{ flex: 1, height: 200 }}>
						<Text>isConnected: {isConnected ? "true" : "false"}</Text>
						{state.sendLocationStatus && (
							<View style={{ flex: 1 }}>
								<Text style={styles.text}>Location Status:</Text>
								<View style={{ flexDirection: "column", justifyContent: "flex-start" }}>
									{state.sendLocationStatus?.map((el, index) => {
										return (
											<Text key={index} style={{ fontSize: 12 }}>
												{el}
											</Text>
										);
									})}
								</View>
							</View>
						)}
					</ScrollView>

					<FlatList
						contentContainerStyle={{
							flexGrow: 1,
							paddingHorizontal: 20
						}}
						showsVerticalScrollIndicator={false}
						data={state.tempLocations}
						renderItem={renderItem}
						keyExtractor={(item, index) => index.toString()}
						ListEmptyComponent={<Empty text="Мэдээлэл олдсонгүй." />}
					/>
				</>
			) : (
				<TempSendState />
			)}
		</View>
	);
};

export default TempLocations;

const styles = StyleSheet.create({
	backBtnContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#2C2E45",
		height: 50,
		paddingHorizontal: 10
	}
});
