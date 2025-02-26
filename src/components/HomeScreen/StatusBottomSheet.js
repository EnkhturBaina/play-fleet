import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useContext, useEffect, useRef, useState } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MainContext from "../../contexts/MainContext";
import { Image } from "expo-image";
import { MAIN_BORDER_RADIUS, MAIN_COLOR_BLUE, MAIN_COLOR_GRAY, MAIN_COLOR_GREEN, MAIN_COLOR } from "../../constant";
import { formatTime } from "../../helper/functions";
import CustomDialog from "../CustomDialog";
import { sendSelectedState } from "../../helper/apiService";

export default function (props) {
	const state = useContext(MainContext);
	const animatedValue = useRef(new Animated.Value(1)).current;
	const [stateParentId, setStateParentId] = useState(null);
	const [mainStates, setMainStates] = useState(null);

	const [visibleDialog, setVisibleDialog] = useState(false); //Dialog харуулах
	const [dialogText, setDialogText] = useState(null); //Dialog харуулах text
	const [onConfirm, setOnConfirm] = useState(null); // Дialog-ийн баталгаажуулалтын үйлдэл

	const ENABLE_NEXT_STATUS = 3; // SECOND

	const MAIN_STATE_CODES = ["Loading", "Hauling", "Dumping", "Traveling", "Queueing"];
	const IMAGE_LIST = [
		{
			code: "Loading",
			img: require("../../../assets/images/Picture4.png")
		},
		{
			code: "Hauling",
			img: require("../../../assets/images/Picture5.png")
		},
		{
			code: "Dumping",
			img: require("../../../assets/images/Picture7.png")
		},
		{
			code: "Traveling",
			img: require("../../../assets/images/Picture8.png")
		},
		{
			code: "Queueing",
			img: require("../../../assets/images/Picture9.png")
		}
	];

	useEffect(() => {
		if (state.seconds == ENABLE_NEXT_STATUS) {
			Animated.loop(
				Animated.sequence([
					Animated.timing(animatedValue, {
						toValue: 0.5,
						duration: 500,
						useNativeDriver: true
					}),
					Animated.timing(animatedValue, {
						toValue: 1,
						duration: 500,
						useNativeDriver: true
					})
				])
			).start();
		}
	}, [state.seconds]);

	useEffect(() => {
		if (stateParentId !== null) {
			const filteredData = state.refStates?.filter(
				(item) => item.PMSParentId === stateParentId && item.Type === state.selectedEquipmentCode && item.IsActive === 1
			);

			setMainStates(filteredData);
		}
	}, [stateParentId]);

	useEffect(() => {
		console.log("headerSelections", state.headerSelections);

		// 1. "W1" ActivityShort-той объектын ID-г авах
		const w1Item = state.refStates?.find((item) => item.ActivityShort === "W1");
		if (w1Item) {
			setStateParentId(w1Item.id);
		}
		if (!state.selectedState) {
			const filteredDefaultState = state.refStates?.filter(
				(item) => item.id === state.projectData?.PMSProgressStateId && item.IsActive === 1
			);
			// console.log("default assign from bottom", filteredDefaultState);

			if (filteredDefaultState[0]) {
				state.setSelectedState(filteredDefaultState[0]);
			}
		}
	}, []);

	const proceedWithStateChange = (selectedState) => {
		// console.log("proceed With State Change selectedState =>", selectedState);

		animatedValue.setValue(1);

		state.handleReset();
		state.handleStart();

		state.setSelectedState(selectedState);
	};

	const selectState = (selectedState) => {
		// Үндсэн W1 -н State -үүд мөн эсэх

		if (
			MAIN_STATE_CODES.includes(state.selectedState?.ActivityShort) &&
			MAIN_STATE_CODES.includes(selectedState?.ActivityShort)
		) {
			if (state.seconds == 0) {
				// 0. Operator төлөв тохируулсан үед ямар ч төлөврүү шууд орох
				// Энэ тохиолдол нь seconds == 0 Байх учир
				proceedWithStateChange(selectedState);
				return;
			}

			// 1. Хэрэв 30 секунд дотор сонгогдсон бол анхааруулга
			if (state.seconds < 3) {
				setDialogText(
					"Ажиллаж буй төлөвийн нэгж алхам дор хаяж 30 секунд үргэлжлэх шаардлагатай. Шууд дараагийн алхам руу шилжихдээ итгэлтэй байна уу?"
				);
				setOnConfirm(() => () => proceedWithStateChange(selectedState));
				setVisibleDialog(true);

				return;
			}
			// 2. Өмнөх төлөвийг сонгоход анхааруулга өгөх
			if (selectedState.ViewOrder < state.selectedState?.ViewOrder) {
				setDialogText("Одоогийн дэд төлөв тухайн рейст тооцогдохгүй болох тул итгэлтэй байна уу?");
				setOnConfirm(() => () => proceedWithStateChange(selectedState));
				setVisibleDialog(true);
				return;
			}

			// 3. Алхам алгасах үед анхааруулга өгөх
			if (selectedState.ViewOrder > state.selectedState?.ViewOrder + 1) {
				setDialogText(
					"Алхам алгасаж байгаа тул таны одоогийн рейсийн бүртгэл дутуу хадгалагдах боломжтой. Итгэлтэй байна уу?"
				);
				setOnConfirm(() => () => proceedWithStateChange(selectedState));
				setVisibleDialog(true);
				return;
			}

			// 4. Төлөв сонгогдсон бол
			proceedWithStateChange(selectedState);
		} else {
			// 4. Төлөв сонгогдсон бол
			proceedWithStateChange(selectedState);
		}
	};

	const bottomSheetSendSelectedState = async () => {
		try {
			const response = await sendSelectedState(
				state.token,
				state.projectData,
				state.selectedEquipment,
				state.selectedState,
				state.employeeData
			);
			console.log("bottomSheetSendSelectedState response=>", response);

			if (response?.Type === 0) {
			} else {
			}
		} catch (error) {
			console.log("Error in stopProgressHandler:", error);
		}
	};
	return (
		<BottomSheet ref={props.bottomSheetRef} snapPoints={[130, 500]}>
			<BottomSheetView style={styles.contentContainer}>
				<View style={styles.selectedStateContainer}>
					<View style={styles.selectedLabel}>
						<Text style={styles.selectedStateLabel}>CОНГОГДСОН ТӨЛӨВ</Text>
					</View>
					<Text style={{ color: MAIN_COLOR_BLUE, fontSize: 28 }}>{formatTime(state.seconds)}</Text>
				</View>
				<View style={styles.eachBottomList}>
					<Image
						source={
							state.selectedState && state.selectedState.ActivityShort
								? IMAGE_LIST.find((img) => img.code === state.selectedState.ActivityShort)?.img ||
								  require("../../../assets/only_icon.png") // Fallback if no match is found
								: require("../../../assets/only_icon.png")
						}
						style={{ height: 50, width: 50 }}
					/>
					<Text style={styles.selectedStateText}>
						{state.selectedState ? state.selectedState?.Activity : "Төлөв сонгогдоогүй"}
					</Text>
				</View>
				<View style={styles.selectLabelTitleStyle}>
					<Text style={{ color: "#fff", fontSize: 20 }}>БҮТЭЭЛТЭЙ АЖИЛЛАХ</Text>
				</View>
				<ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
					{mainStates &&
						mainStates?.map((el) => {
							const matchedImage = IMAGE_LIST.find((img) => img.code === el.ActivityShort);
							const borderColor =
								state.selectedState?.PMSParentId == stateParentId && state.selectedState?.ViewOrder + 1 === el.ViewOrder
									? animatedValue.interpolate({
											inputRange: [0.5, 1],
											outputRange: [MAIN_COLOR, "#fff"]
									  })
									: "transparent";

							return (
								<TouchableOpacity
									style={[
										styles.eachBottomList,
										{
											borderWidth: 3,
											borderColor,
											opacity: state.selectedState?.id == el.id ? 0.5 : 1
										}
									]}
									key={el.id}
									onPress={() => selectState(el, matchedImage)}
									disabled={state.selectedState?.id === el.id}
								>
									<Image
										source={matchedImage ? matchedImage?.img : require("../../../assets/only_icon.png")}
										style={{ height: 50, width: 50, marginRight: 5 }}
									/>
									<Text style={styles.eachState}>{el.Activity}</Text>
								</TouchableOpacity>
							);
						})}
				</ScrollView>
			</BottomSheetView>

			<CustomDialog
				visible={visibleDialog}
				confirmFunction={() => {
					onConfirm();
					setVisibleDialog(false);
				}}
				declineFunction={() => {
					setVisibleDialog(false);
				}}
				text={dialogText}
				confirmBtnText="Тийм"
				DeclineBtnText="Үгүй"
				type={"warning"}
				screenOrientation={state.orientation}
			/>
		</BottomSheet>
	);
}
const styles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		marginHorizontal: 20
	},
	eachBottomList: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: MAIN_COLOR_GRAY,
		borderRadius: MAIN_BORDER_RADIUS,
		marginTop: 10,
		padding: 5,
		minHeight: 60
	},
	selectLabelTitleStyle: {
		backgroundColor: MAIN_COLOR_GREEN,
		borderRadius: 50,
		padding: 5,
		paddingHorizontal: 10,
		alignSelf: "flex-start",
		marginTop: 10,
		marginBottom: 10
	},
	selectedStateText: {
		color: "#6287CA",
		fontSize: 22,
		flex: 1,
		marginLeft: 10,
		textAlign: "center",
		flexWrap: "wrap"
	},
	selectedLabel: {
		backgroundColor: MAIN_COLOR,
		borderRadius: 50,
		padding: 5,
		paddingHorizontal: 10,
		alignSelf: "flex-start"
	},
	eachState: {
		fontSize: 14,
		flex: 1,
		marginLeft: 10,
		textAlign: "center",
		flexWrap: "wrap"
	},
	selectedStateLabel: {
		maxWidth: 200,
		textAlign: "center",
		flexWrap: "wrap",
		color: "#fff",
		fontSize: 20
	},
	selectedStateContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	}
});
