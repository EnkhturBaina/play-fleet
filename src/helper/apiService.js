import axios from "axios";
import { SERVER_URL } from "../constant";
import { insertMotoHourData, insertSendLocationData, insertSendStateData } from "./db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "dayjs/locale/es";
import dayjs from "dayjs";

// 📌 Нэгтгэсэн SQL хадгалах функц
const insertToDatabase = async (table, data) => {
	try {
		let response;
		switch (table) {
			case "send_state":
				response = await insertSendStateData(data);
				break;
			case "moto_hour":
				response = await insertMotoHourData(data);
				break;
			case "send_location":
				response = await insertSendLocationData(data);
				break;
			default:
				console.error(`Unknown table: ${table}`);
				return;
		}

		if (response?.changes > 0) {
			console.log(`✅ Offline ${table} data inserted successfully.`);
		}
		return response;
	} catch (error) {
		console.error(`❌ Error inserting ${table} data:`, error);
	}
};

// 📌 Төлөв илгээх функц
export const sendSelectedState = async (
	token,
	projectData,
	selectedEquipment,
	selectedState,
	employeeData,
	headerSelections,
	location,
	isConnected,
	currentDate,
	startTime,
	endTime,
	shiftData
) => {
	const state_id = selectedState?.PMSParentId ?? selectedState?.id;
	const sub_state_id = selectedState?.PMSParentId ? selectedState?.id : null;

	// ✅ Local storage-д хадгалах
	await AsyncStorage.setItem("L_last_state_time", dayjs().format("YYYY-DD-MM HH:mm:ss"));
	await AsyncStorage.setItem("L_last_state", JSON.stringify(selectedState));

	// ✅ Хэрэв оффлайн бол локал руу хадгална
	if (!isConnected) {
		return insertToDatabase("send_state", [
			projectData.id,
			selectedEquipment.id,
			state_id,
			sub_state_id,
			employeeData.id,
			headerSelections?.PMSLoaderId,
			headerSelections?.PMSSrcId,
			headerSelections?.PMSBlastShotId,
			headerSelections?.PMSDstId,
			headerSelections?.PMSMaterialId,
			location?.coords?.latitude || 0,
			location?.coords?.longitude || 0,
			currentDate,
			startTime,
			endTime,
			shiftData?.id
		]);
	}

	// ✅ Онлайн үед сервер лүү илгээх
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
				Latitude: location?.coords?.latitude || 0,
				Longitude: location?.coords?.longitude || 0,
				CurrentData: currentDate,
				StartTime: startTime,
				EndTime: endTime,
				PMSShiftId: shiftData?.id
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`
				}
			}
		);
		return response.data;
	} catch (error) {
		console.log("❌ Error in send_state_data service:", error);
		const response = insertToDatabase("send_state", [
			projectData.id,
			selectedEquipment.id,
			state_id,
			sub_state_id,
			employeeData.id,
			headerSelections?.PMSLoaderId,
			headerSelections?.PMSSrcId,
			headerSelections?.PMSBlastShotId,
			headerSelections?.PMSDstId,
			headerSelections?.PMSMaterialId,
			location?.coords?.latitude || 0,
			location?.coords?.longitude || 0,
			currentDate,
			startTime,
			endTime,
			shiftData?.id
		]);
		return response;
	}
};

// 📌 Moto Hour илгээх функц
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
	if (!isConnected) {
		return insertToDatabase("moto_hour", [
			selectedEquipment.id,
			shiftData.id,
			SavedDate,
			StartSMU,
			FinishSMU,
			Fuel,
			ProgressSMU,
			LastLogged
		]);
	}

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
		return response.data;
	} catch (error) {
		console.log("❌ Error in send_Moto_Hour service:", error);
		const response = insertToDatabase("moto_hour", [
			selectedEquipment.id,
			shiftData.id,
			SavedDate,
			StartSMU,
			FinishSMU,
			Fuel,
			ProgressSMU,
			LastLogged
		]);
		return response;
	}
};

// 📌 Байршил илгээх функц
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
	if (!isConnected) {
		return insertToDatabase("send_location", [
			selectedEquipment.id,
			Latitude,
			Longitude,
			Speed,
			CurrentDate,
			EventTime
		]);
	}

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
		return response.data?.Msg;
	} catch (error) {
		console.log("❌ Error in sendLocation service:", error);
		const response = insertToDatabase("send_location", [
			selectedEquipment.id,
			Latitude,
			Longitude,
			Speed,
			CurrentDate,
			EventTime
		]);
		return response;
	}
};
