import {
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	ScrollView,
	KeyboardAvoidingView,
	Platform,
	ActivityIndicator,
	FlatList,
	TextInput
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { Icon, CheckBox, Button } from "@rneui/themed";
import MainContext from "../contexts/MainContext";
import CustomSnackbar from "../components/CustomSnackbar";
import {
	MAIN_COLOR,
	MAIN_BORDER_RADIUS,
	SERVER_URL,
	MAIN_INPUT_HEIGHT,
	MAIN_BUTTON_HEIGHT,
	MAIN_COLOR_GRAY,
	MAIN_COLOR_RED
} from "../constant";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import LoginCompanyDialog from "../components/LoginCompanyDialog";
import { Image } from "expo-image";
// import { v4 as uuidv4 } from "uuid";

const LoginScreen = (props) => {
	const state = useContext(MainContext);

	const [visibleSnack, setVisibleSnack] = useState(false);
	const [snackBarMsg, setSnackBarMsg] = useState("");

	const [loadingAction, setLoadingAction] = useState(false);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogType, setDialogType] = useState("success"); //Dialog харуулах төрөл
	const [dialogText, setDialogText] = useState("Та итгэлтэй байна уу?"); //Dialog харуулах text

	useEffect(() => {
		(async () => {
			await AsyncStorage.getItem("password").then(async (value) => {
				state.setPassword(value);
			});
		})();
	}, []);

	//Snacbkbar харуулах
	const onToggleSnackBar = (msg) => {
		setVisibleSnack(!visibleSnack);
		setSnackBarMsg(msg);
	};

	//Snacbkbar хаах
	const onDismissSnackBar = () => setVisibleSnack(false);

	const login = async () => {
		state.setIsLoggedIn(true);
		// if (state.email == "") {
		// 	onToggleSnackBar("И-мэйл хаягаа оруулна уу.");
		// } else if (!regex_email.test(state.email)) {
		// 	onToggleSnackBar("И-мэйл хаягаа зөв оруулна уу.");
		// } else if (state.password == "") {
		// 	onToggleSnackBar("Нууц үг оруулна уу.");
		// }
		//loc_permission_fix
		// else if (state.locationStatus == "denied") {
		//   onToggleSnackBar("Байршлын тохиргоо зөвшөөрөгдөөгүй байна.");
		//   (async () => {
		//     let { status } = await Location.requestForegroundPermissionsAsync();
		//     state.setLocationStatus(status);
		//     // console.log("status", status);
		//     if (status !== "granted") {
		//       let { status } = await Location.requestForegroundPermissionsAsync();
		//       state.setLocationStatus(status);

		//       state.setLoginErrorMsg("Байршлын тохиргоо зөвшөөрөгдөөгүй байна.");
		//       state.setIsLoading(false);
		//       state.setIsLoggedIn(false);
		//       return;
		//     }
		//   })();
		//   setLoadingAction(false);
		// }
		// else {
		// setLoadingAction(true);
		// state.setIsLoading(true);
		// await axios({
		// 	method: "post",
		// 	url: `${SERVER_URL}/employee/mobile/login`,
		// 	data: {
		// 		email: state.email?.toLowerCase(),
		// 		password: state.password,
		// 		MobileUUID: state.uuid,
		// 		ExponentPushToken: state.expoPushToken
		// 	}
		// })
		// 	.then(async (response) => {
		// 		// console.log("RES", response.data);
		// 		if (response.data?.Type == 0) {
		// 			try {
		// 				state.setUserData(response.data.Extra?.user);
		// 				state.setToken(response.data.Extra?.access_token);
		// 				state.setHeaderUserName(response.data.Extra?.user.FirstName);
		// 				state.setUserId(response.data.Extra?.user?.id);
		// 				state.setCompanyId(response.data.Extra?.user?.GMCompanyId);
		// 				await AsyncStorage.setItem("password", state.password).then(async (value) => {
		// 					await AsyncStorage.setItem("user_mail", response.data.Extra?.user?.email).then(async (value) => {
		// 						//*****Login Хийсэн User -н Data -г Local Storage -д хадгалах
		// 						await AsyncStorage.setItem(
		// 							"user",
		// 							JSON.stringify({
		// 								token: response.data.Extra?.access_token,
		// 								user: response.data.Extra?.user,
		// 								userFirstName: response.data.Extra?.user.FirstName
		// 							})
		// 						).then(async (value) => {
		// 							if (state.isUseBiometric) {
		// 								//*****Biometric ашиглах CHECK хийгдсэн үед Local Storage -д хадгалах
		// 								await AsyncStorage.setItem("use_bio", "yes").then((value) => {
		// 									state.confirmBio(state.uuid);
		// 								});
		// 							} else {
		// 								//*****Biometric ашиглах CHECK хийгдээгүй үед Local Storage -д хадгалах
		// 								await AsyncStorage.setItem("use_bio", "no").then((value) => {
		// 									state.getUserUUID(
		// 										response.data.Extra?.user.email,
		// 										response.data.Extra?.access_token,
		// 										state.uuid,
		// 										response.data.Extra?.user?.id
		// 									);
		// 								});
		// 							}
		// 						});
		// 					});
		// 				});
		// 			} catch (e) {
		// 				console.log("e====>", e);
		// 			}
		// 			state.setLoginErrorMsg("");
		// 		} else if (response.data?.Type == 1) {
		// 			state.setLoginErrorMsg(response.data.Msg);
		// 			state.setIsLoading(false);
		// 		} else if (response.data?.Type == 2) {
		// 			state.setLoginErrorMsg(response.data.Msg);
		// 			state.setIsLoading(false);
		// 		}
		// 		setLoadingAction(false);
		// 	})
		// 	.catch(function (error) {
		// 		setLoadingAction(false);
		// 		state.setIsLoading(false);
		// 		if (error.code === "ERR_NETWORK") {
		// 			state.setLoginErrorMsg("Интернэт холболтоо шалгана уу.");
		// 		} else {
		// 			state.setLoginErrorMsg("Холболт салсан байна...");
		// 		}
		// 		state.logout();
		// 	});
		// }
	};

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS == "ios" ? "padding" : ""}
			style={{
				flex: 1,
				flexDirection: "column"
			}}
		>
			<ScrollView
				contentContainerStyle={styles.container}
				bounces={false}
				showsVerticalScrollIndicator={false}
				nestedScrollEnabled
			>
				<CustomSnackbar visible={visibleSnack} dismiss={onDismissSnackBar} text={snackBarMsg} topPos={30} />

				<TouchableOpacity
					style={styles.loginImageContainer}
					onLongPress={() => {
						console.log("LONG PRESS");
						setVisibleDialog(true);
					}}
					delayLongPress={500}
					activeOpacity={1}
				>
					<Image style={styles.loginImg} source={require("../../assets/mainLogo.png")} contentFit="contain" />
				</TouchableOpacity>
				{state.loginErrorMsg != "" ? (
					<Text
						style={{
							fontWeight: "bold",
							color: "red",
							textAlign: "center",
							marginHorizontal: 20
						}}
					>
						{state.loginErrorMsg}
					</Text>
				) : null}
				<View
					style={{
						width: "80%",
						flexDirection: "row",
						justifyContent: "space-evenly",
						alignItems: "center",
						alignSelf: "center"
					}}
				>
					<TextInput label="Диспетчер ID" style={styles.generalInput} value={state.dispId} editable={false} />
					<TouchableOpacity
						style={{
							height: 50,
							width: 50,
							justifyContent: "center",
							borderRadius: MAIN_BORDER_RADIUS
						}}
						onPress={() => {
							state.setDispId((prevText) => prevText.slice(0, prevText.length - 1));
						}}
					>
						<Icon name="backspace-outline" type="ionicon" size={30} />
					</TouchableOpacity>
				</View>
				<FlatList
					nestedScrollEnabled
					bounces={false}
					columnWrapperStyle={{
						justifyContent: "space-evenly"
					}}
					contentContainerStyle={{
						marginVertical: 5,
						width: "100%"
					}}
					data={[1, 2, 3, 4, 5, 6, 7, 8, 9, "x", 0, "login"]}
					renderItem={({ item }) => {
						if (item == "x") {
							return (
								<TouchableOpacity style={styles.numbers} onPress={() => state.setDispId("")}>
									<Icon name="x" type="feather" size={30} color={MAIN_COLOR_RED} />
								</TouchableOpacity>
							);
						}
						if (item == "login") {
							return (
								<TouchableOpacity style={styles.numbers} onPress={() => login()}>
									<Icon name="arrow-right" type="feather" size={30} color={MAIN_COLOR} />
								</TouchableOpacity>
							);
						}
						return (
							<TouchableOpacity style={styles.numbers} onPress={() => state.setDispId(state.dispId + item)}>
								<Text
									style={{
										color: "#000",
										fontSize: 24,
										fontWeight: "500"
									}}
								>
									{item}
								</Text>
							</TouchableOpacity>
						);
					}}
					numColumns={3}
					keyExtractor={(item, index) => index}
				/>
				<View style={styles.stackSection3}>
					<Button
						disabled={loadingAction}
						containerStyle={{
							width: "100%",
							marginTop: 10,
							height: 50
						}}
						buttonStyle={{
							backgroundColor: MAIN_COLOR,
							borderRadius: MAIN_BORDER_RADIUS,
							paddingVertical: 10,
							height: MAIN_BUTTON_HEIGHT
						}}
						title={
							<>
								<Text
									style={{
										fontSize: 16,
										color: "#fff",
										fontWeight: "bold"
									}}
								>
									Нэвтрэх
								</Text>
								{loadingAction ? <ActivityIndicator style={{ marginLeft: 5 }} color="#fff" /> : null}
							</>
						}
						titleStyle={{
							fontSize: 16,
							fontWeight: "bold"
						}}
						onPress={() => login()}
					/>
				</View>

				<LoginCompanyDialog
					visible={visibleDialog}
					confirmFunction={() => {
						setVisibleDialog(false);
					}}
					declineFunction={() => {
						setVisibleDialog(false);
					}}
					text={dialogText}
					confirmBtnText="Хадгалах"
					DeclineBtnText="Хаах"
					type={dialogType}
				/>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

export default LoginScreen;

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: "#fff",
		justifyContent: "center"
	},
	loginImageContainer: {
		height: 350,
		alignItems: "center"
	},
	stackSection: {
		width: "100%",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center"
	},
	loginImg: {
		width: 180,
		height: 150,
		marginTop: "30%"
	},
	generalInput: {
		width: "80%",
		// height: 40,
		backgroundColor: "#fff",
		padding: 0,
		height: MAIN_INPUT_HEIGHT,
		fontSize: 18,
		textAlign: "center",
		borderWidth: 1,
		borderRadius: MAIN_BORDER_RADIUS,
		borderColor: MAIN_COLOR
	},
	stackSection2: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 10,
		width: "80%",
		marginRight: "auto",
		marginLeft: "auto"
	},
	stackSection3: {
		width: "80%",
		alignItems: "center",
		marginRight: "auto",
		marginLeft: "auto"
	},
	imageStyle: {
		position: "absolute",
		zIndex: 999,
		right: "15%",
		top: "45%"
	},
	customCheckBox: {
		padding: 0,
		margin: 0,
		marginLeft: 0,
		alignItems: "center"
	},
	numbers: {
		flexDirection: "column",
		margin: 4,
		width: "25%",
		height: 60,
		backgroundColor: MAIN_COLOR_GRAY,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: MAIN_BORDER_RADIUS
	}
});
