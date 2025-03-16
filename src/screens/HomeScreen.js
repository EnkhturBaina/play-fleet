import { StyleSheet, Text, View, Platform, StatusBar, SafeAreaView, Dimensions } from "react-native";
import React, { useContext, useEffect, useState, useRef, useCallback, useMemo } from "react";
import HeaderUser from "../components/HeaderUser";
import MainContext from "../contexts/MainContext";
import Constants from "expo-constants";
import MapView, { Circle, Marker, Polyline, UrlTile } from "react-native-maps";
import SideMenu from "react-native-side-menu-updated";
import MainSideBar from "./Sidebar/MainSideBar";
import HeaderFloatItem from "../components/HomeScreen/HeaderFloatItem";
import StatusBottomSheet from "../components/HomeScreen/StatusBottomSheet";
import { useNetworkStatus } from "../contexts/NetworkContext";
import * as FileSystem from "expo-file-system";
import { checkIfFileExists, loadKML, processKML } from "../helper/kmlUtils";
import { Image } from "expo-image";
import CustomDialog from "../components/CustomDialog";
import { transformLocations } from "../helper/functions";
import { fetchMotoHourData, fetchSendStateData } from "../helper/db";
import useEcho from "../helper/useEcho";
import { ECHO_EVENT_PROGRESS, ZOOM_LEVEL } from "../constant";
import LottieView from "lottie-react-native";
import useTileLoader from "../helper/useTileLoader";

const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;
// Zoom-ний түвшин

const HomeScreen = (props) => {
	const state = useContext(MainContext);
	const echo = useEcho();

	const { isConnected } = useNetworkStatus();
	const { tileUri, tilesReady, progress } = useTileLoader(false);

	const mapRef = useRef();
	const bottomSheetRef = useRef(null);
	const downloading = useRef(null);

	const [loadingKML, setLoadingKML] = useState(false);
	const [kmlStatus, setKmlStatus] = useState(null);
	const [fileContent, setFileContent] = useState(null);
	const [polygons, setPolygons] = useState(null);

	const [isOpen, setIsOpen] = useState(false);
	const [sideBarStep, setSideBarStep] = useState(1);
	const [menuType, setMenuType] = useState(null);

	const [equipmentImage, setEquipmentImage] = useState(null);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogText, setDialogText] = useState(null); //Dialog харуулах text
	const [dialogConfirmText, setDialogConfirmText] = useState(null); //Dialog confirm button text

	const animateRef = useCallback(() => {
		if (mapRef.current && state.location) {
			mapRef.current.animateToRegion({
				latitude: state.location?.coords?.latitude ? parseFloat(state.location?.coords?.latitude) : 0,
				longitude: state.location?.coords?.longitude ? parseFloat(state.location?.coords?.longitude) : 0,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05
			});
		}
	}, [state.location]);

	useEffect(() => {
		console.log("X", state.projectData);

		if (!echo || !state.employeeData?.PMSCompanyId) return;

		const channel = echo.private(`user.${state.employeeData?.id}`);

		const handleProgressUpdate = (event) => {
			// console.log("ECHO EVENT => ", event);
			if (event) {
				// Сонгогдсон төлөв шинэчлэх
				const selectedState = state.refStates?.find((item) => item.id === event.extra?.PMSProgressStateId);
				state.setSelectedState(selectedState);

				// Header мэдээлэл шинэчлэх
				state.setHeaderSelections((prev) => ({
					...prev,
					PMSSrcId: event.extra?.PMSLocationId,
					PMSBlastShotId: event.extra?.PMSBlastShotId,
					PMSDstId: event.extra?.PMSDestinationId,
					PMSLoaderId: event.extra?.PMSLoaderId,
					PMSMaterialId: event.extra?.PMSMaterialUnitId
				}));

				// Dialog гаргах
				setDialogText(event.message);
				setDialogConfirmText("Ок");
				setVisibleDialog(true);
			}
		};

		channel.listen(ECHO_EVENT_PROGRESS, handleProgressUpdate);

		return () => {
			console.log("🛑 Stopping Echo Listener");
			channel.stopListening(ECHO_EVENT_PROGRESS);
		};
	}, [echo]);

	const equipmentImages = useMemo(
		() => ({
			Truck: require("../../assets/status/truck_main.png"),
			Loader: require("../../assets/status/loader_main.png"),
			Other: require("../../assets/status/other_main.png")
		}),
		[]
	);
	const locationImages = useMemo(
		() => ({
			DMP: require("../../assets/locations/DMP.png"),
			MILL: require("../../assets/locations/MILL.png"),
			STK: require("../../assets/locations/STK.png"),
			PIT: require("../../assets/locations/PIT.png")
		}),
		[]
	);
	useEffect(() => {
		// Төхөөрөмжийн төрлийг тодорхойлох
		const equipmentType = state.selectedEquipment?.TypeName;

		setEquipmentImage(equipmentImages[equipmentType] || require("../../assets/icon.png"));
		state.detectOrientation();
		// Байршил шалгах
		checkIfFileExistsAndLoad();

		// console.log("selectedEquipment", state.selectedEquipment);
		// console.log("employeeData", state.employeeData);

		const locationSource = transformLocations(state.refLocations, state.refLocationTypes);
		// console.log("locationSource", JSON.stringify(locationSource));
		if (locationSource) {
			state.setLocationSource(locationSource);
		}
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

	useEffect(() => {
		if (isConnected) {
			console.log("📶 Интернет холбогдлоо! Өгөгдөл сервер рүү илгээж байна...");
			fetchMotoHourData();
			fetchSendStateData(); // Сервер лүү SQLite-с дата илгээх функц
		}
	}, [isConnected]);

	const renderedPolygons = useMemo(() => {
		if (!loadingKML && polygons?.length > 0) {
			return polygons.map((el, index) => <Polyline key={index} coordinates={el.coords} strokeColor={el.strokeColor} />);
		}
		return null;
	}, [loadingKML, polygons]);

	return (
		<>
			{tilesReady && tileUri !== null ? (
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
					<HeaderUser isSideBar={true} isOpen={isOpen} setIsOpen={setIsOpen} isShowNotif={true} />
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
								latitude: state.location?.coords?.latitude ? parseFloat(state.location?.coords?.latitude) : 0,
								longitude: state.location?.coords?.longitude ? parseFloat(state.location?.coords?.longitude) : 0,
								latitudeDelta: 0.05,
								longitudeDelta: 0.05
							}}
							scrollEnabled={true}
							mapType={state.mapType}
						>
							<UrlTile
								urlTemplate={tileUri} // Урл замыг хэрэглэнэ
								maximumZ={ZOOM_LEVEL}
								tileSize={256}
							/>
							<View>
								<Circle
									center={{
										latitude: state.location?.coords?.latitude ? parseFloat(state.location?.coords?.latitude) : 0,
										longitude: state.location?.coords?.longitude ? parseFloat(state.location?.coords?.longitude) : 0
									}}
									radius={state.selectedEquipmentCode == 1 ? 400 : 200}
									strokeWidth={1}
									strokeColor="#fff"
									fillColor={state.selectedState?.Color ? `${state.selectedState?.Color}80` : "#ffffff80"}
								/>
								<Marker
									title="Таны одоогийн байршил"
									coordinate={{
										latitude: state.location?.coords?.latitude ? parseFloat(state.location?.coords?.latitude) : 0,
										longitude: state.location?.coords?.longitude ? parseFloat(state.location?.coords?.longitude) : 0
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
							latitude: 47.912620040145065,
							longitude: 106.93352509456994
						}}
						radius={500}
						strokeWidth={1}
						strokeColor={"red"}
						fillColor={"#4F9CC380"}
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

								// STK, PIT => SRC
								// DMP, STK, MILL => DST

								const locationImg = locationImages[location?.Name] || null;
								const latitude = el.Latitude ? parseFloat(el.Latitude) : 0;
								const longitude = el.Longitude ? parseFloat(el.Longitude) : 0;

								return (
									<View key={index}>
										<Circle
											center={{ latitude, longitude }}
											radius={el.Radius}
											strokeWidth={1}
											strokeColor="#fff"
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
							{renderedPolygons}
							{/* {!loadingKML &&
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
						})} */}
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
							{/* <Text style={{ backgroundColor: "red" }}>speed:{state.speed}</Text> */}
							<StatusBottomSheet bottomSheetRef={bottomSheetRef} />
						</View>
					</SideMenu>

					<CustomDialog
						visible={visibleDialog}
						confirmFunction={() => setVisibleDialog(false)}
						declineFunction={() => {}}
						text={dialogText}
						confirmBtnText={dialogConfirmText}
						DeclineBtnText=""
						type={"warning"}
						screenOrientation={state.orientation}
					/>
				</SafeAreaView>
			) : (
				<SafeAreaView
					style={{
						flex: 1,
						flexDirection: "column",
						justifyContent: "center",
						alignItems: "center",
						marginHorizontal: 20
					}}
				>
					<LottieView
						autoPlay
						ref={downloading}
						style={{
							width: 300,
							height: 300,
							backgroundColor: "transparent"
						}}
						source={require("../../assets/downloading.json")}
					/>
					<Text style={{ fontWeight: "600", fontSize: 22, textAlign: "center", marginBottom: 10 }}>
						Газрын зургийг бэлдэж байна.
					</Text>
					<Text>{progress}</Text>
				</SafeAreaView>
			)}
		</>
	);
};

export default HomeScreen;

const styles = StyleSheet.create({
	customMarker: {
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
