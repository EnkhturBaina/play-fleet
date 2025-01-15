import useNetInfo from "@react-native-community/netinfo";
import { createContext, useContext, useEffect, useState } from "react";

// Интернетийн төлвийн context үүсгэх
const NetworkContext = createContext();

export const NetworkProvider = ({ children }) => {
	const [isConnected, setIsConnected] = useState(true);

	useEffect(() => {
		// NetInfo listener нэмэх
		const unsubscribe = useNetInfo.addEventListener((state) => {
			setIsConnected(state.isConnected);
		});

		return () => {
			// Listener-г салгах
			unsubscribe();
		};
	}, []);

	return <NetworkContext.Provider value={{ isConnected }}>{children}</NetworkContext.Provider>;
};

// Интернет төлөвийг ашиглах туслах функц
export const useNetworkStatus = () => {
	return useContext(NetworkContext);
};
