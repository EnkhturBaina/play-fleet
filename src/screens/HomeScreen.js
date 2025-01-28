import {
	StyleSheet,
	Text,
	View,
	Platform,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	StatusBar,
	Linking,
	SafeAreaView,
	Dimensions
} from "react-native";
import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import { Icon, Button } from "@rneui/base";
import {
	MAIN_BORDER_RADIUS,
	MAIN_COLOR,
	MAIN_COLOR_BLUE,
	MAIN_COLOR_GRAY,
	MAIN_COLOR_GREEN,
	MAIN_COLOR_RED,
	SERVER_URL,
	WEEKDAYS
} from "../constant";
import HeaderUser from "../components/HeaderUser";
import axios from "axios";
import MainContext from "../contexts/MainContext";
import CustomDialog from "../components/CustomDialog";
import * as Location from "expo-location";
import { useIsFocused } from "@react-navigation/native";
import Constants from "expo-constants";
import RBSheet from "react-native-raw-bottom-sheet";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import { Dropdown } from "react-native-element-dropdown";
import SideMenu from "react-native-side-menu-updated";
import MainSideBar from "./Sidebar/MainSideBar";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Image } from "expo-image";
import HeaderFloatItem from "../components/HomeScreen/HeaderFloatItem";
import { formatTime } from "../helper/functions";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const HomeScreen = (props) => {
	const state = useContext(MainContext);
	const mapRef = useRef();
	const bottomSheetRef = useRef(null);
	const [speed, setSpeed] = useState(null);

	const [isOpen, setIsOpen] = useState(false);
	const [sideBarStep, setSideBarStep] = useState(1);

	//Screen LOAD хийхэд дахин RENDER хийх
	const isFocused = useIsFocused();

	const animateRef = () => {
		if (mapRef.current) {
			state.location
				? mapRef.current.animateToRegion({
						latitude: state.location?.coords?.latitude,
						longitude: state.location?.coords?.longitude,
						latitudeDelta: 0.0121,
						longitudeDelta: 0.0121
				  })
				: null;
		}
	};
	useEffect(() => {
		console.log("STATE location=>", state.location);
		startTracking();
	}, []);

	const handleSheetChanges = useCallback((index) => {
		console.log("handleSheetChanges", index);
	}, []);

	useEffect(() => {
		let interval = null;
		if (state.isActiveTimer) {
			interval = setInterval(() => {
				state.setSeconds((prevSeconds) => prevSeconds + 1);
			}, 1000);
		} else {
			clearInterval(interval);
		}
		return () => clearInterval(interval);
	}, [state.isActiveTimer]);

	const BOTTOM_SHEET_MENU_LIST = [
		{ id: "1", label: "АЧААЛАГДАХ /СЭЛГЭЭ ХИЙХ/", img: require("../../assets/images/Picture4.png") },
		{ id: "2", label: "АЧААТАЙ ЧИГЛЭЛД ТЭЭВЭРЛЭХ", img: require("../../assets/images/Picture5.png") },
		{ id: "3", label: "АЧАА БУУЛГАХ /СЭЛГЭЭ ХИЙХ/", img: require("../../assets/images/Picture7.png") },
		{ id: "4", label: "ХООСОН БУЦАХ", img: require("../../assets/images/Picture8.png") },
		{ id: "5", label: "АЧИЛТ ХИЙЛГЭХЭЭР ХҮЛЭЭХ", img: require("../../assets/images/Picture9.png") }
	];
	//TIMER CONTROL
	// <Button title={isActive ? "Pause" : "Start"} onPress={isActive ? handlePause : handleStart} />
	// <Button title="Reset" onPress={handleReset} />

	const startTracking = async () => {
		// Байршил ашиглах зөвшөөрөл авах
		const { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			setErrorMsg("Байршлын зөвшөөрөл олгогдоогүй байна!");
			return;
		}

		// Байршлыг бодит цагийн горимд авах
		await Location.watchPositionAsync(
			{
				accuracy: Location.Accuracy.Balanced,
				timeInterval: 1000, // 1 секунд тутамд шинэчлэнэ
				distanceInterval: 1 // 1 метр тутамд шинэчлэнэ
			},
			(location) => {
				// console.log("location", location);
				// Хурдыг м/сек-ээр авах
				const currentSpeed = location.coords.speed; // м/сек
				// console.log("currentSpeed", currentSpeed);

				if (currentSpeed !== null) {
					setSpeed((currentSpeed * 3.6).toFixed(2)); // км/цаг руу хөрвүүлнэ
				}
			}
		);
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
			<SideMenu
				menu={<MainSideBar sideBarStep={sideBarStep} setSideBarStep={setSideBarStep} setIsOpen={setIsOpen} />}
				isOpen={isOpen}
				onChange={(isOpen) => setIsOpen(isOpen)}
			>
				<MapView
					// provider={PROVIDER_GOOGLE}
					ref={mapRef}
					style={[styles.map, { width: width, height: height }]}
					initialRegion={{
						latitude: state.location?.coords?.latitude,
						longitude: state.location?.coords?.longitude,
						latitudeDelta: 0.0121,
						longitudeDelta: 0.0121
					}}
					scrollEnabled={true}
				>
					<Marker
						title="Таны одоогийн байршил"
						coordinate={{
							latitude: state.location?.coords?.latitude,
							longitude: state.location?.coords?.longitude,
							latitudeDelta: 0.0121,
							longitudeDelta: 0.0121
						}}
					/>
				</MapView>
				<HeaderFloatItem isOpen={isOpen} setIsOpen={setIsOpen} mapRef={animateRef} />
				<BottomSheet ref={bottomSheetRef} snapPoints={[130, 500]} onChange={handleSheetChanges}>
					<BottomSheetView style={styles.contentContainer}>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between"
							}}
						>
							<View
								style={{
									backgroundColor: MAIN_COLOR,
									borderRadius: 50,
									padding: 5,
									paddingHorizontal: 10,
									alignSelf: "flex-start"
								}}
							>
								<Text style={{ color: "#fff", fontSize: 20 }}>CОНГОГДСОН ТӨЛӨВ {speed} км/ц</Text>
							</View>
							<Text style={{ color: MAIN_COLOR_BLUE, fontSize: 28 }}>{formatTime(state.seconds)}</Text>
						</View>
						<View style={styles.eachBottomList}>
							<Image source={require("../../assets/images/Picture4.png")} style={{ height: 50, width: 50 }} />
							<Text
								style={{
									color: "#6287CA",
									fontSize: 22,
									flex: 1,
									marginLeft: 10,
									textAlign: "center",
									flexWrap: "wrap"
								}}
							>
								(S5) Бусад техникийн ослоос шалтгаалсан
							</Text>
						</View>
						<View
							style={{
								backgroundColor: MAIN_COLOR_GREEN,
								borderRadius: 50,
								padding: 5,
								paddingHorizontal: 10,
								alignSelf: "flex-start",
								marginTop: 10
							}}
						>
							<Text style={{ color: "#fff", fontSize: 20 }}>БҮТЭЭЛТЭЙ АЖИЛЛАХ</Text>
						</View>
						<ScrollView>
							{BOTTOM_SHEET_MENU_LIST.map((el, index) => {
								return (
									<TouchableOpacity
										style={styles.eachBottomList}
										key={index}
										onPress={() => {
											state.handleReset();
											state.handleStart();
										}}
									>
										<Image source={el.img} style={{ height: 50, width: 50 }} />
										<Text
											style={{
												color: MAIN_COLOR_GREEN,
												fontSize: 18,
												flex: 1,
												marginLeft: 10,
												textAlign: "center",
												flexWrap: "wrap"
											}}
										>
											{el.label}
										</Text>
									</TouchableOpacity>
								);
							})}
						</ScrollView>
					</BottomSheetView>
				</BottomSheet>
			</SideMenu>
		</SafeAreaView>
	);
};

export default HomeScreen;

const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		marginHorizontal: 20
	},
	eachBottomList: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: MAIN_COLOR_GRAY,
		borderRadius: MAIN_BORDER_RADIUS,
		marginTop: 10,
		padding: 5,
		height: 60
	}
});
