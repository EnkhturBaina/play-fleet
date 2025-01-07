import React, { useEffect, useState, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Font from "expo-font";
import * as Notifications from "expo-notifications";
import axios from "axios";
import { ANDROID_VERSION, IOS_VERSION, SERVER_URL, WEEKDAYS } from "../constant";
import * as LocalAuthentication from "expo-local-authentication";
import * as Location from "expo-location";
import { v4 as uuidv4 } from "uuid";
import { Alert, Linking, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import Constants from "expo-constants";

const MainContext = React.createContext();

//*****Notification тохиргоо
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true, //*****апп нээлттэй үед notification харагдах эсэх
		shouldPlaySound: true,
		shouldSetBadge: true
	})
});

export const MainStore = (props) => {
	const navigation = useNavigation();
	const [appIsReady, setAppIsReady] = useState(false);

	const [mainCompanyId, setMainCompanyId] = useState(""); //*****Company ID
	const [dispId, setDispId] = useState(""); //*****Dispatcher ID

	const [checkListDone, setCheckListDone] = useState(false);
	const [userId, setUserId] = useState(""); //*****Нэвтэрсэн хэрэглэгчийн USER_ID
	const [companyId, setCompanyId] = useState(""); //*****Нэвтэрсэн хэрэглэгчийн COMPANY_ID
	const [uuid, setUuid] = useState(""); //*****UUID
	const [isLoggedIn, setIsLoggedIn] = useState(false); //*****Нэвтэрсэн эсэх
	const [email, setEmail] = useState(""); //*****Утасны дугаар
	const [password, setPassword] = useState("");
	const [token, setToken] = useState(""); //*****Хэрэглэгчийн TOKEN
	const [userData, setUserData] = useState(""); //*****Хэрэглэгчийн мэдээлэл
	const [isLoading, setIsLoading] = useState(true); //*****Апп ачааллах эсэх
	const [isUseBiometric, setIsUseBiometric] = useState(false); //*****Biometric тохиргоо хийх эсэх
	const [loginByBiometric, setLoginByBiometric] = useState(false); //*****Biometric тохиргоогоор нэвтрэх
	const [loginErrorMsg, setLoginErrorMsg] = useState(""); //*****Login хуудсанд харагдах алдааны MSG

	const [expoPushToken, setExpoPushToken] = useState(""); //*****EXPO PUSH NOTIFICATION TOKEN Хадгалах
	const [notification, setNotification] = useState(false); //*****Ирсэн Notification -ы мэдээлэл (OBJECT)

	const [location, setLocation] = useState(null); //*****Location мэдээлэл хадгалах
	const [locationErrorCode, setLocationErrorCode] = useState(null); //*****Location error type

	const [registeredInTime, setRegisteredInTime] = useState(null); //*****Нүүр хуудсанд ажилтны тухайн өдөр ажилдаа ирсэн цаг харуулах (Ажилтны ирцийн мэдээлэл татахад тооцоолж харуулах)
	const [registeredOutTime, setRegisteredOutTime] = useState(null); //*****Нүүр хуудсанд ажилтны тухайн өдөр ажлаас явсан цаг харуулах (Ажилтны ирцийн мэдээлэл татахад тооцоолж харуулах)

	const [dateByName, setDateByName] = useState(null); //*****Тухайн өдрийн нэр
	const [inTime, setInTime] = useState(null); //*****Тухайн ажилтны тухайн өдөр ажилдаа ирэх цаг
	const [outTime, setOutTime] = useState(null); //*****Тухайн ажилтны тухайн өдөр ажлаас явах цаг

	const [isSwitchOn, setIsSwitchOn] = useState(null); //*****Ирц бүртгэл сануулах эсэх (Profile хуудаснаас тохируулах)

	const [biometrics, setBiometrics] = useState(false);
	const [grantAccess, setGrantAccess] = useState(false);

	const [headerUserName, setHeaderUserName] = useState(""); //*****Дээр харагдах хэрэглэгчийн нэр

	const [locationStatus, setLocationStatus] = useState(""); //*****Location Permission

	const [seconds, setSeconds] = useState(0);
	const [isActiveTimer, setIsActiveTimer] = useState(false);

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

	const formatTime = (time) => {
		const hours = Math.floor(time / 3600);
		const minutes = Math.floor((time % 3600) / 60);
		const seconds = time % 60;
		return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
			.toString()
			.padStart(2, "0")}`;
	};

	const checkLocation = () => {
		//***** LOCATION мэдээлэл авах
		// console.log("RUN checkLocation");
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			setLocationStatus(status);
			if (status !== "granted") {
				//loc_permission_fix
				// setLoginErrorMsg(
				//   "Байршлын тохиргоо зөвшөөрөөгүй бол цаг бүртгэх боломжгүйг анхаарна уу."
				// );
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
			setLocation(location);
		})();
	};

	useEffect(() => {
		NetInfo.fetch().then((stateConn) => {
			// console.log("Connection type", stateConn);
			if (!stateConn.isConnected) {
				setLoginErrorMsg("Интернэт холболт шалгана уу? (3)");
				logout();
			}
		});

		checkLocation();
		checkUserData();
	}, []);

	//*****Апп ажиллахад утасны local storage -с мэдээлэл шалгах
	const checkUserData = async () => {
		// console.log("check UserData---------------------------------");
		try {
			getUserDataLocalStorage();
			setIsUseBiometric(false);
			setLoginByBiometric(false);
		} catch (error) {
			// error reading value
			// console.log("check UserData error======>", error);
			setLoginErrorMsg("Интернэт холболт шалгана уу? (5)");
			logout();
		}
	};

	//*****Апп ажиллахад утасны local storage -с зөвхөн хэрэглэгчийн мэдээлэл авах
	const getUserDataLocalStorage = async () => {
		// console.log("get UserDataLocalStorage---------------------------------");
		try {
			await AsyncStorage.getItem("user").then(async (user_value) => {
				// console.log("user_value VALUE ====>", user_value);
				if (user_value != null) {
					// Local Storage -д хэрэглэгчийн мэдээлэл байвал
					const JSONValue = JSON.parse(user_value);
					// console.log("USER VALUE ====>", JSONValue);

					setToken(JSONValue.token);
					setHeaderUserName(JSONValue.userFirstName);
					setUserId(JSONValue.user?.id);
					setCompanyId(JSONValue.user?.GMCompanyId);
					setUserData(JSONValue.user);
				} else {
					setIsLoggedIn(false);
					setIsLoading(false);
					setAppIsReady(true);
				}
			});
		} catch (error) {
			// console.log("Err get UserDataLocalStorage", error);
			setLoginErrorMsg("Интернэт холболт шалгана уу? (6)");
			logout();
		}
	};

	//*****BIOMETRIC тохиргоогоор нэвтрэх
	const confirmBio = (uuid_value) => {
		// console.log("confirm Bio");
		(async () => {
			//*****face || fingerprint дэмждэг эсэх
			const compatible = await LocalAuthentication.hasHardwareAsync();
			// console.log("compatible", compatible);
			setBiometrics(compatible);
			//*****face || fingerprint байгаа эсэх
			LocalAuthentication.isEnrolledAsync().then((hasFingerprintOrFacialData) => {
				if (!hasFingerprintOrFacialData) {
					getUserDataLocalStorage(uuid_value);
				} else {
					compatible
						? (async () => {
								//*****face || fingerprint уншуулсан эсэх
								const auth = await LocalAuthentication.authenticateAsync();
								// console.log("auth", auth);
								if (auth.success) {
									setGrantAccess(true);
									getUserDataLocalStorage(uuid_value);
								} else {
									setIsLoading(false);
									setAppIsReady(true);
									setGrantAccess(false);
								}
						  })()
						: () => {
								getUserDataLocalStorage(uuid_value);
						  };
				}
			});
		})();
	};

	// AsyncStorage.clear();
	const logout = async (type) => {
		AsyncStorage.getItem("password").then(async (value) => {
			setPassword(value);
		});
		//***** Profile -с гарах дарсан үед утасны LOCALSTORE -с user, user_bio устгах
		const keys = [
			// "local_notif",
			"use_bio",
			"user"
		];
		//***** Зөвхөн Profile -с гарах дарах үед Ирц сануулах тохиргоо FALSE
		// if (type && type == "is_hand") {
		//   setIsSwitchOn(false);
		// }

		AsyncStorage.multiRemove(keys).then(() => {
			setIsUseBiometric(false);
			setLoginByBiometric(false);
			setIsLoading(false);
			setIsLoggedIn(false);
		});
	};

	const addCommas = (num) => {
		return num?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	};
	const removeNonNumeric = (num) => {
		if (num?.toString().charAt(0) === "0") {
			num = num?.toString()?.substring(1);
		}
		if (num?.toString()?.replace(/[^0-9]/g, "") > 500000000) {
			num = num?.slice(0, -1);
		}
		return num?.toString()?.replace(/[^0-9]/g, "");
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
				uuid,
				logout,
				isUseBiometric,
				setIsUseBiometric,
				loginErrorMsg,
				setLoginErrorMsg,
				loginByBiometric,
				getUserDataLocalStorage,
				expoPushToken,
				location,
				setLocation,
				registeredInTime,
				registeredOutTime,
				setRegisteredInTime,
				setRegisteredOutTime,
				isSwitchOn,
				setIsSwitchOn,
				dateByName,
				inTime,
				outTime,
				confirmBio,
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
				mainCompanyId,
				setMainCompanyId,
				dispId,
				setDispId,
				seconds,
				setSeconds,
				handleStart,
				handleReset,
				handlePause,
				formatTime,
				isActiveTimer,
				setIsActiveTimer,
				removeNonNumeric,
				addCommas,
				appIsReady,
				setAppIsReady
			}}
		>
			{props.children}
		</MainContext.Provider>
	);
};

export default MainContext;
