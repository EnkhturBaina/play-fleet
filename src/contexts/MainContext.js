import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URL } from "../constant";
import * as Location from "expo-location";
import ReferenceResponse from "../temp_data/ReferenceResponse.json";
import { createTable, fetchLoginData } from "../helper/db";
import { createReferenceTables, dropTable, fetchReferencesData, saveReferencesWithClear } from "../helper/reference_db";
import { useNetworkStatus } from "./NetworkContext";
import { Dimensions } from "react-native";

const MainContext = React.createContext();
const width = Dimensions.get("screen").width;
const height = Dimensions.get("screen").height;

export const MainStore = (props) => {
	const { isConnected } = useNetworkStatus();

	/* GENERAL STATEs START */
	const [appIsReady, setAppIsReady] = useState(false);
	const [checkListDone, setCheckListDone] = useState(false);
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
		setIsLoading(true);
		checkLocation();
		// dropTable("employee");
		// dropTable("company");
		// dropTable("roster");
		// dropTable("shift");
		// dropTable("equipments");
		// dropTable("project");
		// dropTable("ref_location_types");
	}, []);

	const checkLocation = () => {
		//***** LOCATION мэдээлэл авах
		console.log("RUN check-Location");
		(async () => {
			try {
				let { status } = await Location.requestForegroundPermissionsAsync();
				setLocationStatus(status);
				if (status !== "granted") {
					setIsLoading(false);
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
						getReferencesService();
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
		console.log("RUN checkUserData");
		// logout();
		try {
			const mainCompanyId = await AsyncStorage.getItem("mainCompanyId");
			setMainCompanyId(mainCompanyId);

			const accessToken = await AsyncStorage.getItem("access_token");
			console.log("access_token", accessToken);

			if (accessToken != null) {
				const responseOfflineLoginData = await fetchLoginData();
				console.log("Fetched Login Data:", responseOfflineLoginData);

				// Login response -с state үүд салгаж хадгалах
				setEmployeeData(responseOfflineLoginData.employee[0]);
				setCompanyData(responseOfflineLoginData.company[0]);
				setRosterData(responseOfflineLoginData.roster[0]);
				setEquipmentsData(responseOfflineLoginData.equipments);
				setProjectData(responseOfflineLoginData.project[0]);
				setShiftData(responseOfflineLoginData.shift[0]);
				setIsLoggedIn(true);
			}
		} catch (error) {
			console.error("Алдаа гарлаа: ", error);
		} finally {
			setIsLoading(false);
			setAppIsReady(true);
		}
	};

	const getReferencesService = async () => {
		console.log("RUN get-References-Service");

		try {
			const response = {
				data: ReferenceResponse,
				status: 200,
				statusText: "OK",
				headers: {},
				config: {},
				request: {}
			};
			// console.log("response", JSON.stringify(response.data?.Extra));

			//Local storage руу access_token хадгалах
			if (response?.status == 200) {
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
							ref_location_types: setRefLocationTypes
						});

						// Хэрэглэгчийн өгөгдлийг шалгах
						await checkUserData();
					}
				} catch (error) {
					console.error("Алдаа гарлаа:", error);
				}
			}
		} catch (error) {
			console.error("Error loading local JSON:", error);
		} finally {
			// state.setIsLoggedIn(true);
		}
	};

	// AsyncStorage.clear();
	const logout = async (type) => {
		//***** Profile -с гарах дарсан үед утасны LOCALSTORE -с user, user_bio устгах
		const keys = [
			// "local_notif",
			"access_token"
		];

		AsyncStorage.multiRemove(keys).then(() => {
			setIsLoading(false);
			setIsLoggedIn(false);
		});
	};
	const detectOrientation = () => {
		setOrientation(width > height ? "LANDSCAPE" : "PORTRAIT");
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
				checkListDone,
				setCheckListDone,
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
				setProjectData
			}}
		>
			{props.children}
		</MainContext.Provider>
	);
};

export default MainContext;
