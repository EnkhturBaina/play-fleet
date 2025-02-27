import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { ECHO_REVERB_HOST, ECHO_REVERB_KEY } from "../constant";

const useEcho = () => {
	const [echoInstance, setEchoInstance] = useState(null);

	useEffect(() => {
		const initEcho = async () => {
			if (typeof window === "undefined" || !ECHO_REVERB_HOST) return;

			try {
				const token = await AsyncStorage.getItem("access_token");
				// console.log("token", token);

				if (!token) {
					console.warn("⚠️ No access token found for Echo authentication.");
					return;
				}

				window.Pusher = Pusher;
				// Pusher.logToConsole = true;

				const echo = new Echo({
					broadcaster: "reverb",
					key: ECHO_REVERB_KEY,
					wsHost: ECHO_REVERB_HOST,
					wsPort: 8082, // Production: 8000
					wssPort: 443,
					forceTLS: false, // Production: true
					encrypted: true,
					authEndpoint: `https://pms.talent.mn/api/broadcasting/auth`,
					auth: {
						headers: {
							Authorization: `Bearer ${token}`
						}
					},
					enabledTransports: ["ws", "wss"],
					debug: false,
					reconnectAttempts: 5, // ✅ Retry 5 times
					reconnectDelay: 3000 // ✅ Wait 3 sec before retry
				});

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

				setEchoInstance(echo);
			} catch (error) {
				console.error("❌ Error initializing Echo:", error);
			}
		};

		initEcho();

		return () => {
			console.log("🔌 Cleaning up Echo instance...");
			if (echoInstance) {
				echoInstance.disconnect();
			}
		};
	}, [ECHO_REVERB_HOST]);

	return echoInstance;
};

export default useEcho;
