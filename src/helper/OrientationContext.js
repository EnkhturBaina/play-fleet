import React, { createContext, useState, useEffect } from "react";
import * as ScreenOrientation from "expo-screen-orientation";

export const OrientationContext = createContext();

export const OrientationProvider = ({ children }) => {
	const [orientation, setOrientation] = useState("UNKNOWN");

	// 🧠 Анх эхлэхэд одоогийн orientation авах
	useEffect(() => {
		const fetchInitialOrientation = async () => {
			const currentOrientation = await ScreenOrientation.getOrientationAsync();
			if (
				currentOrientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
				currentOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
			) {
				setOrientation("PORTRAIT");
			} else if (
				currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
				currentOrientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
			) {
				setOrientation("LANDSCAPE");
			} else {
				setOrientation("UNKNOWN");
			}
		};

		fetchInitialOrientation();
	}, []);

	// 👂 Live listener
	useEffect(() => {
		const subscription = ScreenOrientation.addOrientationChangeListener((evt) => {
			const newOrientation = evt.orientationInfo.orientation;

			if (
				newOrientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
				newOrientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
			) {
				setOrientation("PORTRAIT");
			} else if (
				newOrientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
				newOrientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT
			) {
				setOrientation("LANDSCAPE");
			} else {
				setOrientation("UNKNOWN");
			}
		});

		return () => {
			ScreenOrientation.removeOrientationChangeListener(subscription);
		};
	}, []);

	return <OrientationContext.Provider value={orientation}>{children}</OrientationContext.Provider>;
};
