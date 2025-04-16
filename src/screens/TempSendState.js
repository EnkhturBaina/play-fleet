import { FlatList, StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import MainContext from "../contexts/MainContext";
import Constants from "expo-constants";
import { MAIN_BORDER_RADIUS } from "../constant";
import Empty from "../components/Empty";

const TempSendState = () => {
	const state = useContext(MainContext);

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
					<Text style={{ fontSize: 18, fontWeight: "600" }}>PMSProjectId</Text>
					<Text>{item.PMSProjectId}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>PMSEquipmentId</Text>
					<Text>{item.PMSEquipmentId}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>PMSProgressStateId</Text>
					<Text>{item.PMSProgressStateId}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>PMSProgressSubStateId</Text>
					<Text>{item.PMSProgressSubStateId}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>PMSEmployeeId</Text>
					<Text>{item.PMSEmployeeId}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>PMSLoaderId</Text>
					<Text>{item.PMSLoaderId}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>PMSLocationId</Text>
					<Text>{item.PMSLocationId}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>PMSBlastShotId</Text>
					<Text>{item.PMSBlastShotId}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>PMSDestination</Text>
					<Text>{item.PMSDestination}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>PMSMaterialUnitId</Text>
					<Text>{item.PMSMaterialUnitId}</Text>
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
					<Text style={{ fontSize: 18, fontWeight: "600" }}>CurrentDate</Text>
					<Text>{item.CurrentDate}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>StartTime</Text>
					<Text>{item.StartTime}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>EndTime</Text>
					<Text>{item.EndTime}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
					<Text style={{ fontSize: 18, fontWeight: "600" }}>PMSShiftId</Text>
					<Text>{item.PMSShiftId}</Text>
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
			{state.tempSendState ? (
				<FlatList
					contentContainerStyle={{
						flexGrow: 1,
						paddingHorizontal: 20
					}}
					showsVerticalScrollIndicator={false}
					data={state.tempSendState}
					renderItem={renderItem}
					keyExtractor={(item, index) => index.toString()}
					ListEmptyComponent={<Empty text="Мэдээлэл олдсонгүй." />}
				/>
			) : (
				<Text>Хоосон</Text>
			)}
		</View>
	);
};

export default TempSendState;

const styles = StyleSheet.create({
	backBtnContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#2C2E45",
		height: 50,
		paddingHorizontal: 10
	}
});
