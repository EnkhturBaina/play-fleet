import { StyleSheet, Text, View, Platform, StatusBar, SafeAreaView, Dimensions } from "react-native";
import React, { useContext, useEffect, useState, useRef } from "react";
import HeaderUser from "../components/HeaderUser";
import axios from "axios";
import MainContext from "../contexts/MainContext";
import * as Location from "expo-location";
import { useIsFocused } from "@react-navigation/native";
import Constants from "expo-constants";
import MapView, { Marker, Polyline } from "react-native-maps";
import SideMenu from "react-native-side-menu-updated";
import MainSideBar from "./Sidebar/MainSideBar";
import HeaderFloatItem from "../components/HomeScreen/HeaderFloatItem";
import StatusBottomSheet from "../components/HomeScreen/StatusBottomSheet";
import { useNetworkStatus } from "../contexts/NetworkContext";
import { parseString } from "react-native-xml2js";
import * as FileSystem from "expo-file-system";
import { convertHexWithAlpha } from "../helper/functions";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const HomeScreen = (props) => {
	const state = useContext(MainContext);
	const mapRef = useRef();

	const [kmlData, setKmlData] = useState("");
	const [loadingKML, setLoadingKML] = useState(false);
	const [kmlStatus, setKmlStatus] = useState(null);
	const [fileContent, setFileContent] = useState(null);
	const [polygons, setPolygons] = useState(null);
	const { isConnected } = useNetworkStatus();

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
		state.detectOrientation();
		console.log("STATE location=>", state.location);
		// console.log("refLocations", state.refLocations);

		startTracking();
		checkIfFileExists();
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

	const loadKML = async (is_clear) => {
		if (is_clear) {
			// is_clear = true; Цэвэрлээд шинээр татаж авах
			setFileContent(null);
			setLoadingKML(true);
		}
		setKmlStatus("File not found from storage. Loading from server");
		try {
			// URL-с KML файлыг татаж авах
			// const response = await fetch("https://drive.google.com/uc?export=download&id=1PeHfxTDwRLAFWdypOY7nxm1mvruKYsup");
			const response = await fetch("https://drive.google.com/uc?export=download&id=1LDXA3r1EoszfCgXDrMxAPQuDcdGdAPxC");
			const serverFileContent = await response.text();

			const fileUri = FileSystem.documentDirectory + "new_kml_data2.txt";

			await FileSystem.writeAsStringAsync(fileUri, serverFileContent);

			setKmlData(serverFileContent);
			checkIfFileExists();
		} catch (error) {
			setLoadingKML(false);
			setKmlStatus(error);
			console.error("Error loading KML file:", error);
		}
	};

	const checkIfFileExists = async () => {
		setLoadingKML(true);
		setKmlStatus("Loading from local storage");
		const fileUri = FileSystem.documentDirectory + "new_kml_data2.txt";

		// Файл local -д хадгалагдсан бол унших
		try {
			const fileInfo = await FileSystem.getInfoAsync(fileUri);
			console.log("fileInfo", fileInfo);

			if (fileInfo.exists) {
				setKmlStatus("File found from storage. DONE !");
				const fileData = await FileSystem.readAsStringAsync(fileUri);
				// console.log("fileData", fileData);

				setFileContent(fileData);
			} else {
				if (isConnected) {
					loadKML(false);
				} else {
					setKmlStatus("File not found from storage and no internet connection");
					setLoadingKML(false); //local -с уншаад оффлайн байвал loading-г false болгох
				}
				setFileContent(null);
			}
		} catch (error) {
			setLoadingKML(false);
			setKmlStatus(error);
			console.error("Error reading file:", error);
		}
	};

	useEffect(() => {
		if (kmlData) {
			setKmlStatus("File loaded from server. DONE !");
			setLoadingKML(false); //server -с kmlData уншаад бэлэн болоход loading-г false болгох
		}
	}, [kmlData]);

	useEffect(() => {
		console.log("Z");
		if (fileContent !== null) {
			try {
				parseString(fileContent, { trim: true }, (err, result) => {
					if (err) {
						console.error("Error parsing KML:", err);
						return;
					}

					// console.log("results", JSON.stringify(result.kml.Document[0].Folder[0].Placemark));
					const placemarks = result.kml.Document[0].Folder[0].Placemark || [];
					// console.log("placemarks", JSON.stringify(placemarks));

					const extractedPolygons = placemarks.map((placemark) => {
						const strokeColor = convertHexWithAlpha(placemark?.Style?.[0]?.LineStyle?.[0]?.color?.[0]);
						const strokeWidth = placemark.Style[0].LineStyle[0].width[0];

						const coordinatesString = placemark.LineString[0].coordinates[0];
						const coordinatesArray = coordinatesString
							.trim()
							.split(" ")
							.map((coordinate) => {
								const [longitude, latitude] = coordinate.split(",").map(Number);
								return { latitude, longitude };
							});
						return { coords: coordinatesArray, strokeColor, strokeWidth };
					});
					setPolygons(extractedPolygons);
					setLoadingKML(false); //local -с уншаад файл байвал loading-г false болгох
				});
			} catch (error) {
				console.log("ERR", error);
			}
		}
	}, [fileContent]);

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
			<HeaderUser isOpen={isOpen} setIsOpen={setIsOpen} />
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
					mapType="satellite"
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
					{polygons?.length > 0 &&
						polygons?.map((el, index) => {
							return (
								<Polyline
									key={index}
									coordinates={el.coords}
									strokeColor={el.strokeColor}
									strokeWidth={el.strokeWidth}
								/>
							);
						})}
				</MapView>
				<HeaderFloatItem isOpen={isOpen} setIsOpen={setIsOpen} mapRef={animateRef} />
				<View
					style={{
						position: "absolute",
						bottom: 0,
						right: 0,
						width: state.orientation == "PORTRAIT" ? "100%" : "50%",
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
