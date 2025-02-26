import axios from "axios";
import { SERVER_URL } from "../constant";

export const sendSelectedState = async (
	token,
	projectData,
	selectedEquipment,
	selectedState,
	employeeData,
	headerSelections,
	location
) => {
	try {
		const response = await axios.post(
			`${SERVER_URL}/mobile/progress/send`,
			{
				PMSProjectId: projectData?.id,
				PMSEquipmentId: selectedEquipment?.id,
				PMSProgressStateId: selectedState?.PMSParentId,
				PMSProgressSubStateId: selectedState?.id,
				PMSEmployeeId: employeeData?.id,
				PMSLoaderId: headerSelections?.PMSLoaderId,
				PMSLocationId: headerSelections?.PMSSrcId,
				PMSBlastShotId: headerSelections?.PMSBlastShotId,
				PMSDestination: headerSelections?.PMSDstId,
				PMSMaterialUnitId: headerSelections?.PMSMaterialId,
				Latitude: parseFloat(location?.coords?.latitude) || 0,
				Longitude: parseFloat(location?.coords?.longitude) || 0
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
