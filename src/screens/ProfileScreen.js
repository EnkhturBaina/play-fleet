import {
	ActivityIndicator,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StatusBar,
	StyleSheet,
	Text,
	TouchableOpacity,
	View
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Constants from "expo-constants";
import HeaderUser from "../components/HeaderUser";
import { Avatar, Button, Icon } from "@rneui/base";
import * as ImagePicker from "expo-image-picker";
import { MAIN_BORDER_RADIUS, MAIN_BUTTON_HEIGHT, MAIN_COLOR, SERVER_URL } from "../constant";
import LoanInput from "../components/LoanInput";
import MainContext from "../contexts/MainContext";
import axios from "axios";
import CustomDialog from "../components/CustomDialog";
import Loader from "../components/Loader";
import { clearEmployeeTable, fetchEmployeeData, insertEmployeeData } from "../helper/db";
import CustomSnackbar from "../components/CustomSnackbar";

const ProfileScreen = (props) => {
	const state = useContext(MainContext);

	const [image, setImage] = useState(null);
	const [loading, setLoading] = useState(false);
	const [loadingAction, setLoadingAction] = useState(false);
	const [editableData, setEditableData] = useState({
		Code: "",
		FirstName: "",
		LastName: "",
		Shift: "",
		Company: "",
		PMSRosterId: "",
		Email: ""
	});

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogType, setDialogType] = useState("warning"); //Dialog харуулах төрөл
	const [dialogText, setDialogText] = useState(""); //Dialog -н текст

	const [visibleSnack, setVisibleSnack] = useState(false);
	const [snackBarMsg, setSnackBarMsg] = useState("");
	//Snacbkbar харуулах
	const onToggleSnackBar = (msg) => {
		setVisibleSnack(!visibleSnack);
		setSnackBarMsg(msg);
	};

	//Snacbkbar хаах
	const onDismissSnackBar = () => setVisibleSnack(false);

	useEffect(() => {
		console.log("xxx", state.companyData);

		setLoading(true);
		setEditableData((prevState) => ({
			...prevState,
			Code: state.employeeData?.Code,
			LastName: state.employeeData?.LastName,
			FirstName: state.employeeData?.FirstName,
			Shift: state.shiftData?.Name,
			Company: state.companyData?.Name,
			PMSRosterId: state.rosterData?.id,
			Email: state.employeeData?.Email
		}));
		setLoading(false);
	}, []);

	const pickImage = async () => {
		// No permissions request is necessary for launching the image library
		let result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [4, 3],
			quality: 1
		});

		console.log(result);
		if (!result.canceled) {
			setImage(result.assets[0].uri);
		}
	};
	const saveProfileData = async () => {
		if (!editableData.LastName) {
			onToggleSnackBar("Овог оруулна уу.");
		} else if (!editableData.FirstName) {
			onToggleSnackBar("Нэр оруулна уу.");
		} else if (!editableData.Email) {
			onToggleSnackBar("И-мэйл оруулна уу.");
		} else {
			setLoadingAction(true);

			const formData = new FormData();
			if (image) {
				const fileName = image.split("/").pop();
				const fileType = fileName.split(".").pop();
				formData.append(
					"Profile",
					image
						? {
								uri: image,
								name: fileName,
								type: `image/${fileType}`
						  }
						: null
				);
			}

			formData.append("id", state.employeeData?.id);
			formData.append("FirstName", editableData.FirstName);
			formData.append("LastName", editableData.LastName);
			formData.append("PMSRosterId", editableData.PMSRosterId);
			formData.append("Email", editableData.Email);

			await axios({
				method: "post",
				url: `${SERVER_URL}/mobile/profile/save`,
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${state.token}`
				},
				data: formData
			})
				.then(async (response) => {
					console.log("save ProfileData======>", response.data);
					if (response.data?.Type == 0) {
						// SQLite -д хадгалагдсан байгаа дата авах
						const responseLocalEmployeeData = await fetchEmployeeData();
						const tempEmployeeData = responseLocalEmployeeData[0];

						// SQLite -д хадгалагдсан байгаа датаг амжилттай хадгалагдсан мэдээллээр шинэчлэх
						tempEmployeeData.LastName = response.data.Extra?.LastName;
						tempEmployeeData.FirstName = response.data.Extra?.FirstName;
						tempEmployeeData.Email = response.data.Extra?.Email;
						tempEmployeeData.Profile = response.data.Extra?.Profile;

						try {
							// ⚡ Employee table цэвэрлэх
							await clearEmployeeTable();
							console.log("✅ Employee table амжилттай цэвэрлэгдлээ.");

							// 🆕 Employee өгөгдөл шинээр хадгалах
							await insertEmployeeData(tempEmployeeData);

							state.setEmployeeData(tempEmployeeData);
							console.log("✅ Employee өгөгдөл амжилттай нэмэгдлээ.");
						} catch (error) {
							console.error("❌ Employee өгөгдөл шинэчлэхэд алдаа гарлаа:", error);
						}

						setDialogType("success");
					} else if (response.data?.Type == 1) {
						setDialogType("warning");
					} else if (response.data?.Type == 2) {
					}
					setVisibleDialog(true);
					setDialogText(response.data.Msg);
					setLoading(false);
					setLoadingAction(false);
				})
				.catch(function (error) {
					setLoading(false);
					setLoadingAction(false);
					if (error.code === "ERR_NETWORK") {
						state.setLoginErrorMsg("Интернэт холболт шалгана уу? edit(2)");
					} else {
						state.setLoginErrorMsg("Холболт салсан байна. Та дахин нэвтэрнэ үү. save");
					}
					state.logout();
				});
		}
	};
	return (
		<KeyboardAvoidingView
			behavior={Platform.OS == "ios" ? "padding" : ""}
			style={{
				flex: 1,
				flexDirection: "column"
			}}
		>
			<View
				style={{
					flex: 1,
					paddingTop: Constants.statusBarHeight,
					backgroundColor: "#fff",
					paddingBottom: 20
				}}
			>
				<CustomSnackbar
					visible={visibleSnack}
					dismiss={onDismissSnackBar}
					text={snackBarMsg}
					topPos={Constants.statusBarHeight}
				/>
				<StatusBar translucent barStyle={Platform.OS == "ios" ? "dark-content" : "default"} />
				{/* <HeaderUser isShowNotif={true} /> */}
				<TouchableOpacity
					onPress={() => {
						props.navigation.goBack();
					}}
					style={styles.backBtnContainer}
					activeOpacity={0.8}
				>
					<Icon name="chevron-left" type="feather" size={25} color="#fff" />
					<Text style={{ color: "#fff", fontSize: 18, marginLeft: 10 }}>Профайл</Text>
				</TouchableOpacity>
				{loading ? (
					<Loader />
				) : (
					<View style={{ flex: 1 }}>
						<ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
							<TouchableOpacity
								activeOpacity={0.9}
								onPress={() => pickImage()}
								style={{ alignItems: "center", marginVertical: 20 }}
							>
								<Avatar
									size={100}
									rounded
									source={
										image
											? { uri: image }
											: state.employeeData.Profile
											? { uri: state.employeeData.Profile }
											: require("../../assets/avatar.png")
									}
									title="Bj"
									containerStyle={{ backgroundColor: "grey" }}
								>
									<Avatar.Accessory
										size={28}
										onPress={() => pickImage()}
										color="#fff"
										style={{ backgroundColor: MAIN_COLOR }}
									/>
								</Avatar>
							</TouchableOpacity>
							<LoanInput label="Код" value={editableData.Code} disabled />
							<LoanInput
								label="Овог"
								value={editableData.LastName}
								onChangeText={(e) =>
									setEditableData((prevState) => ({
										...prevState,
										LastName: e
									}))
								}
							/>
							<LoanInput
								label="Нэр"
								value={editableData.FirstName}
								onChangeText={(e) =>
									setEditableData((prevState) => ({
										...prevState,
										FirstName: e
									}))
								}
							/>
							<LoanInput label="Ээлж" value={editableData.Shift} disabled />
							<LoanInput label="Компани" value={editableData.Company} disabled />
							<LoanInput label="И-мэйл" value={editableData.Email} disabled />
							<Button
								disabled={loadingAction}
								containerStyle={{
									width: "100%",
									marginVertical: 10
								}}
								buttonStyle={styles.saveBtnStyle}
								title={
									<>
										<Text
											style={{
												fontSize: 16,
												color: "#fff",
												fontWeight: "600"
											}}
										>
											Хадгалах
										</Text>
										{loadingAction ? <ActivityIndicator style={{ marginLeft: 5 }} color="#fff" /> : null}
									</>
								}
								onPress={() => saveProfileData()}
							/>
						</ScrollView>
					</View>
				)}
				<CustomDialog
					visible={visibleDialog}
					confirmFunction={() => {
						setVisibleDialog(false);
						// dialogType == "success" && props.navigation.goBack();
					}}
					declineFunction={() => {}}
					text={dialogText}
					confirmBtnText="Хаах"
					DeclineBtnText=""
					type={dialogType}
				/>
			</View>
		</KeyboardAvoidingView>
	);
};

export default ProfileScreen;

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		backgroundColor: "#fff",
		paddingHorizontal: 20,
		paddingTop: 10
	},
	saveBtnStyle: {
		backgroundColor: MAIN_COLOR,
		borderRadius: MAIN_BORDER_RADIUS,
		paddingVertical: 10,
		height: MAIN_BUTTON_HEIGHT
	},
	backBtnContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#2C2E45",
		height: 50,
		paddingHorizontal: 10
	}
});
