import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MapView, { Polygon, Polyline } from "react-native-maps";
import * as FileSystem from "expo-file-system";
import { parseString } from "react-native-xml2js";
import { useNavigation } from "@react-navigation/native";
import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";
import { useNetworkStatus } from "../contexts/NetworkContext";

const convertHexWithAlpha = (kmlColor) => {
	if (!kmlColor || kmlColor.length !== 8) {
		console.error("Invalid color format. Expected AABBGGRR (8 characters).");
		return null;
	}

	const alphaHex = kmlColor.substring(0, 2); // Alpha
	const blue = kmlColor.substring(2, 4); // Blue
	const green = kmlColor.substring(4, 6); // Green
	const red = kmlColor.substring(6, 8); // Red

	const alphaDecimal = (parseInt(alphaHex, 16) / 255).toFixed(2);

	const color = `rgba(${parseInt(red, 16)}, ${parseInt(green, 16)}, ${parseInt(blue, 16)}, ${alphaDecimal})`;

	return color;
};

const TestRenderUurhai = () => {
	const navigation = useNavigation();
	const [kmlData, setKmlData] = useState("");
	const [loadingKML, setLoadingKML] = useState(false);
	const [kmlStatus, setKmlStatus] = useState(null);
	const [fileContent, setFileContent] = useState(null);
	const [polygons, setPolygons] = useState(null);
	const { isConnected } = useNetworkStatus();

	const loadKML = async () => {
		setKmlStatus("File not found from storage. Loading from server");
		try {
			// URL-с KML файлыг татаж авах
			// const response = await fetch("https://drive.google.com/uc?export=download&id=1PeHfxTDwRLAFWdypOY7nxm1mvruKYsup");
			const response = await fetch("https://drive.google.com/uc?export=download&id=1LDXA3r1EoszfCgXDrMxAPQuDcdGdAPxC");
			const serverFileContent = await response.text();

			const fileUri = FileSystem.documentDirectory + "new_kml_data2.txt";

			await FileSystem.writeAsStringAsync(fileUri, serverFileContent);

			setKmlData(serverFileContent);
			checkIfFileExists();
		} catch (error) {
			setLoadingKML(false);
			setKmlStatus(error);
			console.error("Error loading KML file:", error);
		}
	};

	const checkIfFileExists = async () => {
		setLoadingKML(true);
		setKmlStatus("Loading from local storage");
		const fileUri = FileSystem.documentDirectory + "new_kml_data2.txt";

		// Файл local -д хадгалагдсан бол унших
		try {
			const fileInfo = await FileSystem.getInfoAsync(fileUri);
			console.log("fileInfo", fileInfo);

			if (fileInfo.exists) {
				setKmlStatus("File found from storage. DONE !");
				const fileData = await FileSystem.readAsStringAsync(fileUri);
				// console.log("fileData", fileData);

				setFileContent(fileData);
			} else {
				if (isConnected) {
					loadKML();
				} else {
					setKmlStatus("File not found from storage and no internet connection");
					setLoadingKML(false); //local -с уншаад оффлайн байвал loading-г false болгох
				}
				setFileContent(null);
			}
		} catch (error) {
			setLoadingKML(false);
			setKmlStatus(error);
			console.error("Error reading file:", error);
		}
	};

	useEffect(() => {
		console.log("Y");
		checkIfFileExists();
	}, []);

	useEffect(() => {
		if (kmlData) {
			setKmlStatus("File loaded from server. DONE !");
			setLoadingKML(false); //server -с kmlData уншаад бэлэн болоход loading-г false болгох
		}
	}, [kmlData]);

	useEffect(() => {
		console.log("Z");
		if (fileContent !== null) {
			try {
				parseString(fileContent, { trim: true }, (err, result) => {
					if (err) {
						console.error("Error parsing KML:", err);
						return;
					}

					// console.log("results", JSON.stringify(result.kml.Document[0].Folder[0].Placemark));
					const placemarks = result.kml.Document[0].Folder[0].Placemark || [];
					// console.log("placemarks", JSON.stringify(placemarks));

					const extractedPolygons = placemarks.map((placemark) => {
						// const strokeColor = placemark.Style[0].LineStyle[0].color[0]?.substring(2);
						// const strokeColor = placemark?.Style?.[0]?.LineStyle?.[0]?.color?.[0]?.substring(2) || "000";
						const strokeColor = convertHexWithAlpha(placemark?.Style?.[0]?.LineStyle?.[0]?.color?.[0]);
						const strokeWidth = placemark.Style[0].LineStyle[0].width[0];

						const coordinatesString = placemark.LineString[0].coordinates[0];
						const coordinatesArray = coordinatesString
							.trim()
							.split(" ")
							.map((coordinate) => {
								const [longitude, latitude] = coordinate.split(",").map(Number);
								return { latitude, longitude };
							});
						return { coords: coordinatesArray, strokeColor, strokeWidth };
					});
					setPolygons(extractedPolygons);
					setLoadingKML(false); //local -с уншаад файл байвал loading-г false болгох
				});
			} catch (error) {
				console.log("ERR", error);
			}
		}
	}, [fileContent]);

	useEffect(() => {
		console.log("X isConnected", isConnected);

		window.Pusher = Pusher;
		const echo = new Echo({
			broadcaster: "reverb",
			key: "qqm6lewsdgvdbmnkjuup",
			wsHost: "pms.talent.mn",
			wsPort: 8000, // production case: 8000 || 8082
			wssPort: 443,
			forceTLS: true, // production case: true
			encrypted: true,
			enabledTransports: ["ws", "wss"],
			debug: true
		});
		console.log("echo", echo);

		if (echo) {
			echo.channel("user.2").listen(".PowerBIUpdated", (event) => {
				console.log("Power BI Update:", event.message);
			});
			return () => {
				console.log("return");
				echo.channel("user.2").stopListening(".PowerBIUpdated");
			};
		}

		return () => {
			// echo.disconnect();
		};
	}, []);

	return (
		<View style={{ flex: 1 }}>
			<TouchableOpacity
				style={{ marginTop: 100, width: 300, height: 50 }}
				onPress={() => {
					navigation.goBack();
				}}
			>
				<Text style={{}}>BACK {kmlStatus}</Text>
				<Text>{loadingKML ? "Loading: true" : "Loading: false"}</Text>
				<Text>{fileContent ? "fileContent: true" : "fileContent: false"}</Text>
			</TouchableOpacity>
			{loadingKML ? (
				<Text>Building KML</Text>
			) : !loadingKML && fileContent ? (
				<>
					{fileContent && polygons?.length > 0 ? (
						<MapView
							style={{ flex: 1 }}
							initialRegion={{ latitude: 47.91887, longitude: 106.9176, latitudeDelta: 0.0121, longitudeDelta: 0.0121 }}
							mapType="satellite"
						>
							{polygons?.length > 0 &&
								polygons?.map((el, index) => {
									// console.log("EL", JSON.stringify(el));

									return (
										<Polyline
											key={index}
											coordinates={el.coords}
											// strokeColor={"red"}
											strokeColor={el.strokeColor}
											// fillColor="rgba(0,0,255,0.3)"
											strokeWidth={el.strokeWidth}
										/>
									);
								})}
						</MapView>
					) : (
						<Text>Building KML</Text>
					)}
				</>
			) : null}
		</View>
	);
};

export default TestRenderUurhai;
