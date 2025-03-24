import axios from "axios";
import { SERVER_URL } from "../constant";
import { insertMotoHourData, insertSendLocationData, insertSendStateData } from "./db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "dayjs/locale/es";
import dayjs from "dayjs";

export const sendSelectedState = async (
	token,
	projectData,
	selectedEquipment,
	selectedState,
	employeeData,
	headerSelections,
	location,
	isConnected
) => {
	var state_id,
		sub_state_id = null;
	if (selectedState?.PMSParentId == null) {
		state_id = selectedState?.id;
		sub_state_id = null;
	} else {
		state_id = selectedState?.PMSParentId;
		sub_state_id = selectedState?.id;
	}

	await AsyncStorage.setItem("L_last_state_time", dayjs().format("YYYY-DD-MM HH:mm:ss")).then(async () => {
		await AsyncStorage.setItem("L_last_state", JSON.stringify(selectedState)).then(async () => {
			if (isConnected) {
				try {
					const response = await axios.post(
						`${SERVER_URL}/mobile/progress/send`,
						{
							PMSProjectId: projectData?.id,
							PMSEquipmentId: selectedEquipment?.id,
							PMSProgressStateId: state_id,
							PMSProgressSubStateId: sub_state_id,
							PMSEmployeeId: employeeData?.id,
							PMSLoaderId: headerSelections?.PMSLoaderId,
							PMSLocationId: headerSelections?.PMSSrcId,
							PMSBlastShotId: headerSelections?.PMSBlastShotId,
							PMSDestination: headerSelections?.PMSDstId,
							PMSMaterialUnitId: headerSelections?.PMSMaterialId,
							Latitude: location?.coords?.latitude ? parseFloat(location.coords.latitude) : 0,
							Longitude: location?.coords?.longitude ? parseFloat(location.coords.longitude) : 0
						},
						{
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`
							}
						}
					);
					// console.log("response", JSON.stringify(response));

					return response.data;
				} catch (error) {
					console.log("Error in send_state_data service:", error);
					throw error; // Алдаа гарвал component-д дамжуулна
				}
			} else {
				try {
					const responseOff = await insertSendStateData([
						projectData?.id,
						selectedEquipment?.id,
						state_id,
						sub_state_id,
						employeeData?.id,
						headerSelections?.PMSLoaderId,
						headerSelections?.PMSSrcId,
						headerSelections?.PMSBlastShotId,
						headerSelections?.PMSDstId,
						headerSelections?.PMSMaterialId,
						location?.coords?.latitude ? parseFloat(location.coords.latitude) : 0,
						location?.coords?.longitude ? parseFloat(location.coords.longitude) : 0
					]);
					return responseOff;
				} catch (error) {
					console.error("Error inserting send_state_data:", error);
				}
			}
		});
	});
};

export const sendMotoHour = async (
	token,
	selectedEquipment,
	shiftData,
	SavedDate,
	StartSMU,
	FinishSMU,
	Fuel,
	ProgressSMU,
	isConnected,
	LastLogged
) => {
	if (isConnected) {
		try {
			const response = await axios.post(
				`${SERVER_URL}/mobile/truck/fuel/save`,
				{
					PMSEquipmentId: selectedEquipment?.id,
					PMSShiftId: shiftData?.id,
					SavedDate,
					StartSMU,
					FinishSMU,
					Fuel,
					ProgressSMU,
					LastLogged
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`
					}
				}
			);
			// console.log("response", JSON.stringify(response));

			return response.data;
		} catch (error) {
			console.log("Error in send_Moto_Hour service:", error);
			throw error; // Алдаа гарвал component-д дамжуулна
		}
	} else {
		try {
			const responseOff = await insertMotoHourData([
				selectedEquipment?.id,
				shiftData?.id,
				SavedDate,
				StartSMU,
				FinishSMU,
				Fuel,
				ProgressSMU,
				LastLogged
			]);
			return responseOff;
		} catch (error) {
			console.error("Error inserting send_Moto_Hour:", error);
		}
	}
};

export const sendLocation = async (
	token,
	selectedEquipment,
	Latitude,
	Longitude,
	Speed,
	CurrentDate,
	EventTime,
	isConnected
) => {
	if (isConnected) {
		try {
			const response = await axios.post(
				`${SERVER_URL}/mobile/progress/track/save`,
				{
					PMSEquipmentId: selectedEquipment?.id,
					Latitude,
					Longitude,
					Speed,
					CurrentDate,
					EventTime
				},
				{
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`
					}
				}
			);
			// console.log("response", JSON.stringify(response));

			return response.data;
		} catch (error) {
			console.log("Error in sendLocation service:", error);
			throw error; // Алдаа гарвал component-д дамжуулна
		}
	} else {
		try {
			const responseOff = await insertSendLocationData([
				selectedEquipment?.id,
				Latitude,
				Longitude,
				Speed,
				CurrentDate,
				EventTime
			]);
			if (responseOff?.changes > 0) {
				console.log("send offline location done");
			}
			return responseOff;
		} catch (error) {
			console.error("Error inserting send state data:", error);
		}
	}
};
