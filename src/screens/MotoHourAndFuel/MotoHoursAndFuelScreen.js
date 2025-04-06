import {
	StyleSheet,
	Text,
	View,
	SafeAreaView,
	StatusBar,
	Platform,
	TouchableOpacity,
	FlatList,
	RefreshControl,
	ActivityIndicator
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import HeaderUser from "../../components/HeaderUser";
import Constants from "expo-constants";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Button, Icon } from "@rneui/base";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR, SERVER_URL, TEXT_COLOR_GRAY } from "../../constant";
import Empty from "../../components/Empty";
import axios from "axios";
import MainContext from "../../contexts/MainContext";
import { generateLast3Years } from "../../helper/functions";
import YearPicker from "../../components/YearPicker";

const MotoHoursAndFuelScreen = (props) => {
	const state = useContext(MainContext);
	const navigation = useNavigation();
	const isFocused = useIsFocused();
	const [last3Years, setLast3Years] = useState(generateLast3Years()); //*****Сүүлийн 3 жил-Сар (Хүсэлтэд ашиглах)
	const [selectedDate, setSelectedDate] = useState(generateLast3Years()[0]);
	const [data, setData] = useState(""); //*****BottomSheet рүү дамжуулах Дата
	const [uselessParam, setUselessParam] = useState(false); //*****BottomSheet -г дуудаж байгааг мэдэх гэж ашиглаж байгамоо
	const [displayName, setDisplayName] = useState(""); //*****LOOKUP -д харагдах утга (display value)

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
		const newDate = new Date(selectedDate.id);

		setSmuData(null);
		setLoadingSmuData(true);
		try {
			await axios
				.post(
					`${SERVER_URL}/mobile/truck/fuel/list`,
					{
						cid: state.companyData?.id,
						PMSEquipmentId: state.selectedEquipment?.id,
						StartRange: selectedDate.id + "-01",
						EndRange: selectedDate.id + "-" + new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate(),
						FilterDate: "-1"
					},
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${state.token}`
						}
					}
				)
				.then(function (response) {
					// console.log("get SmuData response", JSON.stringify(response.data));
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
	}, [isFocused, selectedDate]);

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
				<View style={[styles.itemRow, { marginBottom: 5 }]}>
					<Text style={styles.itemTitle}>Авсан түлш</Text>
					<Text style={styles.dividerVertical}>|</Text>
					<Text style={styles.itemTitle}>{item.Fuel} литр</Text>
				</View>
				<View style={[styles.itemRow, { marginBottom: 5 }]}>
					<Text style={[styles.itemSubTitle, { marginRight: 5 }]}>{item.SavedDate}</Text>
					<Text style={styles.itemSubTitle}>Ээлж</Text>
					<Text style={styles.dividerVertical}>|</Text>
					<Text style={styles.itemSubTitle}>{item.shift?.Name}</Text>
				</View>
				<View style={{ flexDirection: "row", alignItems: "center" }}>
					{/* <View style={styles.glowingCircle} /> */}
					<Icon name="circle-slice-8" type="material-community" size={14} color={MAIN_COLOR} />
					<View style={{ flex: 1, flexDirection: "column", justifyContent: "flex-start", marginLeft: 5 }}>
						<View style={styles.itemRow}>
							<Text style={styles.itemLabel}>Хуримтлагдсан мото цаг</Text>
							<Text style={styles.dividerVertical}>|</Text>
							<Text style={styles.itemValue2}>{item.StartSMU} цаг</Text>
						</View>
						<View style={styles.itemRow}>
							<Text style={styles.itemLabel}>Тухайн ээлжийн мото цаг</Text>
							<Text style={styles.dividerVertical}>|</Text>
							<Text style={styles.itemValue2}>{item.FinishSMU} цаг</Text>
						</View>
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
		<View
			style={{
				flex: 1,
				paddingTop: Constants.statusBarHeight,
				backgroundColor: "#fff"
			}}
		>
			<StatusBar translucent barStyle={Platform.OS == "ios" ? "dark-content" : "default"} />
			<HeaderUser isShowNotif={true} />
			<TouchableOpacity
				onPress={() => {
					props.navigation.goBack();
				}}
				style={styles.backViewContainer}
				activeOpacity={0.8}
			>
				<Icon name="chevron-left" type="feather" size={25} color="#fff" />
				<Text style={{ flex: 1, color: "#fff", fontSize: 18, marginLeft: 10, lineHeight: 18 }}>
					Мото цагийн болон түлшний бүртгэл
				</Text>
			</TouchableOpacity>

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
				<Button
					buttonStyle={styles.addBtnStyle}
					title="Бүртгэл нэмэх"
					titleStyle={{
						fontSize: 16,
						fontWeight: "bold"
					}}
					onPress={() => navigation.navigate("CreateMotoHourAndFuelScreen")}
					style={{ alignSelf: "flex-end" }}
				/>
			</View>

			<View
				style={{
					flex: 1,
					backgroundColor: "#fff"
					// backgroundColor: "red"
				}}
			>
				{loadingSmuData ? (
					<ActivityIndicator color={MAIN_COLOR} style={{ flex: 1 }} size={"large"} />
				) : (
					<FlatList
						contentContainerStyle={{
							flexGrow: 1,
							paddingHorizontal: 20
						}}
						showsVerticalScrollIndicator={false}
						data={smuData}
						renderItem={renderItem}
						keyExtractor={(item, index) => index.toString()}
						ListEmptyComponent={<Empty text="Мэдээлэл олдсонгүй." />}
						refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={MAIN_COLOR} />}
						ListHeaderComponent={
							<View style={{ paddingVertical: 10, paddingHorizontal: 5 }}>
								<Text style={{ fontWeight: "400", color: "#b7b8be", fontSize: 16 }}>
									Мото цагийн болон түлшний түүх /{smuData?.length ?? 0}/
								</Text>
							</View>
						}
					/>
				)}
			</View>
			<YearPicker bodyText={data} displayName={displayName} handle={uselessParam} action={(e) => setSelectedDate(e)} />
		</View>
	);
};

export default MotoHoursAndFuelScreen;

const styles = StyleSheet.create({
	headerActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginHorizontal: 20,
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
	},
	backViewContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#2C2E45",
		minHeight: 50,
		paddingHorizontal: 10
	},
	addBtnStyle: {
		backgroundColor: MAIN_COLOR,
		borderRadius: MAIN_BORDER_RADIUS,
		height: MAIN_BUTTON_HEIGHT
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center"
	},
	itemLabel: {
		width: "70%",
		color: "#575b62"
	},
	dividerVertical: {
		marginHorizontal: 5,
		fontSize: 16,
		color: "#b7b8be"
	},
	itemTitle: {
		fontSize: 16,
		color: "#191a2b",
		fontWeight: 600
	},
	itemSubTitle: {
		color: "#b7b8be"
	},
	itemValue2: {
		flexShrink: 1,
		marginLeft: 10,
		color: "#575b62"
	}
});
