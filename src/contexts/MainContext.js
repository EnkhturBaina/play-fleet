import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URL } from "../constant";
import * as Location from "expo-location";
import { createTable, fetchLoginData } from "../helper/db";
import { createReferenceTables, dropTable, fetchReferencesData, saveReferencesWithClear } from "../helper/reference_db";
import { useNetworkStatus } from "./NetworkContext";
import "dayjs/locale/es";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import * as Updates from "expo-updates";
import { getDistanceFromLatLonInMeters } from "../helper/functions";
import { sendLocation } from "../helper/apiService";

const MainContext = React.createContext();
dayjs.extend(customParseFormat);

export const MainStore = (props) => {
	const { isConnected } = useNetworkStatus();

	/* GENERAL STATEs START */
	const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
	const [updateAvailable, setUpdateAvailable] = useState(false);
	const [inspectionDone, setInspectionDone] = useState(false);
	const [seconds, setSeconds] = useState(0);
	const [isActiveTimer, setIsActiveTimer] = useState(false);
	const [locationStatus, setLocationStatus] = useState(null); //*****Location Permission
	const [dispId, setDispId] = useState(null); //*****Dispatcher ID
	const [mainCompanyId, setMainCompanyId] = useState(null); //*****Company ID
	const [isLoading, setIsLoading] = useState(false); //*****Апп ачааллах эсэх
	const [location, setLocation] = useState(null); //*****Location мэдээлэл хадгалах
	const [locationErrorCode, setLocationErrorCode] = useState(null); //*****Location error type
	const [vehicleType, setVehicleType] = useState("Truck"); //Loader, Truck, Other
	const [headerSelections, setHeaderSelections] = useState({
		PMSSrcId: null,
		PMSDstId: null,
		PMSBlastShotId: null,
		PMSMaterialId: null,
		totalLoads: null,
		PMSLoaderId: null,
		deliveryLocation: null,
		totalReis: null,
		assignedTask: null
	});
	const [selectedEquipment, setSelectedEquipment] = useState(null); //Сонгогдсон Төхөөрөмж
	const [selectedEquipmentCode, setSelectedEquipmentCode] = useState(null); //Сонгогдсон Төхөөрөмжийн КОД {0 - Truck},{1 - Loader},{? - Other}
	const [savedInspectionId, setSavedInspectionId] = useState(null);
	const [selectedState, setSelectedState] = useState(null);
	const [echoStateData, setEchoStateData] = useState(null); // echo -р ирсэн дата хадгалах
	const [locationSource, setLocationSource] = useState({
		SRC: { latitude: 47.92, longitude: 106.917, radius: 500 }, // Гол SRC төв
		DST: { latitude: 47.914, longitude: 106.925, radius: 500 }, // Гол DST төв

		SRC_SUB: {
			STK: { latitude: 47.921, longitude: 106.918, radius: 200 },
			PIT: { latitude: 47.919, longitude: 106.916, radius: 300 }
		},

		DST_SUB: {
			DMP: { latitude: 47.915, longitude: 106.926, radius: 250 },
			STK: { latitude: 47.913, longitude: 106.924, radius: 200 },
			MILL: { latitude: 47.912, longitude: 106.923, radius: 150 }
		}
	});
	const [mapType, setMapType] = useState("satellite");
	const [isTrack, setIsTrack] = useState(true);
	const [showLocationInfo, setShowLocationInfo] = useState(false);
	const [storedItems, setStoredItems] = useState([]);
	const [trackCount, setTrackCount] = useState(0);
	const [tempLocations, setTempLocations] = useState([]);
	const [sendLocationStatus, setSendLocationStatus] = useState([]);
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
		const runFirst = async () => {
			// dropTable("moto_hour");
			setIsLoading(true);
			await AsyncStorage.getItem("L_last_state_time").then(async (local_last_state_time) => {
				try {
					if (local_last_state_time) {
						const last_state_time = dayjs(local_last_state_time, "YYYY-DD-MM HH:mm:ss");
						const current_time = dayjs();

						const differenceInSeconds = current_time.diff(last_state_time, "second");
						if (typeof differenceInSeconds === "number" && !isNaN(differenceInSeconds) && differenceInSeconds > 0) {
							setSeconds(differenceInSeconds);
							handleStart();
						}
					}
				} catch (error) {
					console.log("error", error);
				}
				await AsyncStorage.getItem("L_track_count").then(async (totalTrack) => {
					if (totalTrack) {
						setTrackCount(parseInt(totalTrack));
					} else {
						setTrackCount(0);
					}
					await AsyncStorage.getItem("L_map_type").then(async (map_type) => {
						if (map_type) {
							setMapType(map_type);
						} else {
							setMapType("satellite");
						}
						if (isConnected) {
							await checkForUpdates(); // Интернэт холболттой бол Update шалгах
						} else {
							await createSQLTables(); // Интернэтгүй бол local шалгах
						}
					});
				});
			});
		};

		runFirst();
	}, []); // Empty dependency array for only running once (on mount)

	const checkLocationWithSpeed = async () => {
		const { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			console.log("Permission to access location was denied");
			return;
		}

		try {
			const currentLocation = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.High
			});

			if (!currentLocation) return;

			const eventTime = dayjs().format("YYYY-MM-DD HH:mm:ss");
			const [localToken, currentSpeed] = await Promise.all([
				AsyncStorage.getItem("L_access_token"),
				AsyncStorage.getItem("L_current_speed")
			]);

			setSendLocationStatus((prevStatus) => [...prevStatus, `2 => running checkLocationWithSpeed: [${eventTime}]`]);
			setSendLocationStatus((prevStatus) => [...prevStatus, `2 => isConnected: [${isConnected}]`]);

			await addItemToStorage(eventTime);

			const response = await sendLocation(
				localToken,
				selectedEquipment,
				parseFloat(currentLocation?.coords?.latitude) || 0,
				parseFloat(currentLocation?.coords?.longitude) || 0,
				currentSpeed ?? 0,
				dayjs().format("YYYY-MM-DD"),
				eventTime,
				isConnected
			);
			// console.log("response", response);

			if (response) {
				setSendLocationStatus((prevStatus) => [...prevStatus, `3 => running sendLocation response ${response}`]);
			}
		} catch (error) {
			setSendLocationStatus((prevStatus) => [...prevStatus, `2 => ${error}`]);
			console.error("Error getting or sending location:", error);
		}
	};

	const loadStoredItems = async () => {
		try {
			const storedData = await AsyncStorage.getItem("L_send_location_times");
			// console.log("storedData", storedData);

			setStoredItems(storedData ? JSON.parse(storedData) : []);
		} catch (error) {
			console.error("❌ Өгөгдөл ачаалахад алдаа гарлаа:", error);
		}
	};

	// ✅ Шинэ өгөгдлийг хадгалах (FIFO)
	const addItemToStorage = async (EventTime) => {
		try {
			const storedData = await AsyncStorage.getItem("L_send_location_times");
			let storedItems = storedData ? JSON.parse(storedData) : [];

			let updatedItems = [...storedItems, dayjs(EventTime).format("HH:mm")];

			if (updatedItems.length > 5) {
				updatedItems.shift();
			}

			// 💾 `AsyncStorage`-д хадгалах
			await AsyncStorage.setItem("L_send_location_times", JSON.stringify(updatedItems));

			// 🔄 State шинэчлэх
			setStoredItems(updatedItems);
		} catch (error) {
			console.error("❌ Өгөгдөл хадгалах үед алдаа гарлаа:", error);
		}
	};

	// ✅ Бүх өгөгдлийг устгах
	const clearStorage = async () => {
		try {
			await AsyncStorage.removeItem("L_send_location_times");
			setStoredItems([]);
		} catch (error) {
			console.error("❌ Өгөгдөл устгах үед алдаа гарлаа:", error);
		}
	};

	const checkForUpdates = async () => {
		setIsCheckingUpdate(true);
		try {
			const update = await Updates.checkForUpdateAsync();
			console.log("update", update);

			if (update.isAvailable) {
				setUpdateAvailable(true);
				await Updates.fetchUpdateAsync();
				Updates.reloadAsync(); // This will reload the app to apply the update
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsCheckingUpdate(false);
			createSQLTables();
		}
	};

	const createSQLTables = async () => {
		console.log("create SQL Tables STATE");

		try {
			await createTable().then(async (e) => {
				await createReferenceTables().then(async (e) => {
					if (isConnected) {
						await checkUserData();
					} else {
						const data = await fetchReferencesData();
						setRefsToState(data, true);
					}
				});
			});
		} catch (error) {
			console.log("error create SQL Tables", error);
		}
	};

	//*****Апп ажиллахад утасны local storage -с мэдээлэл шалгах
	const checkUserData = async () => {
		// console.log("RUN check User Data");
		try {
			const mainCompanyId = await AsyncStorage.getItem("L_main_company_id");
			setMainCompanyId(mainCompanyId);

			const accessToken = await AsyncStorage.getItem("L_access_token");
			// console.log("L_access_token", L_access_token);
			if (!accessToken) {
				setIsLoggedIn(false);
				setIsLoading(false);
				return;
			}

			setToken(accessToken);
			const responseOfflineLoginData = await fetchLoginData();

			if (!responseOfflineLoginData?.company?.[0]) {
				logout();
				return;
			}

			if (responseOfflineLoginData?.company?.[0]?.id) {
				await getReferencesService(responseOfflineLoginData.company[0].id, accessToken, true);
			}
		} catch (error) {
			console.error("Алдаа гарлаа check_User_Data: ", error);
		}
	};

	const getReferencesService = async (companyId, accessToken, isRunLocal) => {
		if (!accessToken) {
			setIsLoggedIn(false);
			setIsLoading(false);
			return;
		}
		try {
			const response = await axios.post(
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
			);

			if (response.data?.Type === 0) {
				try {
					const result = await saveReferencesWithClear(response.data?.Extra, true);

					if (result === "DONE_INSERT") {
						const data = await fetchReferencesData();
						if (data) {
							setRefsToState(data, isRunLocal);
						}
					}
				} catch (error) {
					console.error("Алдаа гарлаа getReferencesService:", error);
				}
			}
		} catch (error) {
			console.error("Алдаа гарлаа getReferencesService API:", error);
			logout();
		}
	};

	const setRefsToState = async (data, isRunLocal) => {
		// console.log("RUN set Refs To State");

		const updateReferences = (data, setters) => {
			Object.entries(setters).forEach(([key, setter]) => {
				if (data[key]) setter(data[key]);
			});
		};

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

		try {
			const responseOfflineLoginData = await fetchLoginData();
			if (!responseOfflineLoginData?.company?.[0]) {
				logout();
				return;
			}

			setEmployeeData(responseOfflineLoginData.employee[0]);
			setCompanyData(responseOfflineLoginData.company[0]);
			setRosterData(responseOfflineLoginData.roster[0]);
			setEquipmentsData(responseOfflineLoginData.equipments);
			setProjectData(responseOfflineLoginData.project[0]);
			setShiftData(responseOfflineLoginData.shift[0]);

			if (isRunLocal) {
				setIsLoggedIn(true);
				setIsLoading(false);
			}
		} catch (error) {
			console.error("Алдаа гарлаа set Refs To State:", error);
			logout();
		}
	};

	const resetStates = () => {
		setEmployeeData(null);
		setCompanyData(null);
		setRosterData(null);
		setEquipmentsData(null);
		setProjectData(null);
		setShiftData(null);
		handleReset();
		setSelectedState(null);
		setSelectedEquipmentCode(null);
		setSelectedEquipment(null);
		setInspectionDone(false);
		setDispId(null);
		setTrackCount(0);
	};

	const logout = async (type) => {
		try {
			setIsLoading(true); // Indicate that logout is in progress
			resetStates();

			await new Promise((resolve) => setTimeout(resolve, 0)); // Allow state updates

			const keys = [
				"L_access_token",
				"L_inspection_id",
				"L_selected_eq",
				// "L_map_type",
				"L_last_state_time",
				"L_last_state",
				"L_current_speed",
				"L_last_logged",
				"L_track_count"
			];

			await AsyncStorage.multiRemove(keys);

			setIsLoggedIn(false);
		} catch (error) {
			console.error("Error during logout:", error);
		} finally {
			setIsLoading(false); // Ensure loading state is reset
		}
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

	const checkLocationStatus = (currentLocation, prevStatus) => {
		const { latitude, longitude } = currentLocation;

		const distanceToSRC = haversine(latitude, longitude, locationSource?.SRC?.latitude, locationSource?.SRC?.longitude);
		const distanceToDST = haversine(latitude, longitude, locationSource?.DST?.latitude, locationSource?.DST?.longitude);

		// ✅ SRC шалгах
		if (distanceToSRC <= locationSource?.SRC?.radius * 0.8) {
			return "SRC_IN";
		} else if (distanceToSRC > locationSource?.SRC?.radius * 0.8 && distanceToSRC <= locationSource?.SRC?.radius) {
			return "MINOR";
		} else if (distanceToSRC > locationSource?.SRC?.radius && prevStatus === "SRC_IN") {
			return "SRC_OUT";
		}

		// ✅ DST шалгах
		if (distanceToDST <= locationSource?.DST?.radius * 0.8) {
			return "DST_IN";
		} else if (distanceToDST > locationSource?.DST?.radius && prevStatus === "DST_IN") {
			return "DST_OUT";
		}

		return prevStatus; // Хэрэв өөрчлөлтгүй бол өмнөх төлөвийг хадгална
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
				locationStatus,
				setLocationStatus,
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
				refShots,
				echoStateData,
				setEchoStateData,
				checkLocationStatus,
				locationSource,
				setLocationSource,
				checkLocationWithSpeed,
				mapType,
				setMapType,
				isTrack,
				setIsTrack,
				showLocationInfo,
				setShowLocationInfo,
				storedItems,
				trackCount,
				setTrackCount,
				tempLocations,
				setTempLocations,
				sendLocationStatus,
				setSendLocationStatus
			}}
		>
			{props.children}
		</MainContext.Provider>
	);
};

export default MainContext;
