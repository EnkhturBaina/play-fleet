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
			setIsConnected(state.isConnected);
			if (!state.isConnected) {
				setConnectionQuality("poor");
			} else if (state.type === "wifi") {
				setConnectionQuality(state.isInternetReachable ? "good" : "medium");
			} else if (state.type === "cellular") {
				setConnectionQuality(state.isInternetReachable ? "good" : "medium");
			} else {
				setConnectionQuality("poor");
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
