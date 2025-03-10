import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URL } from "../constant";
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
	const [orientation, setOrientation] = useState("PORTRAIT"); //LANDSCAPE, PORTRAIT
	const [selectedEquipment, setSelectedEquipment] = useState(null); //Сонгогдсон Төхөөрөмж
	const [selectedEquipmentCode, setSelectedEquipmentCode] = useState(null); //Сонгогдсон Төхөөрөмжийн КОД {0 - Truck},{1 - Loader},{? - Other}
	const [speed, setSpeed] = useState(null);
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
	const [locationHistory, setLocationHistory] = useState(null);
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
		const performAsyncTasks = async () => {
			if (isConnected) {
				await checkForUpdates(); // Интернэт холболттой бол Update шалгах
			} else {
				await checkLocation(); // Интернэтгүй бол local шалгах
			}
		};

		performAsyncTasks(); // Асинхрон функцыг дуудна
	}, []); // Empty dependency array for only running once (on mount)

	const checkLocationWithSpeed = async () => {
		console.log("RUN check Location With Speed");

		const { status } = await Location.requestForegroundPermissionsAsync();
		if (status !== "granted") {
			console.log("Permission to access location was denied");
			return;
		}

		try {
			const currentLocation = await Location.getCurrentPositionAsync({
				accuracy: Location.Accuracy.Balanced
			});
			setLocation(currentLocation);
			// console.log("Location response =>", currentLocation);

			const currentSpeed = Math.max(0, currentLocation?.coords?.speed || 0); // Сөрөг утга гарахаас сэргийлэх
			const speedKmH = (currentSpeed * 3.6).toFixed(2); // м/сек -> км/цаг

			setSpeed(speedKmH);

			// Байршил болон хурд амжилттай авсны дараа дараагийн функцээ дуудна
			await sendEquipmentLocation(currentLocation, currentSpeed);
		} catch (error) {
			console.error("Error getting location:", error);
		}
	};

	const sendEquipmentLocation = async (currentLocation, currentSpeed) => {
		console.log("RUN send EquipmentLocation", currentLocation, currentSpeed);
		if (currentLocation && currentSpeed != null) {
			await AsyncStorage.getItem("access_token").then(async (localToken) => {
				try {
					await axios
						.post(
							`${SERVER_URL}/mobile/progress/track/save`,
							{
								PMSEquipmentId: selectedEquipment?.id,
								Latitude: currentLocation?.coords?.latitude ? parseFloat(currentLocation?.coords?.latitude) : 0,
								Longitude: currentLocation?.coords?.longitude ? parseFloat(currentLocation?.coords?.longitude) : 0,
								Speed: currentSpeed,
								CurrentDate: dayjs().format("YYYY-MM-DD"),
								EventTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
							},
							{
								headers: {
									"Content-Type": "application/json",
									Authorization: `Bearer ${localToken}`
								}
							}
						)
						.then(function (response) {
							// console.log("send EQ Location response", JSON.stringify(response.data));
							console.log("send EQ Location response", JSON.stringify(response.data?.Msg));
							if (response.data?.Type == 0) {
								// setLocationHistory((prevItems) => [
								// 	...prevItems,
								// 	{
								// 		lat: parseFloat(currentLocation?.coords?.latitude),
								// 		long: parseFloat(currentLocation?.coords?.longitude),
								// 		speed: currentSpeed,
								// 		eventTime: dayjs().format("YYYY-MM-DD HH:mm:ss")
								// 	}
								// ]);
							} else {
							}
						})
						.catch(function (error) {
							console.log("error send EQ Location", error);
						});
				} catch (error) {
					console.log("CATCH send EQ Location", error);
				}
			});
		}
	};

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
	const checkLocation = async () => {
		//***** LOCATION мэдээлэл авах
		console.log("RUN check-Location");
		(async () => {
			try {
				let { status } = await Location.requestForegroundPermissionsAsync();
				setLocationStatus(status);
				if (status !== "granted") {
					// setIsLoggedIn(false);
					return;
				}

				try {
					let location = await Location.getCurrentPositionAsync({
						accuracy: Location.Accuracy.Balanced
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
						const data = await fetchReferencesData();

						// console.log("get SQLite reference DATA=>", data);
						// Бүх тохиргоог автоматаар хийх функц
						setRefsToState(data, true);
						// fetchReferencesData().then((e) => {
						// 	console.log("RESULT FETCH REF=> ", e);
						// 	checkUserData();
						// });
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
		try {
			const mainCompanyId = await AsyncStorage.getItem("mainCompanyId");
			setMainCompanyId(mainCompanyId);

			const accessToken = await AsyncStorage.getItem("access_token");
			// console.log("access_token", accessToken);

			if (accessToken != null) {
				setToken(accessToken);
				const responseOfflineLoginData = await fetchLoginData();
				// console.log("Fetched Login Data local:", responseOfflineLoginData);

				if (!responseOfflineLoginData.employee[0]) {
					logout();
				}
				// Login response -с state үүд салгаж хадгалах
				setEmployeeData(responseOfflineLoginData?.employee[0]);
				setCompanyData(responseOfflineLoginData?.company[0]);
				setRosterData(responseOfflineLoginData?.roster[0]);
				setEquipmentsData(responseOfflineLoginData?.equipments);
				setProjectData(responseOfflineLoginData?.project[0]);
				setShiftData(responseOfflineLoginData?.shift[0]);

				if (responseOfflineLoginData?.company[0]?.id) {
					getReferencesService(responseOfflineLoginData?.company[0]?.id, accessToken, true);
				}
			} else {
				setIsLoggedIn(false);
				setIsLoading(false);
			}
		} catch (error) {
			console.error("Алдаа гарлаа checkUserData: ", error);
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
								// console.log("STATE get ReferencesData", result);

								if (result === "DONE_INSERT") {
									const data = await fetchReferencesData();

									// console.log("get SQLite reference DATA=>", data);
									// Бүх тохиргоог автоматаар хийх функц
									setRefsToState(data, isRunLocal);
								}
							} catch (error) {
								console.error("Алдаа гарлаа get ReferencesService:", error);
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

	const setRefsToState = async (data, isRunLocal) => {
		console.log("RUN set Refs To State");

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
		// console.log("isRunLocal", isRunLocal);
		const responseOfflineLoginData = await fetchLoginData();
		// console.log("Fetched Login Data local:", responseOfflineLoginData);

		if (!responseOfflineLoginData.employee[0]) {
			logout();
		}
		// Login response -с state үүд салгаж хадгалах
		setEmployeeData(responseOfflineLoginData?.employee[0]);
		setCompanyData(responseOfflineLoginData?.company[0]);
		setRosterData(responseOfflineLoginData?.roster[0]);
		setEquipmentsData(responseOfflineLoginData?.equipments);
		setProjectData(responseOfflineLoginData?.project[0]);
		setShiftData(responseOfflineLoginData?.shift[0]);

		if (isRunLocal) {
			setIsLoggedIn(true);
			setIsLoading(false);
		}
	};
	// AsyncStorage.clear();
	const logout = async (type) => {
		//***** Profile -с гарах дарсан үед утасны LOCALSTORE -с user, user_bio устгах
		const keys = [
			// "local_notif",
			"access_token",
			"inspectionId",
			"selected_eq",
			"inspectionId"
		];

		AsyncStorage.multiRemove(keys).then(() => {
			handleReset();
			setSelectedState(null);
			setSelectedEquipmentCode(null);
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
				refShots,
				echoStateData,
				setEchoStateData,
				speed,
				checkLocationStatus,
				locationSource,
				setLocationSource,
				checkLocationWithSpeed
			}}
		>
			{props.children}
		</MainContext.Provider>
	);
};

export default MainContext;
