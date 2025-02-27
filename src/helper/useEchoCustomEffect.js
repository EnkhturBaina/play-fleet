import { useEffect } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { ECHO_EVENT_PROGRESS, ECHO_REVERB_HOST, ECHO_REVERB_KEY } from "../constant";

const useEchoCustomEffect = (state, setDialogText, setDialogConfirmText, setVisibleDialog) => {
	useEffect(() => {
		// Laravel Echo тохиргоо
		window.Pusher = Pusher;
		// Pusher.logToConsole = true;
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
			debug: false,
			reconnectAttempts: 5, // ✅ Retry 5 times
			reconnectDelay: 3000 // ✅ Wait 3 sec before retry
		});

		// ECHO сонсогч тохируулах
		const userChannel = `user.${state.employeeData?.id}`;
		if (echo) {
			// ✅ Handle connection errors
			echo.connector.pusher.connection.bind("error", (err) => {
				console.error("🛑 WebSocket Error:", err);
			});

			// ✅ Handle disconnects
			echo.connector.pusher.connection.bind("disconnected", () => {
				console.warn("⚠️ WebSocket Disconnected. Retrying...");
				setTimeout(() => {
					if (echo.connector.pusher.connection.state !== "connected") {
						echo.connect();
					}
				}, 5000);
			});

			// ✅ Handle connection state changes
			echo.connector.pusher.connection.bind("state_change", (states) => {
				console.log("🔄 WebSocket State Change:", states.previous, "➡", states.current);
			});

			echo.private(userChannel).listen(ECHO_EVENT_PROGRESS, (event) => {
				// console.log("ECHO_EVENT_PROGRESS:", JSON.stringify(event));

				if (event) {
					// Сонгогдсон төлөв шинэчлэх
					const selectedState = state.refStates?.find((item) => item.id === event.extra?.PMSProgressStateId);
					state.setSelectedState(selectedState);

					// Header мэдээлэл шинэчлэх
					state.setHeaderSelections((prev) => ({
						...prev,
						PMSSrcId: event.extra?.PMSLocationId,
						PMSBlastShotId: event.extra?.PMSBlastShotId,
						PMSDstId: event.extra?.PMSDestinationId,
						PMSLoaderId: event.extra?.PMSLoaderId,
						PMSMaterialId: event.extra?.PMSMaterialUnitId
					}));

					// Dialog гаргах
					setDialogText(event.message);
					setDialogConfirmText("Ок");
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
			console.log("🔌 Cleaning up Echo instance...");
			echo.disconnect();
		};
	}, []);
};

export default useEchoCustomEffect;
