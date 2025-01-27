import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URL } from "../constant";
import * as Location from "expo-location";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import ReferenceResponse from "../temp_data/ReferenceResponse.json";
import { createTable } from "../helper/db";
import { createReferenceTables, dropTable, fetchReferencesData, saveReferencesWithClear } from "../helper/reference_db";
import { useNetworkStatus } from "./NetworkContext";

const MainContext = React.createContext();

export const MainStore = (props) => {
	const { isConnected } = useNetworkStatus();

	/* GENERAL STATEs START */
	const [appIsReady, setAppIsReady] = useState(false);
	const [checkListDone, setCheckListDone] = useState(false);
	const [seconds, setSeconds] = useState(0);
	const [isActiveTimer, setIsActiveTimer] = useState(false);
	const [locationStatus, setLocationStatus] = useState(""); //*****Location Permission
	const [dispId, setDispId] = useState(""); //*****Dispatcher ID
	const [isLoading, setIsLoading] = useState(false); //*****Апп ачааллах эсэх
	const [location, setLocation] = useState(null); //*****Location мэдээлэл хадгалах
	const [locationErrorCode, setLocationErrorCode] = useState(null); //*****Location error type
	const [headerUserName, setHeaderUserName] = useState(""); //*****Дээр харагдах хэрэглэгчийн нэр
	/* GENERAL STATEs END */

	/* LOGIN STATEs START */
	const [employeeData, setEmployeeData] = useState(null);
	const [companyData, setCompanyData] = useState(null);
	const [rosterData, setRosterData] = useState(null);
	const [equipmentsData, setEquipmentsData] = useState(null);
	const [userId, setUserId] = useState(""); //*****Нэвтэрсэн хэрэглэгчийн USER_ID
	const [companyId, setCompanyId] = useState(""); //*****Нэвтэрсэн хэрэглэгчийн COMPANY_ID
	const [isLoggedIn, setIsLoggedIn] = useState(false); //*****Нэвтэрсэн эсэх
	const [email, setEmail] = useState(""); //*****Утасны дугаар
	const [password, setPassword] = useState("");
	const [token, setToken] = useState(""); //*****Хэрэглэгчийн TOKEN
	const [userData, setUserData] = useState(""); //*****Хэрэглэгчийн мэдээлэл
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
		// dropTable("ref_state_groups");
		// dropTable("ref_location_types");
	}, []);

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

	//*****Апп ажиллахад утасны local storage -с мэдээлэл шалгах
	const checkUserData = async () => {
		console.log("RUN checkUserData");
		setIsLoggedIn(false);
		setIsLoading(false);
		setAppIsReady(true);
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
				await saveReferencesWithClear(response.data?.Extra, true).then(async (e) => {
					console.log("STATE get ReferencesData", e);
					if (e !== "DONE_INSERT") {
					} else if (e === "DONE_INSERT") {
						await fetchReferencesData().then((e) => {
							e.ref_states ? setRefStates(e.ref_states) : [];
							e.ref_locations ? setRefLocations(e.ref_locations) : [];
							e.ref_movements ? setRefMovements(e.ref_movements) : [];
							e.ref_operators ? setRefOperators(e.ref_operators) : [];
							e.ref_materials ? setRefMaterials(e.ref_materials) : [];
							e.ref_state_groups ? setRefStateGroups(e.ref_state_groups) : [];
							e.ref_location_types ? setRefLocationTypes(e.ref_location_types) : [];

							// console.log("RESULT FETCH REF=> ", e.ref_state_groups);
							checkUserData();
						});
					} else {
					}
				});
			}
		} catch (error) {
			console.error("Error loading local JSON:", error);
		} finally {
			// state.setIsLoggedIn(true);
		}
	};

	// AsyncStorage.clear();
	const logout = async (type) => {
		AsyncStorage.getItem("password").then(async (value) => {
			setPassword(value);
		});
		//***** Profile -с гарах дарсан үед утасны LOCALSTORE -с user, user_bio устгах
		const keys = [
			// "local_notif",
			"user"
		];

		AsyncStorage.multiRemove(keys).then(() => {
			setIsLoading(false);
			setIsLoggedIn(false);
		});
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
				refLocationTypes
			}}
		>
			{props.children}
		</MainContext.Provider>
	);
};

export default MainContext;
