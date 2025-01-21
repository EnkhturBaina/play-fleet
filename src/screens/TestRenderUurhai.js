import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import MapView, { Polygon, Polyline } from "react-native-maps";
import * as FileSystem from "expo-file-system";
import { parseString } from "react-native-xml2js";
import { useNavigation } from "@react-navigation/native";
import Echo from "laravel-echo";
import Pusher from "pusher-js/react-native";

const KMLRenderer = () => {
	const navigation = useNavigation();
	const [fileContent, setFileContent] = useState(null);
	const [polygons, setPolygons] = useState(null);

	const checkIfFileExists = async () => {
		const fileUri = FileSystem.documentDirectory + "new_kml_data.txt";

		// Файл local -д хадгалагдсан бол унших
		try {
			const fileInfo = await FileSystem.getInfoAsync(fileUri);
			// console.log("fileInfo", fileInfo);

			if (fileInfo.exists) {
				const fileData = await FileSystem.readAsStringAsync(fileUri);
				// console.log("fileData", fileData);

				setFileContent(fileData);
			} else {
				setFileContent("No file found!");
			}
		} catch (error) {
			console.error("Error reading file:", error);
		}
	};

	useEffect(() => {
		checkIfFileExists();
	}, []);

	useEffect(() => {
		if (fileContent !== null) {
			parseString(fileContent, { trim: true }, (err, result) => {
				if (err) {
					console.error("Error parsing KML:", err);
					return;
				}

				// console.log("results", JSON.stringify(result.kml.Document[0].Folder[0].Placemark));
				const placemarks = result.kml.Document[0].Folder[0].Placemark || []; // Placemark элементийг авах
				// console.log("placemarks", JSON.stringify(placemarks));

				const extractedPolygons = placemarks.map((placemark) => {
					const strokeColor = placemark.Style[0].LineStyle[0].color[0]?.substring(2);
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
			});
		}
	}, [fileContent]);

	return (
		<>
			<TouchableOpacity
				style={{ marginTop: 100, width: 100, height: 50 }}
				onPress={() => {
					navigation.goBack();
				}}
			>
				<Text style={{}}>BACK {polygons?.length}</Text>
			</TouchableOpacity>
			{fileContent && polygons?.length > 0 ? (
				<MapView
					style={{ flex: 1 }}
					initialRegion={{ latitude: 47.91887, longitude: 106.9176, latitudeDelta: 0.0121, longitudeDelta: 0.0121 }}
				>
					{polygons?.length > 0 &&
						polygons?.map((el, index) => {
							// console.log("EL", JSON.stringify(el));

							return (
								<Polyline
									key={index}
									coordinates={el.coords}
									// strokeColor={"red"}
									strokeColor={"#" + el.strokeColor}
									// fillColor="rgba(0,0,255,0.3)"
									strokeWidth={el.strokeWidth}
								/>
							);
						})}
				</MapView>
			) : (
				<Text>LOADING fileContent</Text>
			)}
		</>
	);
};

const TestRenderUurhai = () => {
	const [kmlData, setKmlData] = useState("");

	const loadKML = async () => {
		try {
			// URL-с KML файлыг татаж авах
			// const response = await fetch("https://drive.google.com/uc?export=download&id=1PeHfxTDwRLAFWdypOY7nxm1mvruKYsup");
			const response = await fetch("https://drive.google.com/uc?export=download&id=1LDXA3r1EoszfCgXDrMxAPQuDcdGdAPxC");
			const serverFileContent = await response.text();

			const fileUri = FileSystem.documentDirectory + "new_kml_data.txt";

			await FileSystem.writeAsStringAsync(fileUri, serverFileContent);

			setKmlData(serverFileContent);
		} catch (error) {
			console.error("Error loading KML file:", error);
		}
	};

	useEffect(() => {
		loadKML();
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

		// if (echo) {
		// 	echo.channel("pms.talent.mn").listen(".PowerBIUpdated", (event) => {
		// 		console.log("Realtime Event Data:", event);
		// 	});
		// }

		return () => {
			// echo.disconnect();
		};
	}, []);
	return <View style={{ flex: 1 }}>{kmlData ? <KMLRenderer kmlData={kmlData} /> : <Text>Loading KML...</Text>}</View>;
};

export default TestRenderUurhai;
