import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SEND_EQUIPMENT_LOCATION_MINS, SERVER_URL } from "../constant";
import * as Location from "expo-location";
import { createTable, fetchLoginData } from "../helper/db";
import { createReferenceTables, dropTable, fetchReferencesData, saveReferencesWithClear } from "../helper/reference_db";
import { useNetworkStatus } from "./NetworkContext";
import { Dimensions } from "react-native";
import "dayjs/locale/es";
import dayjs from "dayjs";
import * as Updates from "expo-updates";
import { getDistanceFromLatLonInMeters } from "../helper/functions";

const MainContext = React.createContext();
const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

export const MainStore = (props) => {
	const { isConnected } = useNetworkStatus();

	/* GENERAL STATEs START */
	const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [appIsReady, setAppIsReady] = useState(false);
	const [inspectionDone, setInspectionDone] = useState(false);
	const [seconds, setSeconds] = useState(0);
	const [isActiveTimer, setIsActiveTimer] = useState(false);
	const [locationStatus, setLocationStatus] = useState(null); //*****Location Permission
	const [dispId, setDispId] = useState(null); //*****Dispatcher ID
	const [mainCompanyId, setMainCompanyId] = useState(null); //*****Company ID
	const [isLoading, setIsLoading] = useState(false); //*****Апп ачааллах эсэх
	const [location, setLocation] = useState(null); //*****Location мэдээлэл хадгалах
	const [locationErrorCode, setLocationErrorCode] = useState(null); //*****Location error type
	const [headerUserName, setHeaderUserName] = useState(null); //*****Дээр харагдах хэрэглэгчийн нэр
	const [vehicleType, setVehicleType] = useState("Truck"); //Loader, Truck, Other
	const [headerSelections, setHeaderSelections] = useState({
		startPosition: null,
		endLocation: null,
		blockNo: null,
		material: null,
		totalLoads: null,
		exca: null,
		deliveryLocation: null,
		totalReis: null,
		assignedTask: null
	});
	const [orientation, setOrientation] = useState("PORTRAIT"); //LANDSCAPE, PORTRAIT
	const [selectedEquipment, setSelectedEquipment] = useState(null); //Сонгогдсон Төхөөрөмж
	const [selectedEquipmentCode, setSelectedEquipmentCode] = useState(null); //Сонгогдсон Төхөөрөмжийн КОД {0 - Truck},{1 - Loader},{? - Other}
	const [speed, setSpeed] = useState(null);
	const [locationWithSpeed, setLocationWithSpeed] = useState(null);
	const [savedInspectionId, setSavedInspectionId] = useState(null);
	const [selectedState, setSelectedState] = useState(null);
	/* GENERAL STATEs END */

	/* LOGIN STATEs START */
	const [employeeData, setEmployeeData] = useState(null);
	const [companyData, setCompanyData] = useState(null);
	const [rosterData, setRosterData] = useState(null);
	const [equipmentsData, setEquipmentsData] = useState(null);
	const [projectData, setProjectData] = useState(null);
	const [shiftData, setShiftData] = useState(null);
	const [userId, setUserId] = useState(null); //*****Нэвтэрсэн хэрэглэгчийн USER_ID
	const [companyId, setCompanyId] = useState(null); //*****Нэвтэрсэн хэрэглэгчийн COMPANY_ID
	const [isLoggedIn, setIsLoggedIn] = useState(false); //*****Нэвтэрсэн эсэх
	const [email, setEmail] = useState(null); //*****Утасны дугаар
	const [password, setPassword] = useState(null);
	const [token, setToken] = useState(null); //*****Хэрэглэгчийн TOKEN
	const [userData, setUserData] = useState(null); //*****Хэрэглэгчийн мэдээлэл
	const [projectId, setProjectId] = useState(null);
	/* LOGIN STATEs END */

	/* REFERENCE STATEs START */
	const [refStates, setRefStates] = useState(null);
	const [refLocations, setRefLocations] = useState(null);
	const [refMovements, setRefMovements] = useState(null);
	const [refOperators, setRefOperators] = useState(null);
	const [refMaterials, setRefMaterials] = useState(null);
	const [refStateGroups, setRefStateGroups] = useState(null);
	const [refLocationTypes, setRefLocationTypes] = useState(null);
	const [refLoaders, setRefLoaders] = useState(null);
	const [refLoaderTypes, setRefLoaderTypes] = useState(null);
	const [refShots, setRefShots] = useState(null);
	/* REFERENCE STATEs END */

	const handleStart = () => {
		setIsActiveTimer(true);
	};

	const handlePause = () => {
		setIsActiveTimer(false);
	};

	const handleReset = () => {
		setSeconds(0);
		setIsActiveTimer(false);
	};

	useEffect(() => {
		// logout();
		dropTable("ref_locations");

		dropTable("ref_states");
		// dropTable("company");
		// dropTable("roster");
		// dropTable("shift");
		// dropTable("equipments");
		// dropTable("project");

		if (isConnected) {
			//Интернэт холболттой бол Update шалгах
			checkForUpdates();
		} else {
			//Интернэтгүй бол шууд location шалгаад local шалгах
			checkLocation();
		}
		isLoggedIn && checkLocationWithSpeed(); // Нэвтэрсэн үед эхний хүсэлт шууд явуулна

		const interval = setInterval(() => {
			checkLocationWithSpeed();
		}, SEND_EQUIPMENT_LOCATION_MINS * 60 * 1000); // 5 минут тутамд хүсэлт явуулна (5*60*1000 = 300,000 мс)

		// Component unmount үед interval-ийг устгах
		return () => clearInterval(interval);
	}, []);
	const checkForUpdates = async () => {
		setIsLoading(true);
		setIsCheckingUpdate(true);
		try {
			const update = await Updates.checkForUpdateAsync();
			if (update.isAvailable) {
				setUpdateAvailable(true);
				await Updates.fetchUpdateAsync();
				Updates.reloadAsync(); // This will reload the app to apply the update
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsCheckingUpdate(false);
			checkLocation();
		}
	};
	const checkLocation = () => {
		//***** LOCATION мэдээлэл авах
		console.log("RUN check-Location");
		(async () => {
			try {
				let { status } = await Location.requestForegroundPermissionsAsync();
				setLocationStatus(status);
				if (status !== "granted") {
					setAppIsReady(true);
					// setIsLoggedIn(false);
					return;
				}

				try {
					let location = await Location.getCurrentPositionAsync({
						// accuracy: Location.Accuracy.Balanced
					});
					console.log("location", location);
					setLocation(location);
				} catch (error) {
					console.log("check Location error", error);
				}
			} catch (error) {
				console.log("check Location error", error);
			}
		})().then((e) => {});
		createSQLTables();
	};

	const createSQLTables = async () => {
		console.log("create SQL Tables STATE");

		try {
			await createTable().then(async (e) => {
				await createReferenceTables().then(async (e) => {
					if (isConnected) {
						await checkUserData();
					} else {
						fetchReferencesData().then((e) => {
							console.log("RESULT FETCH REF=> ", e);
							checkUserData();
						});
					}
				});
			});
		} catch (error) {
			console.log("error create SQL Tables", error);
		}
	};

	//*****Апп ажиллахад утасны local storage -с мэдээлэл шалгах
	const checkUserData = async () => {
		console.log("RUN check User Data");
		// logout();
		try {
			const mainCompanyId = await AsyncStorage.getItem("mainCompanyId");
			setMainCompanyId(mainCompanyId);

			const accessToken = await AsyncStorage.getItem("access_token");
			console.log("access_token", accessToken);

			if (accessToken != null) {
				setToken(accessToken);
				const responseOfflineLoginData = await fetchLoginData();
				console.log("Fetched Login Data local:", responseOfflineLoginData);

				if (!responseOfflineLoginData.employee[0]) {
					logout();
				}
				// Login response -с state үүд салгаж хадгалах
				setEmployeeData(responseOfflineLoginData.employee[0]);
				setCompanyData(responseOfflineLoginData.company[0]);
				setRosterData(responseOfflineLoginData.roster[0]);
				setEquipmentsData(responseOfflineLoginData.equipments);
				setProjectData(responseOfflineLoginData.project[0]);
				setShiftData(responseOfflineLoginData.shift[0]);

				if (responseOfflineLoginData.company[0]?.id) {
					getReferencesService(responseOfflineLoginData.company[0]?.id, accessToken, true);
				}
			} else {
				setIsLoggedIn(false);
				setIsLoading(false);
			}
		} catch (error) {
			console.error("Алдаа гарлаа checkUserData: ", error);
		} finally {
			setAppIsReady(true);
		}
	};

	const getReferencesService = async (companyId, accessToken, isRunLocal) => {
		// console.log("RUN get-References-Service", isRunLocal, accessToken);
		if (accessToken) {
			try {
				await axios
					.post(
						`${SERVER_URL}/mobile/filter/references`,
						{
							cid: companyId
						},
						{
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${accessToken}`
							}
						}
					)
					.then(async function (response) {
						// console.log("get references response", JSON.stringify(response.data));
						if (response.data?.Type == 0) {
							//Local storage руу access_token хадгалах
							//Сүлжээтэй үед сэрвэрээс мэдээлэл татаад, LOCAL TABLE үүдийг цэвэрлэж хадгалах (true үед)
							try {
								const result = await saveReferencesWithClear(response.data?.Extra, true);
								console.log("STATE get ReferencesData", result);

								if (result === "DONE_INSERT") {
									const data = await fetchReferencesData();

									// Бүх тохиргоог автоматаар хийх функц
									const updateReferences = (data, setters) => {
										Object.entries(setters).forEach(([key, setter]) => {
											data[key] && setter(data[key]);
										});
									};

									// Тохиргоог тохируулах
									updateReferences(data, {
										ref_states: setRefStates,
										ref_locations: setRefLocations,
										ref_movements: setRefMovements,
										ref_operators: setRefOperators,
										ref_materials: setRefMaterials,
										ref_state_groups: setRefStateGroups,
										ref_location_types: setRefLocationTypes,
										ref_loaders: setRefLoaders,
										ref_loader_types: setRefLoaderTypes,
										ref_shots: setRefShots
									});
									console.log("isRunLocal", isRunLocal);

									if (isRunLocal) {
										setIsLoggedIn(true);
										setIsLoading(false);
									}
								}
							} catch (error) {
								console.error("Алдаа гарлаа getReferencesService:", error);
							}
						}
					})
					.catch(function (error) {
						logout();
						console.log("error get references", error.response.data);
					});
			} catch (error) {
				console.error("Error loading local JSON:", error);
			} finally {
				// state.setIsLoggedIn(true);
			}
		} else {
			setIsLoggedIn(false);
			setIsLoading(false);
		}
	};

	const checkLocationWithSpeed = async () => {
		const { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			console.log("Permission to access location was denied");
			return;
		}

		try {
			const currentLocation = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced
			});

			console.log("Location response =>", currentLocation);

			const currentSpeed = currentLocation.coords.speed; // м/сек
			setLocationWithSpeed(currentLocation);
			setSpeed(currentSpeed !== null ? (currentSpeed * 3.6).toFixed(2) : "0.00"); // км/цаг руу хөрвүүлнэ

			// Байршил болон хурд амжилттай авсны дараа дараагийн функцээ дуудна
			sendEquipmentLocation(currentLocation, currentSpeed);
		} catch (error) {
			console.error("Error getting location:", error);
		}
	};

	const sendEquipmentLocation = async (currentLocation, currentSpeed) => {
		console.log("TOKEN", token);

		if (currentLocation && currentSpeed) {
			console.log("sendEquipmentLocation running");
			try {
				await axios
					.post(
						`${SERVER_URL}/mobile/progress/track/save`,
						{
							PMSEquipmentId: selectedEquipment?.id,
							Latitude: parseFloat(currentLocation?.coords?.latitude) || 0,
							Longitude: parseFloat(currentLocation?.coords?.longitude) || 0,
							Speed: currentSpeed,
							CurrentDate: dayjs().format("YYYY-MM-DD"),
							EventTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
							PMSProgressId: 15,
							PMSSubProgressId: 32
						},
						{
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`
							}
						}
					)
					.then(function (response) {
						console.log("send EQ Location response", JSON.stringify(response.data));
						if (response.data?.Type == 0) {
						} else {
						}
					})
					.catch(function (error) {
						console.log("error send EQ Location", error);
					});
			} catch (error) {
				console.log("CATCH send EQ Location", error);
			}
		}
	};

	// AsyncStorage.clear();
	const logout = async (type) => {
		handleReset();
		setSelectedState(null);
		setSelectedEquipmentCode(null);
		setSelectedEquipment(null);
		//***** Profile -с гарах дарсан үед утасны LOCALSTORE -с user, user_bio устгах
		const keys = [
			// "local_notif",
			"access_token",
			"inspectionId",
			"selected_eq",
			"inspectionId"
		];

		AsyncStorage.multiRemove(keys).then(() => {
			setSelectedEquipment(null);
			setInspectionDone(false);
			setDispId(null);
			setIsLoading(false);
			setIsLoggedIn(false);
		});
	};
	const detectOrientation = () => {
		setOrientation(width > height ? "LANDSCAPE" : "PORTRAIT");
	};

	const checkIfInsideCircle = async (radius) => {
		console.log("radius", radius);

		// Байршлын permission авах
		let { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			console.log("Permission not granted");
			return false;
		}

		// Байршлаа авах
		let location = await Location.getCurrentPositionAsync({});
		const myLat = location.coords.latitude;
		const myLon = location.coords.longitude;

		// Төв ба өөрийн байршлын хоорондох зайг тооцоолох
		const distance = getDistanceFromLatLonInMeters(myLat, myLon, 47.91248048, 106.933822);

		console.log("Distance:", distance, "meters");

		// Зайг шалгах
		return distance <= radius;
	};

	return (
		<MainContext.Provider
			value={{
				isLoggedIn,
				setIsLoggedIn,
				email,
				setEmail,
				isLoading,
				setIsLoading,
				token,
				setToken,
				userData,
				setUserData,
				userId,
				setUserId,
				companyId,
				setCompanyId,
				logout,
				location,
				setLocation,
				headerUserName,
				setHeaderUserName,
				locationStatus,
				setLocationStatus,
				checkLocation,
				password,
				setPassword,
				locationErrorCode,
				setLocationErrorCode,
				inspectionDone,
				setInspectionDone,
				dispId,
				setDispId,
				seconds,
				setSeconds,
				handleStart,
				handleReset,
				handlePause,
				isActiveTimer,
				setIsActiveTimer,
				appIsReady,
				setAppIsReady,
				employeeData,
				setEmployeeData,
				companyData,
				setCompanyData,
				rosterData,
				setRosterData,
				equipmentsData,
				setEquipmentsData,
				refStates,
				refLocations,
				refMovements,
				refOperators,
				refMaterials,
				refStateGroups,
				refLocationTypes,
				vehicleType,
				setVehicleType,
				headerSelections,
				setHeaderSelections,
				mainCompanyId,
				setMainCompanyId,
				detectOrientation,
				orientation,
				projectId,
				setProjectId,
				shiftData,
				setShiftData,
				projectData,
				setProjectData,
				selectedEquipment,
				setSelectedEquipment,
				getReferencesService,
				updateAvailable,
				savedInspectionId,
				setSavedInspectionId,
				selectedEquipmentCode,
				setSelectedEquipmentCode,
				selectedState,
				setSelectedState,
				checkIfInsideCircle,
				refLoaders,
				refLoaderTypes,
				refShots
			}}
		>
			{props.children}
		</MainContext.Provider>
	);
};

export default MainContext;
