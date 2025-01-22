import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URL } from "../constant";
import * as Location from "expo-location";
import { Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import ReferenceResponse from "../temp_data/ReferenceResponse.json";
import { createTable } from "../helper/db";
import { createReferenceTables, saveReferencesWithClear } from "../helper/reference_db";

const MainContext = React.createContext();

export const MainStore = (props) => {
	const [appIsReady, setAppIsReady] = useState(false);

	const [dispId, setDispId] = useState(""); //*****Dispatcher ID

	const [checkListDone, setCheckListDone] = useState(false);
	const [userId, setUserId] = useState(""); //*****Нэвтэрсэн хэрэглэгчийн USER_ID
	const [companyId, setCompanyId] = useState(""); //*****Нэвтэрсэн хэрэглэгчийн COMPANY_ID
	const [isLoggedIn, setIsLoggedIn] = useState(false); //*****Нэвтэрсэн эсэх
	const [email, setEmail] = useState(""); //*****Утасны дугаар
	const [password, setPassword] = useState("");
	const [token, setToken] = useState(""); //*****Хэрэглэгчийн TOKEN
	const [userData, setUserData] = useState(""); //*****Хэрэглэгчийн мэдээлэл
	const [isLoading, setIsLoading] = useState(true); //*****Апп ачааллах эсэх

	const [location, setLocation] = useState(null); //*****Location мэдээлэл хадгалах
	const [locationErrorCode, setLocationErrorCode] = useState(null); //*****Location error type

	const [headerUserName, setHeaderUserName] = useState(""); //*****Дээр харагдах хэрэглэгчийн нэр

	const [locationStatus, setLocationStatus] = useState(""); //*****Location Permission

	const [seconds, setSeconds] = useState(0);
	const [isActiveTimer, setIsActiveTimer] = useState(false);

	const [employeeData, setEmployeeData] = useState(null);
	const [companyData, setCompanyData] = useState(null);
	const [rosterData, setRosterData] = useState(null);
	const [equipmentsData, setEquipmentsData] = useState(null);

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
		console.log("RUN FIRST");
		checkLocation();
	}, []);

	const createSQLTables = async () => {
		console.log("create SQL Tables STATE");

		result = await createTable().then(async (e) => {
			await createReferenceTables().then(async (e) => {
				getReferences();
			});
		});
	};

	const checkLocation = () => {
		//***** LOCATION мэдээлэл авах
		console.log("RUN checkLocation");
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			setLocationStatus(status);
			if (status !== "granted") {
				setIsLoading(false);
				setAppIsReady(true);
				// setIsLoggedIn(false);
				return;
			}

			let location = await Location.getCurrentPositionAsync({
				maximumAge: 10000,
				timeout: 5000,
				accuracy: Platform.OS === "android" ? Location.Accuracy.Low : Location.Accuracy.Lowest
			});
			// console.log("location", location);

			setLocation(location);
		})().then((e) => {
			createSQLTables();
		});
	};

	//*****Апп ажиллахад утасны local storage -с мэдээлэл шалгах
	const checkUserData = async () => {
		console.log("RUN checkUserData");
		setIsLoggedIn(false);
		setIsLoading(false);
		setAppIsReady(true);
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

	const getReferences = async () => {
		console.log("RUN getReferences");

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
				saveReferencesWithClear(response.data?.Extra, true).then((e) => {
					console.log("STATE insert ReferencesData", e);
				});
				checkUserData();
			}
		} catch (error) {
			console.error("Error loading local JSON:", error);
		} finally {
			// state.setIsLoggedIn(true);
		}
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
				setEquipmentsData
			}}
		>
			{props.children}
		</MainContext.Provider>
	);
};

export default MainContext;
