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
import { ECHO_EVENT_PROGRESS, ECHO_REVERB_HOST, ECHO_REVERB_KEY, MAIN_COLOR, SERVER_URL } from "../constant";
import CustomDialog from "../components/CustomDialog";
import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
const isEnd = 0;

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

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogText, setDialogText] = useState(null); //Dialog харуулах text
	const [dialogConfirmText, setDialogConfirmText] = useState(null); //Dialog confirm button text
	const [dialogDeclineText, setDialogDeclineText] = useState(""); //Dialog decline button text

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
		// console.log("selectedEquipmentCode", state.selectedEquipmentCode);
		// console.log("refLocationTypes", state.refLocationTypes);
		startTracking();
		checkIfFileExistsAndLoad();
		// const interval = setInterval(() => {
		// 	state.checkIfInsideCircle(300).then((isInside) => {
		// 		console.log("isInside", isInside);

		// 		if (isInside) {
		// 			console.log("✅ Та радиус дотор байна!");
		// 		} else {
		// 			console.log("❌ Та радиусын гадна байна!");
		// 		}
		// 	});
		// }, 5 * 1000);

		// // Component unmount үед interval-ийг устгах
		// return () => clearInterval(interval);
		// console.log("employeeData", state.employeeData);

		window.Pusher = Pusher;
		// Pusher.logToConsole = true;
		const echo = new Echo({
			broadcaster: "reverb",
			key: ECHO_REVERB_KEY,
			wsHost: ECHO_REVERB_HOST,
			wsPort: 8000, // production case: 8000 || 8082
			wssPort: 443,
			forceTLS: true, // production case: true
			encrypted: true,
			authEndpoint: `https://pms.talent.mn/api/broadcasting/auth`,
			auth: {
				headers: {
					Authorization: `Bearer ${state.token}`
				}
			},
			enabledTransports: ["ws", "wss"],
			debug: false
		});
		// console.log("echo", echo);

		if (echo) {
			echo.private(`user.${state.employeeData?.id}`).listen(ECHO_EVENT_PROGRESS, (event) => {
				console.log("ECHO_EVENT_PROGRESS:", JSON.stringify(event));

				if (event) {
					state.setHeaderSelections((prev) => ({
						...prev,
						startPosition: event.extra?.PMSLocationId,
						blockNo: event.extra?.PMSBlastShotId,
						endLocation: event.extra?.PMSDestinationId,
						exca: event.extra?.PMSLoaderId,
						material: event.extra?.PMSMaterialUnitId
					}));

					setDialogText(event.message);
					setDialogConfirmText("Ок");
					setDialogDeclineText("");
					setVisibleDialog(true);
				}
				state.setEchoStateData(event);
				// console.log("ECHO_EVENT_PROGRESS:", event.message);
			});
			return () => {
				console.log("return");
				echo.private(`user.${state.employeeData?.id}`).stopListening(ECHO_EVENT_PROGRESS);
			};
		}

		return () => {
			// echo.disconnect();
		};
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
			<HeaderUser isBack={true} isOpen={isOpen} setIsOpen={setIsOpen} isShowNotif={true} />
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
					<View>
						<Circle
							center={{
								latitude: parseFloat(state.location?.coords?.latitude) || 0,
								longitude: parseFloat(state.location?.coords?.longitude) || 0
							}}
							radius={state.selectedEquipmentCode == 1 ? 400 : 200}
							strokeWidth={2}
							strokeColor={MAIN_COLOR}
							fillColor={`${MAIN_COLOR}80`}
						/>
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
							<View style={styles.radiusLabel}>
								<Text style={styles.radiusText}>{state.selectedEquipment?.Name}</Text>
							</View>
						</Marker>
					</View>
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
					{/* <Circle
						center={{
							latitude: parseFloat(47.91248048),
							longitude: parseFloat(106.933822)
						}}
						radius={300}
						strokeWidth={2}
						strokeColor={MAIN_COLOR}
						fillColor={MAIN_COLOR + "80"}
					/> */}
					{state.refLocations?.map((el, index) => {
						const location = state.refLocationTypes?.find((item) => item.id === el.PMSLocationTypeId);

						// Optimize location image lookup with a dictionary
						const locationImages = {
							DMP: require("../../assets/locations/DMP.png"),
							MILL: require("../../assets/locations/MILL.png"),
							STK: require("../../assets/locations/STK.png"),
							PIT: require("../../assets/locations/PIT.png")
						};

						const locationImg = locationImages[location?.Name] || null;
						const latitude = parseFloat(el.Latitude);
						const longitude = parseFloat(el.Longitude);

						return (
							<View key={index}>
								<Circle
									center={{ latitude, longitude }}
									radius={el.Radius}
									strokeWidth={2}
									strokeColor={MAIN_COLOR}
									fillColor={`${el.Color}80`}
								/>
								<Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.5 }}>
									<View style={styles.customMarker}>
										{locationImg && (
											<Image source={locationImg} style={{ width: 30, height: 30 }} contentFit="contain" />
										)}
									</View>
									<View style={styles.radiusLabel}>
										{/* <Text style={styles.radiusText}>{location?.Name}</Text> */}
										<Text style={styles.radiusText}>{el.Name}</Text>
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
				<HeaderFloatItem
					isOpen={isOpen}
					setIsOpen={setIsOpen}
					mapRef={animateRef}
					setVisibleDialog={() => {
						setDialogText("Та ээлжээ дуусгах уу?");
						setDialogConfirmText("Дуусгах");
						setDialogDeclineText("Үгүй");
						setVisibleDialog(true);
					}}
				/>
				<View
					style={{
						position: "absolute",
						bottom: 0,
						right: 0,
						width: state.orientation == "PORTRAIT" ? "100%" : "50%",
						height: "100%"
					}}
				>
					{/* <Text style={{ backgroundColor: "red" }}>
						{polygons?.length} - {kmlStatus}
					</Text> */}
					<StatusBottomSheet bottomSheetRef={bottomSheetRef} />
				</View>
			</SideMenu>

			<CustomDialog
				visible={visibleDialog}
				confirmFunction={() => {
					isEnd && props.navigation.navigate("CreateMotoHourAndFuelScreenHOME");
					setVisibleDialog(false);
				}}
				declineFunction={() => {
					setVisibleDialog(false);
				}}
				text={dialogText}
				confirmBtnText={dialogConfirmText}
				DeclineBtnText={dialogDeclineText}
				type={"warning"}
				screenOrientation={state.orientation}
			/>
		</SafeAreaView>
	);
};

export default HomeScreen;

const styles = StyleSheet.create({
	customMarker: {
		backgroundColor: "#fff",
		borderRadius: 50,
		padding: 5,
		width: 40,
		height: 40,
		alignSelf: "center"
	},
	radiusLabel: {
		padding: 2,
		flexDirection: "column",
		alignItems: "center"
	},
	radiusText: {
		color: "#fff",
		fontWeight: "600",
		textShadowColor: "black",
		textShadowOffset: { width: 2, height: 2 },
		textShadowRadius: 3
	}
});
