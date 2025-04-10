import { Platform, StyleSheet, Text, View, SafeAreaView, useWindowDimensions } from "react-native";
import React, { useContext, useEffect, useState, useRef, useCallback, useMemo } from "react";
import HeaderUser from "../components/HeaderUser";
import MainContext from "../contexts/MainContext";
import MapView, { Circle, Marker, Polyline, UrlTile } from "react-native-maps";
import HeaderFloatItem from "../components/HomeScreen/HeaderFloatItem";
import StatusBottomSheet from "../components/HomeScreen/StatusBottomSheet";
import { useNetworkStatus } from "../contexts/NetworkContext";
import * as FileSystem from "expo-file-system";
import { checkIfFileExists, loadKML, processKML } from "../helper/kmlUtils";
import { Image } from "expo-image";
import CustomDialog from "../components/CustomDialog";
import { transformLocations } from "../helper/functions";
import { fetchMotoHourData, fetchSendLocationData, fetchSendLocationDataTemp, fetchSendStateData } from "../helper/db";
import useEcho from "../helper/useEcho";
import { ECHO_EVENT_PROGRESS, ZOOM_LEVEL } from "../constant";
import LottieView from "lottie-react-native";
import useTileLoader from "../helper/useTileLoader";
import "dayjs/locale/es";
import dayjs from "dayjs";
import { OrientationContext } from "../helper/OrientationContext";
import Constants from "expo-constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = (props) => {
	const state = useContext(MainContext);
	const orientation = useContext(OrientationContext);
	const echo = useEcho();
	const insets = useSafeAreaInsets();
	const { width, height } = useWindowDimensions();

	const { isConnected } = useNetworkStatus();
	const { tileUri, tilesReady, progress } = useTileLoader(false);

	const mapRef = useRef();
	const bottomSheetRef = useRef(null);
	const downloading = useRef(null);

	const [loadingKML, setLoadingKML] = useState(false);
	const [kmlStatus, setKmlStatus] = useState(null);
	const [fileContent, setFileContent] = useState(null);
	const [polygons, setPolygons] = useState(null);

	const [equipmentImage, setEquipmentImage] = useState(null);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogText, setDialogText] = useState(null); //Dialog харуулах text
	const [dialogConfirmText, setDialogConfirmText] = useState(null); //Dialog confirm button text

	const focusLocation = () => {
		mapRef.current.animateToRegion({
			latitude: state.location?.coords?.latitude ? parseFloat(state.location?.coords?.latitude) : 0,
			longitude: state.location?.coords?.longitude ? parseFloat(state.location?.coords?.longitude) : 0,
			latitudeDelta: 0.01,
			longitudeDelta: 0.01
		});
	};
	const animateRef = useCallback(() => {
		if (mapRef.current && state.location) {
			focusLocation();
		}
	}, [state.location]);

	useEffect(() => {
		if (mapRef.current && state.location && state.isTrack) {
			focusLocation();
		}
	}, [state.location]);

	useEffect(() => {
		if (!echo || !state.employeeData?.PMSCompanyId) return;

		const channel = echo.private(`user.${state.employeeData?.id}`);

		const handleProgressUpdate = (event) => {
			if (event) {
				// console.log("event.extra", event.extra);
				const mainState = state.refStates?.filter((item) => item.id === event.extra?.PMSProgressStateId);

				if (mainState && mainState?.length > 0) {
					if (mainState[0].ActivityShort == "W1") {
						const filteredDefaultState = state.refStates?.filter((item) => item.id === event.extra?.sub_state?.id);
						// console.log("default assign from header PMSSubProgressStateId != null", filteredDefaultState);

						// Default assign -с тухайн төхөөрөмжиййн төлөв авах
						state.setSelectedState(filteredDefaultState[0]);
					} else {
						const filteredDefaultState = state.refStates?.filter((item) => item.id === event.extra?.PMSProgressStateId);
						// console.log("default assign from header PMSSubProgressStateId == null", filteredDefaultState);

						// Default assign -с тухайн төхөөрөмжиййн төлөв авах
						state.setSelectedState(filteredDefaultState[0]);
					}
				} else {
					getLocalLastState();
				}

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

	const getLocalLastState = async () => {
		// Assign service -д ямар 1 асуудал гарвал local -д хадгалсан хамгийн сүүлд сонгогдсон төлөв харуулах

		const jsonValue = await AsyncStorage.getItem("L_last_state");
		console.log("jsonValue", JSON.parse(jsonValue));
		if (jsonValue && JSON.parse(jsonValue)?.id) {
			const filteredDefaultState = state.refStates?.filter((item) => item.id === JSON.parse(jsonValue)?.id);
			state.setSelectedState(filteredDefaultState[0]);
		}
	};

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
		const sendDataToServer = async () => {
			if (isConnected) {
				console.log("📶 Интернет холбогдлоо! Өгөгдөл сервер рүү зэрэг илгээж байна...");
				var tempLocations = await fetchSendLocationDataTemp();
				// console.log("tempLocations", tempLocations);

				state.setTempLocations(tempLocations);
				try {
					const resp = await Promise.all([
						fetchSendStateData(),
						fetchMotoHourData(),
						fetchSendLocationData(
							state.selectedEquipment?.id,
							state.location?.coords?.latitude ? parseFloat(state.location?.coords?.latitude) : 0,
							state.location?.coords?.longitude ? parseFloat(state.location?.coords?.longitude) : 0,
							0,
							dayjs().format("YYYY-MM-DD"),
							dayjs().format("YYYY-MM-DD HH:mm:ss")
						)
					]);
					console.log("selectedEquipment", state.selectedEquipment?.id);
					console.log("latitude", state.location?.coords?.latitude ? parseFloat(state.location?.coords?.latitude) : 0);
					console.log(
						"longitude",
						state.location?.coords?.longitude ? parseFloat(state.location?.coords?.longitude) : 0
					);
					console.log("dayjs", dayjs().format("YYYY-MM-DD"));
					console.log("dayjs", dayjs().format("YYYY-MM-DD HH:mm:ss"));

					console.log("📡 Бүх өгөгдлийг зэрэг илгээлээ!", JSON.stringify(resp));
				} catch (error) {
					console.error("⚠️ Өгөгдөл зэрэг илгээх явцад алдаа гарлаа:", error);
				}
			}
		};

		sendDataToServer();
	}, [isConnected]);

	const renderedPolygons = useMemo(() => {
		if (!loadingKML && polygons?.length > 0) {
			return polygons.map((el, index) => <Polyline key={index} coordinates={el.coords} strokeColor={el.strokeColor} />);
		}
		return null;
	}, [loadingKML, polygons]);

	return (
		<>
			{tilesReady && tileUri !== null && state.mapType && state.location ? (
				<View
					style={{
						flex: 1,
						paddingTop: Constants.statusBarHeight,
						backgroundColor: "#fff",
						paddingTop: insets.top
					}}
				>
					<View style={{}}>
						<HeaderUser isSideBar={true} isShowNotif={true} />
						<HeaderFloatItem mapRef={animateRef} />
					</View>
					<MapView
						// provider={PROVIDER_GOOGLE}
						// provider="google"
						ref={mapRef}
						style={{ width: width, height: height }}
						initialRegion={{
							latitude: state.location?.coords?.latitude ? parseFloat(state.location?.coords?.latitude) : 0,
							longitude: state.location?.coords?.longitude ? parseFloat(state.location?.coords?.longitude) : 0,
							latitudeDelta: 0.01,
							longitudeDelta: 0.01
						}}
						scrollEnabled={!state.isTrack} // Гулсах боломжгүй болгох
						zoomEnabled={!state.isTrack} // Томруулах боломжгүй болгох
						rotateEnabled={!state.isTrack} // Эргүүлэх боломжгүй болгох
						pitchEnabled={!state.isTrack} // 3D харагдац боломжгүй болгох
						mapType={state.mapType}
						// mapType="standard"
						// showsUserLocation
					>
						<UrlTile urlTemplate={tileUri} maximumZ={ZOOM_LEVEL} tileSize={256} />
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
								anchor={{ x: 0.5, y: 0.5 }}
								title={state.selectedEquipment?.Name}
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
									<Text style={styles.radiusText}>{state.selectedEquipment?.Name}</Text>
								</View>
							</Marker>
						</View>
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
									<Marker coordinate={{ latitude, longitude }} anchor={{ x: 0.5, y: 0.5 }} title={el.Name}>
										<View style={styles.customMarker}>
											{locationImg && (
												<Image source={locationImg} style={{ width: 30, height: 30 }} contentFit="contain" />
											)}
											<Text style={styles.radiusText}>{el.Name}</Text>
										</View>
									</Marker>
								</View>
							);
						})}
						{renderedPolygons}
					</MapView>
					<View
						style={{
							position: "absolute",
							bottom: 0,
							right: 0,
							width: orientation == "PORTRAIT" ? "100%" : "50%",
							height: Platform.OS == "ios" ? height - 65 : height - 65 - Constants.statusBarHeight
						}}
					>
						<StatusBottomSheet bottomSheetRef={bottomSheetRef} />
					</View>

					<CustomDialog
						visible={visibleDialog}
						confirmFunction={() => setVisibleDialog(false)}
						declineFunction={() => {}}
						text={dialogText}
						confirmBtnText={dialogConfirmText}
						DeclineBtnText=""
						type={"warning"}
						screenOrientation={orientation}
					/>
				</View>
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
		flexDirection: "column",
		alignSelf: "center",
		alignItems: "center"
	},
	radiusText: {
		padding: 2,
		color: "#fff",
		fontWeight: "600",
		textShadowColor: "black",
		textShadowOffset: { width: 2, height: 2 },
		textShadowRadius: 3
	}
});
