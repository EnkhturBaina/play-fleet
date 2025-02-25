import {
	ActivityIndicator,
	FlatList,
	RefreshControl,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Button, Icon } from "@rneui/base";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR, SERVER_URL, TEXT_COLOR_GRAY } from "../../constant";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import YearPicker from "../../components/YearPicker";
import MainContext from "../../contexts/MainContext";
import { generateLast3Years } from "../../helper/functions";
import Empty from "../../components/Empty";
import Constants from "expo-constants";
import axios from "axios";

const Tab1 = (props) => {
	const state = useContext(MainContext);
	const navigation = useNavigation();
	const isFocused = useIsFocused();
	const [last3Years, setLast3Years] = useState(generateLast3Years()); //*****Сүүлийн 3 жил-Сар (Хүсэлтэд ашиглах)
	const [selectedDate, setSelectedDate] = useState(generateLast3Years()[0]);
	const [data, setData] = useState(""); //*****BottomSheet рүү дамжуулах Дата
	const [uselessParam, setUselessParam] = useState(false); //*****BottomSheet -г дуудаж байгааг мэдэх гэж ашиглаж байгамоо
	const [displayName, setDisplayName] = useState(""); //*****LOOKUP -д харагдах утга (display value)

	const [refreshing, setRefreshing] = useState(false);

	const [cycleData, setCycleData] = useState(null);
	const [loadingCycleData, setLoadingCycleData] = useState(false);

	const wait = (timeout) => {
		return new Promise((resolve) => setTimeout(resolve, timeout));
	};

	const onRefresh = () => {
		setRefreshing(true);
		getCycleList();
		wait(1000).then(() => setRefreshing(false));
	};

	const getCycleList = async () => {
		const newDate = new Date(selectedDate.id);
		// console.log("selectedEquipment", state.selectedEquipment?.id);
		// console.log("employeeData", state.employeeData?.id);

		setCycleData(null);
		setLoadingCycleData(true);
		try {
			await axios
				.post(
					`${SERVER_URL}/mobile/cycle/list`,
					{
						cid: state.companyData?.id,
						PMSEquipmentId: state.selectedEquipment?.id,
						StartRange: selectedDate.id + "-01",
						EndRange: selectedDate.id + "-" + new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate()
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					// console.log("get CycleList response", JSON.stringify(response.data));
					if (response.data?.Type == 0) {
						setCycleData(response.data?.Extra);
					}
				})
				.catch(function (error) {
					console.log("error get CycleList", error.response.data);
				})
				.finally(() => {
					setLoadingCycleData(false);
				});
		} catch (error) {
			console.log("CATCH get CycleList", error);
		}
	};

	useEffect(() => {
		getCycleList();
	}, [isFocused, selectedDate]);

	const renderItem = ({ item }) => {
		return (
			<View
				style={{
					borderWidth: 1,
					borderRadius: MAIN_BORDER_RADIUS,
					borderColor: TEXT_COLOR_GRAY,
					padding: 10,
					marginBottom: 10
				}}
			>
				<View style={styles.itemRow}>
					<Text style={styles.itemValue}>Рейсийн дундаж хугацаа</Text>
					<Text style={styles.dividerVertical}>|</Text>
					<Text style={styles.itemValue}>{item.TM} мин</Text>
				</View>
				<View style={{ flexDirection: "row", marginTop: 10 }}>
					<Text style={styles.itemDate}>{item.SavedDate}</Text>
					<View style={{ flexDirection: "column", justifyContent: "flex-start" }}>
						<Text style={styles.itemValue}>Экскаватор: {item.loader2?.Name ?? "-"}</Text>
						<Text style={styles.itemValue}>Ачилтын блок: {item.source2?.Name + item.shot2?.ShotName}</Text>
						<Text style={styles.itemValue}>Материал: {item.material2?.Name ?? "-"}</Text>
						<Text style={styles.itemValue}>Хүргэсэн байршил: {item.source2?.Name ?? "-"}</Text>
					</View>
				</View>
			</View>
		);
	};
	const setLookupData = (data, display) => {
		setData(data); //*****Lookup -д харагдах дата
		setDisplayName(display); //*****Lookup -д харагдах датаны текст талбар
		setUselessParam(!uselessParam);
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
			<View style={styles.headerActions}>
				<TouchableOpacity
					style={styles.yearMonthPicker}
					onPress={() => {
						setLookupData(last3Years, "name");
					}}
				>
					<Text style={{ fontWeight: "600", fontSize: 16 }}>{selectedDate.name}</Text>
					<Icon name="keyboard-arrow-down" type="material-icons" size={30} />
				</TouchableOpacity>
				{/* <Button
					buttonStyle={styles.addBtnStyle}
					title="Бүртгэл нэмэх"
					titleStyle={{
						fontSize: 16,
						fontWeight: "bold"
					}}
					onPress={() => navigation.navigate("CreateReisScreen")}
				/> */}
			</View>
			<View
				style={{
					flex: 1,
					backgroundColor: "#fff"
					// backgroundColor: "red"
				}}
			>
				{loadingCycleData ? (
					<ActivityIndicator color={MAIN_COLOR} style={{ flex: 1 }} size={"large"} />
				) : (
					<FlatList
						contentContainerStyle={{
							flexGrow: 1
						}}
						showsVerticalScrollIndicator={false}
						data={cycleData}
						renderItem={renderItem}
						keyExtractor={(item, index) => index.toString()}
						ListEmptyComponent={<Empty text="Мэдээлэл олдсонгүй." />}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={MAIN_COLOR} />}
						ListHeaderComponent={
							<View style={{ paddingVertical: 10, paddingHorizontal: 5 }}>
								<Text style={{ fontWeight: "600" }}>Рейсийн түүх /{cycleData?.length ?? 0}/</Text>
							</View>
						}
					/>
				)}
			</View>
			<YearPicker bodyText={data} displayName={displayName} handle={uselessParam} action={(e) => setSelectedDate(e)} />
		</SafeAreaView>
	);
};

export default Tab1;

const styles = StyleSheet.create({
	addBtnStyle: {
		backgroundColor: MAIN_COLOR,
		borderRadius: MAIN_BORDER_RADIUS,
		height: MAIN_BUTTON_HEIGHT
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center"
	},
	dividerVertical: {
		marginHorizontal: 5,
		fontSize: 16
	},
	itemDate: {
		fontWeight: "600",
		fontSize: 16,
		width: 90
	},
	itemValue: {
		fontSize: 16
	},
	headerActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingBottom: 5,
		marginTop: 10
	},
	yearMonthPicker: {
		flexDirection: "row",
		justifyContent: "space-between",
		borderColor: MAIN_COLOR,
		borderWidth: 1,
		borderRadius: MAIN_BORDER_RADIUS,
		alignItems: "center",
		paddingVertical: 5,
		paddingLeft: 10,
		paddingRight: 5,
		alignSelf: "flex-start",
		height: MAIN_BUTTON_HEIGHT
	}
});
