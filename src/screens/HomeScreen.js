import { StyleSheet, Text, View, Platform, StatusBar, SafeAreaView, Dimensions } from "react-native";
import React, { useContext, useEffect, useState, useRef } from "react";
import HeaderUser from "../components/HeaderUser";
import axios from "axios";
import MainContext from "../contexts/MainContext";
import * as Location from "expo-location";
import Constants from "expo-constants";
import MapView, { Circle, Marker, Polyline } from "react-native-maps";
import SideMenu from "react-native-side-menu-updated";
import MainSideBar from "./Sidebar/MainSideBar";
import HeaderFloatItem from "../components/HomeScreen/HeaderFloatItem";
import StatusBottomSheet from "../components/HomeScreen/StatusBottomSheet";
import { useNetworkStatus } from "../contexts/NetworkContext";
import * as FileSystem from "expo-file-system";
import { checkIfFileExists, loadKML, processKML } from "../helper/kmlUtils";
import { Image } from "expo-image";
import { MAIN_COLOR } from "../constant";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

const HomeScreen = (props) => {
	const state = useContext(MainContext);

	const { isConnected } = useNetworkStatus();

	const mapRef = useRef();
	const bottomSheetRef = useRef(null);

	const [loadingKML, setLoadingKML] = useState(false);
	const [kmlStatus, setKmlStatus] = useState(null);
	const [fileContent, setFileContent] = useState(null);
	const [polygons, setPolygons] = useState(null);

	const [isOpen, setIsOpen] = useState(false);
	const [sideBarStep, setSideBarStep] = useState(1);
	const [menuType, setMenuType] = useState(null);

	const [equipmentImage, setEquipmentImage] = useState(null);

	const [speed, setSpeed] = useState(null);

	const animateRef = () => {
		if (mapRef.current) {
			state.location
				? mapRef.current.animateToRegion({
						latitude: parseFloat(state.location?.coords?.latitude) || 0,
						longitude: parseFloat(state.location?.coords?.longitude) || 0,
						latitudeDelta: 0.05,
						longitudeDelta: 0.05
				  })
				: null;
		}
	};
	useEffect(() => {
		state.detectOrientation();
		if (state.selectedEquipment) {
			if (state.selectedEquipment?.TypeName == "Truck") {
				setEquipmentImage(require("../../assets/status/truck_main.png"));
			} else if (state.selectedEquipment?.TypeName == "Loader") {
				setEquipmentImage(require("../../assets/status/loader_main.png"));
			} else if (state.selectedEquipment?.TypeName == "Other") {
				setEquipmentImage(require("../../assets/status/other_main.png"));
			} else {
				setEquipmentImage(require("../../assets/icon.png"));
			}
		}
		// console.log("STATE refStates=>", JSON.stringify(state.refStates));
		console.log("refLocations", state.refLocations);
		console.log("refLocationTypes", state.refLocationTypes);

		const interval = setInterval(() => {
			state.checkIfInsideCircle(300).then((isInside) => {
				console.log("isInside", isInside);

				if (isInside) {
					console.log("✅ Та радиус дотор байна!");
				} else {
					console.log("❌ Та радиусын гадна байна!");
				}
			});
		}, 5 * 1000); // 5 минут тутамд хүсэлт явуулна (5*60*1000 = 300,000 мс)

		// Component unmount үед interval-ийг устгах
		return () => clearInterval(interval);
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

	// Файлыг шалгах болон лоад хийх
	const checkIfFileExistsAndLoad = async () => {
		setLoadingKML(true);
		const fileUri = FileSystem.documentDirectory + "project_kml4.txt";

		const exists = await checkIfFileExists(fileUri);

		if (exists) {
			setKmlStatus("File found from storage. DONE !");
			const fileData = await FileSystem.readAsStringAsync(fileUri);
			setFileContent(fileData);
		} else {
			if (isConnected) {
				try {
					const fileContent = await loadKML(state.projectData?.KMLFile, fileUri);
					setKmlStatus("File loaded from server. DONE !");
					setFileContent(fileContent);
				} catch (error) {
					setKmlStatus("Error loading KML file");
				}
			} else {
				setKmlStatus("File not found from storage and no internet connection");
				setLoadingKML(false);
			}
		}
	};

	useEffect(() => {
		if (fileContent !== null) {
			processKML(fileContent)
				.then((polygons) => {
					setKmlStatus("File loaded from storage. DONE !");
					setPolygons(polygons);
					setLoadingKML(false);
				})
				.catch((error) => {
					setKmlStatus("Error processing KML");
					setLoadingKML(false);
				});
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
			<HeaderUser isOpen={isOpen} setIsOpen={setIsOpen} isShowNotif={true} />
			<SideMenu
				menu={
					<MainSideBar
						sideBarStep={sideBarStep}
						setSideBarStep={setSideBarStep}
						setIsOpen={setIsOpen}
						menuType={menuType}
						setMenuType={setMenuType}
					/>
				}
				isOpen={isOpen}
				onChange={(isOpen) => setIsOpen(isOpen)}
				openMenuOffset={250}
			>
				<MapView
					// provider={PROVIDER_GOOGLE}
					ref={mapRef}
					style={[styles.map, { width: width, height: height }]}
					initialRegion={{
						latitude: parseFloat(state.location?.coords?.latitude) || 0,
						longitude: parseFloat(state.location?.coords?.longitude) || 0,
						latitudeDelta: 0.05,
						longitudeDelta: 0.05
					}}
					scrollEnabled={true}
					mapType="satellite"
				>
					<Marker
						title="Таны одоогийн байршил"
						coordinate={{
							latitude: parseFloat(state.location?.coords?.latitude) || 0,
							longitude: parseFloat(state.location?.coords?.longitude) || 0
						}}
					>
						<View style={styles.customMarker}>
							<Image
								source={equipmentImage}
								style={{
									width: 30,
									height: 30
								}}
								contentFit="contain"
							/>
						</View>
					</Marker>
					{/* <Circle
						center={{
							latitude: 47.9018422308,
							longitude: 106.9192736393
						}}
						radius={500}
						strokeWidth={1}
						strokeColor={"red"}
						fillColor={"#4F9CC3"}
					/> */}
					{/* TEST CIRCLE */}
					<Circle
						center={{
							latitude: parseFloat(47.91248048),
							longitude: parseFloat(106.933822)
						}}
						radius={300}
						strokeWidth={2}
						strokeColor={MAIN_COLOR}
						fillColor={MAIN_COLOR + "80"}
					/>
					{state.refLocations &&
						state.refLocations?.map((el, index) => {
							return (
								<View key={index}>
									<Circle
										center={{
											latitude: parseFloat(el.Latitude),
											longitude: parseFloat(el.Longitude)
										}}
										radius={el.Radius}
										strokeWidth={2}
										strokeColor={MAIN_COLOR}
										fillColor={el.Color + "80"}
									/>
									<Marker
										coordinate={{
											latitude: parseFloat(el.Latitude),
											longitude: parseFloat(el.Longitude)
										}}
										anchor={{ x: 0.5, y: 0.5 }}
									>
										<View style={styles.radiusLabel}>
											<Text style={{ fontWeight: "600" }}>
												{state.refLocationTypes?.filter((item) => item.id === el.PMSLocationTypeId)[0]?.Name}
											</Text>
											<Text style={{ fontWeight: "600" }}>{el.Name}</Text>
										</View>
									</Marker>
								</View>
							);
						})}
					{!loadingKML &&
						polygons?.length > 0 &&
						polygons?.map((el, index) => {
							return (
								<Polyline
									key={index}
									coordinates={el.coords}
									strokeColor={el.strokeColor}
									// strokeWidth={el.strokeWidth}
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
					{/* <Text>
						{polygons?.length} - {kmlStatus}
					</Text> */}
					<StatusBottomSheet bottomSheetRef={bottomSheetRef} />
				</View>
			</SideMenu>
		</SafeAreaView>
	);
};

export default HomeScreen;

const styles = StyleSheet.create({
	customMarker: {
		backgroundColor: "#fff",
		borderRadius: 50,
		padding: 5
	},
	radiusLabel: {
		backgroundColor: "white",
		padding: 5,
		borderRadius: 5,
		borderWidth: 1,
		borderColor: "black",
		flexDirection: "column",
		alignItems: "center"
	}
});
