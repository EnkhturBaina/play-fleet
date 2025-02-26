import axios from "axios";
import dayjs from "dayjs";
import { SERVER_URL } from "../constant";

export const sendSelectedState = async (
	token,
	projectData,
	selectedEquipment,
	selectedState,
	employeeData,
	LoaderData
) => {
	try {
		const response = await axios.post(
			`${SERVER_URL}/mobile/progress/send`,
			{
				PMSProjectId: projectData?.id,
				PMSEquipmentId: selectedEquipment?.id,
				PMSProgressStateId: selectedState?.id,
				PMSProgressSubStateId: selectedState?.id,
				PMSEmployeeId: employeeData?.id,
				PMSLoaderId: selectedState?.id,
				PMSLocationId: selectedState?.id,
				PMSBlastShotId: selectedState?.id,
				PMSDestination: selectedState?.id,
				PMSMaterialUnitId: selectedState?.id,
				Latitude: selectedState?.id,
				Longitude: selectedState?.id
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
		console.log("Error in stopProgress service:", error);
		throw error; // Алдаа гарвал component-д дамжуулна
	}
};
