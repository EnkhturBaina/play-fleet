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

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const HomeScreen = (props) => {
	const state = useContext(MainContext);
	const mapRef = useRef();
	const bottomSheetRef = useRef(null);

	const [isFocus, setIsFocus] = useState(false);
	const [value, setValue] = useState(null);
	const [isOpen, setIsOpen] = useState(false);
	const [sideBarStep, setSideBarStep] = useState(1);

	//Screen LOAD хийхэд дахин RENDER хийх
	const isFocused = useIsFocused();

	useEffect(() => {
		// console.log("STATE", state.location);
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
					initialRegion={
						state.location
							? {
									latitude: state.location?.coords?.latitude,
									longitude: state.location?.coords?.longitude,
									latitudeDelta: 0.0121,
									longitudeDelta: 0.0121
							  }
							: position
					}
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

				<View style={styles.floatButtons}>
					<View
						style={{
							backgroundColor: "#fff",
							padding: 10,
							alignSelf: "center",
							width: width - 20,
							marginHorizontal: 10,
							borderRadius: MAIN_BORDER_RADIUS
						}}
					>
						<Text style={{ color: MAIN_COLOR, fontSize: 18 }}>МАТЕРИАЛЫН УРСГАЛ</Text>
						<View style={styles.stack1}>
							<Text style={{ color: MAIN_COLOR_BLUE, fontSize: 18 }}>Ачилт хийлгэх байршил</Text>
							<Dropdown
								style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
								placeholderStyle={styles.placeholderStyle}
								selectedTextStyle={styles.selectedTextStyle}
								inputSearchStyle={styles.inputSearchStyle}
								data={WEEKDAYS}
								maxHeight={300}
								labelField="label"
								valueField="value"
								placeholder={!isFocus ? "XXX" : "..."}
								value={value}
								onFocus={() => setIsFocus(true)}
								onBlur={() => setIsFocus(false)}
								onChange={(item) => {
									setValue(item.value);
									setIsFocus(false);
								}}
							/>
						</View>
						<View style={styles.stack1}>
							<Text style={{ color: MAIN_COLOR_BLUE, fontSize: 18 }}>Хүргэх байршил</Text>
							<Dropdown
								style={[styles.dropdown, isFocus && { borderColor: "blue" }]}
								placeholderStyle={styles.placeholderStyle}
								selectedTextStyle={styles.selectedTextStyle}
								inputSearchStyle={styles.inputSearchStyle}
								data={WEEKDAYS}
								maxHeight={300}
								labelField="label"
								valueField="value"
								placeholder={!isFocus ? "XXX" : "..."}
								value={value}
								onFocus={() => setIsFocus(true)}
								onBlur={() => setIsFocus(false)}
								onChange={(item) => {
									setValue(item.value);
									setIsFocus(false);
								}}
							/>
						</View>
					</View>
					<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 10 }}>
						<TouchableOpacity
							onPress={() =>
								state.location
									? mapRef.current.animateToRegion({
											latitude: state.location?.coords?.latitude,
											longitude: state.location?.coords?.longitude,
											latitudeDelta: 0.0121,
											longitudeDelta: 0.0121
									  })
									: null
							}
							style={styles.eachFloatButton}
						>
							<Icon name="location-sharp" type="ionicon" size={35} color={MAIN_COLOR} />
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => {
								console.log("X");
							}}
							style={styles.eachFloatButton}
						>
							<Image
								source={require("../../assets/images/route.png")}
								style={{
									height: 35,
									width: 35
								}}
								contentFit="contain"
							/>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => {
								// props.navigation.navigate("TestSQL");
								props.navigation.navigate("TestRenderUurhai");
							}}
							style={styles.eachFloatButton}
						>
							<Image
								source={require("../../assets/images/Picture2.png")}
								style={{
									height: 35,
									width: 35
								}}
								contentFit="contain"
							/>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.eachFloatButton}>
							<Image
								source={require("../../assets/images/Picture3.png")}
								style={{
									height: 35,
									width: 35
								}}
								contentFit="contain"
							/>
						</TouchableOpacity>
					</View>
				</View>
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
								<Text style={{ color: "#fff", fontSize: 20 }}>CОНГОГДСОН ТӨЛӨВ</Text>
							</View>
							<Text style={{ color: MAIN_COLOR_BLUE, fontSize: 28 }}>{state.formatTime(state.seconds)}</Text>
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
	floatButtons: {
		position: "absolute", //use absolute position to show button on top of the map
		left: 0,
		top: 10,
		alignSelf: "flex-end" //for align to right
	},
	btnText: {
		fontSize: 14,
		paddingVertical: 10,
		borderRadius: 20,
		overflow: "hidden",
		color: "#fff",
		width: 120,
		textAlign: "center"
	},
	dropdown: {
		borderColor: "#aeaeae",
		borderWidth: 0.5,
		paddingHorizontal: 8,
		width: "50%",
		height: 25
	},
	placeholderStyle: {
		fontSize: 16,
		fontWeight: "bold"
	},
	selectedTextStyle: {
		fontSize: 16,
		fontWeight: "bold"
	},
	inputSearchStyle: {
		height: 40,
		fontSize: 16
	},
	stack1: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 10
	},
	eachFloatButton: {
		height: 50,
		width: 50,
		padding: 5,
		backgroundColor: "#fff",
		borderRadius: 50,
		marginRight: 8,
		alignItems: "center",
		justifyContent: "center"
	},
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
