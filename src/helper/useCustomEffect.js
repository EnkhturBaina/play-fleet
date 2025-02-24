import { useEffect } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { ECHO_EVENT_PROGRESS, ECHO_REVERB_HOST, ECHO_REVERB_KEY } from "../constant";

const useCustomEffect = (
	state,
	setEquipmentImage,
	setDialogText,
	setDialogConfirmText,
	setDialogDeclineText,
	setVisibleDialog
) => {
	useEffect(() => {
		state.detectOrientation();

		// Төхөөрөмжийн төрлийг тодорхойлох
		const equipmentType = state.selectedEquipment?.TypeName;
		const equipmentImages = {
			Truck: require("../../assets/status/truck_main.png"),
			Loader: require("../../assets/status/loader_main.png"),
			Other: require("../../assets/status/other_main.png")
		};
		setEquipmentImage(equipmentImages[equipmentType] || require("../../assets/icon.png"));

		// Laravel Echo тохиргоо
		window.Pusher = Pusher;
		const echo = new Echo({
			broadcaster: "reverb",
			key: ECHO_REVERB_KEY,
			wsHost: ECHO_REVERB_HOST,
			wsPort: 8000, // Production: 8000 || 8082
			wssPort: 443,
			forceTLS: true,
			encrypted: true,
			authEndpoint: `https://pms.talent.mn/api/broadcasting/auth`,
			auth: { headers: { Authorization: `Bearer ${state.token}` } },
			enabledTransports: ["ws", "wss"],
			debug: false
		});

		// ECHO сонсогч тохируулах
		const userChannel = `user.${state.employeeData?.id}`;
		if (echo) {
			echo.private(userChannel).listen(ECHO_EVENT_PROGRESS, (event) => {
				// console.log("ECHO_EVENT_PROGRESS:", JSON.stringify(event));

				if (event) {
					// Сонгогдсон төлөв шинэчлэх
					const selectedState = state.refStates?.find((item) => item.id === event.extra?.PMSProgressStateId);
					state.setSelectedState(selectedState);

					// Header мэдээлэл шинэчлэх
					state.setHeaderSelections((prev) => ({
						...prev,
						startPosition: event.extra?.PMSLocationId,
						blockNo: event.extra?.PMSBlastShotId,
						endLocation: event.extra?.PMSDestinationId,
						exca: event.extra?.PMSLoaderId,
						material: event.extra?.PMSMaterialUnitId
					}));

					// Харилцах цонх гаргах
					setDialogText(event.message);
					setDialogConfirmText("Ок");
					setDialogDeclineText("");
					setVisibleDialog(true);
				}

				// Echo мэдээлэл хадгалах
				state.setEchoStateData(event);
			});

			return () => {
				// console.log("Cleaning up Echo listener");
				echo.private(userChannel).stopListening(ECHO_EVENT_PROGRESS);
			};
		}

		return () => {
			// echo.disconnect(); // Хэрэгтэй бол идэвхжүүлж болно
		};
	}, [state, setEquipmentImage, setDialogText, setDialogConfirmText, setDialogDeclineText, setVisibleDialog]);
};

export default useCustomEffect;
