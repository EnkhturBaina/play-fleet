import { StyleSheet, Text, View, Platform, StatusBar, SafeAreaView, Dimensions } from "react-native";
import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import HeaderUser from "../components/HeaderUser";
import MainContext from "../contexts/MainContext";
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
import CustomDialog from "../components/CustomDialog";
import useCustomEffect from "../helper/useCustomEffect";
import { transformLocations } from "../helper/functions";

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

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogText, setDialogText] = useState(null); //Dialog харуулах text
	const [dialogConfirmText, setDialogConfirmText] = useState(null); //Dialog confirm button text

	const animateRef = useCallback(() => {
		if (mapRef.current && state.location) {
			mapRef.current.animateToRegion({
				latitude: parseFloat(state.location?.coords?.latitude) || 0,
				longitude: parseFloat(state.location?.coords?.longitude) || 0,
				latitudeDelta: 0.05,
				longitudeDelta: 0.05
			});
		}
	}, [state.location]);

	useCustomEffect(state, setEquipmentImage, setDialogText, setDialogConfirmText, setVisibleDialog);

	useEffect(() => {
		// Байршил шалгах
		checkIfFileExistsAndLoad();

		// console.log("refLocationTypes", state.refLocationTypes);
		// console.log("refStates", state.refStates);

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
							strokeWidth={1}
							strokeColor="#fff"
							fillColor={`${state.selectedState?.Color}80`}
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
					<Circle
						center={{
							latitude: 47.912620040145065,
							longitude: 106.93352509456994
						}}
						radius={500}
						strokeWidth={1}
						strokeColor={"red"}
						fillColor={"#4F9CC380"}
					/>
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

						// STK, PIT => SRC
						// DMP, STK, MILL => DST

						const locationImg = locationImages[location?.Name] || null;
						const latitude = parseFloat(el.Latitude);
						const longitude = parseFloat(el.Longitude);

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
					{/* <Text style={{ backgroundColor: "red" }}>speed:{state.speed}</Text> */}
					<StatusBottomSheet bottomSheetRef={bottomSheetRef} />
				</View>
			</SideMenu>

			<CustomDialog
				visible={visibleDialog}
				confirmFunction={() => {
					setVisibleDialog(false);
				}}
				declineFunction={() => {}}
				text={dialogText}
				confirmBtnText={dialogConfirmText}
				DeclineBtnText=""
				type={"warning"}
				screenOrientation={state.orientation}
			/>
		</SafeAreaView>
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
