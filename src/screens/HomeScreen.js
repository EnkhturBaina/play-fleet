import { StyleSheet, Text, View, Platform, StatusBar, SafeAreaView, Dimensions } from "react-native";
import React, { useContext, useEffect, useState, useRef } from "react";
import HeaderUser from "../components/HeaderUser";
import axios from "axios";
import MainContext from "../contexts/MainContext";
import * as Location from "expo-location";
import { useIsFocused } from "@react-navigation/native";
import Constants from "expo-constants";
import MapView, { Marker } from "react-native-maps";
import SideMenu from "react-native-side-menu-updated";
import MainSideBar from "./Sidebar/MainSideBar";
import HeaderFloatItem from "../components/HomeScreen/HeaderFloatItem";
import StatusBottomSheet from "../components/HomeScreen/StatusBottomSheet";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const HomeScreen = (props) => {
	const state = useContext(MainContext);
	const mapRef = useRef();
	const [orientation, setOrientation] = useState("PORTRAIT"); //LANDSCAPE, PORTRAIT

	const bottomSheetRef = useRef(null);
	const [speed, setSpeed] = useState(null);

	const [isOpen, setIsOpen] = useState(false);
	const [sideBarStep, setSideBarStep] = useState(1);

	//Screen LOAD хийхэд дахин RENDER хийх
	const isFocused = useIsFocused();

	const detectOrientation = () => {
		setOrientation(width > height ? "LANDSCAPE" : "PORTRAIT");
	};

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
		detectOrientation();
		console.log("STATE location=>", state.location);
		startTracking();
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
				openMenuOffset={250}
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
				<View
					style={{
						position: "absolute",
						bottom: 0,
						right: 0,
						width: orientation == "PORTRAIT" ? "100%" : "50%",
						height: "100%"
					}}
				>
					<StatusBottomSheet bottomSheetRef={bottomSheetRef} />
				</View>
			</SideMenu>
		</SafeAreaView>
	);
};

export default HomeScreen;

const styles = StyleSheet.create({});
