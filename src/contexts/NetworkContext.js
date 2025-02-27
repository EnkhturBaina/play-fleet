import useNetInfo from "@react-native-community/netinfo";
import { createContext, useContext, useEffect, useState } from "react";

// Интернетийн төлвийн context үүсгэх
const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
	const [isConnected, setIsConnected] = useState(true);
	const [connectionQuality, setConnectionQuality] = useState("unknown");

	useEffect(() => {
		// NetInfo listener нэмэх
		const unsubscribe = useNetInfo.addEventListener((state) => {
			console.log("state", state);

			setIsConnected(state.isConnected);
			if (state.isConnected && state.details) {
				const speed = state.details.downlink; // Mbps
				if (speed > 5) {
					setConnectionQuality("good");
				} else if (speed > 1) {
					setConnectionQuality("medium");
				} else {
					setConnectionQuality("poor");
				}
			} else {
				setConnectionQuality("none");
			}
		});

		return () => {
			// Listener-г салгах
			unsubscribe();
		};
	}, []);

	return <NetworkContext.Provider value={{ isConnected, connectionQuality }}>{children}</NetworkContext.Provider>;
};

// Интернет төлөвийг ашиглах туслах функц
export const useNetworkStatus = () => {
	return useContext(NetworkContext);
};
