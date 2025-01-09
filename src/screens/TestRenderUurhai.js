import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import MapView, { Polygon } from "react-native-maps";
import * as FileSystem from "expo-file-system";
import { parseString, parseStringPromise } from "xml2js";

const KMLRenderer = ({ kmlData }) => {
	const [coordinates, setCoordinates] = useState([]);
	const [fileContent, setFileContent] = useState(null);

	const checkIfFileExists = async () => {
		const fileUri = FileSystem.documentDirectory + "server_data.txt";

		// 1. Хэрэв файлын агуулга хадгалагдсан бол түүнийг унших
		try {
			const fileInfo = await FileSystem.getInfoAsync(fileUri);
			console.log("fileInfo", fileInfo);

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

				const kmlCoordinates = result.kml.Document[0].Placemark.map((placemark) => {
					console.log("CHECK ========>", placemark.Polygon[0].outerBoundaryIs[0].LinearRing[0]);

					const coords = placemark.Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0];
					return coords.split(" ").map((coord) => {
						const [longitude, latitude] = coord.split(",");
						return {
							latitude: parseFloat(latitude),
							longitude: parseFloat(longitude)
						};
					});
				});
				console.log("kmlCoordinates[0]", kmlCoordinates[0]);

				setCoordinates(kmlCoordinates[0]);
			});
		}
	}, [fileContent]);

	return (
		<>
			{fileContent ? (
				<MapView
					style={{ flex: 1 }}
					initialRegion={{ latitude: 47.91887, longitude: 106.9176, latitudeDelta: 0.0121, longitudeDelta: 0.0121 }}
				>
					{coordinates.length > 0 && (
						<Polygon
							coordinates={coordinates}
							strokeColor="rgba(0,0,255,0.5)"
							fillColor="rgba(0,0,255,0.3)"
							strokeWidth={2}
						/>
					)}
				</MapView>
			) : (
				<Text>LOADING fileContent</Text>
			)}
		</>
	);
};

const TestRenderUurhai = () => {
	const [kmlData, setKmlData] = useState("");

	useEffect(() => {
		const loadKML = async () => {
			try {
				// URL-с KML файлыг татаж авах
				const response = await fetch(
					"https://drive.google.com/uc?export=download&id=1PeHfxTDwRLAFWdypOY7nxm1mvruKYsup"
				);
				const serverFileContent = await response.text();

				const fileUri = FileSystem.documentDirectory + "server_data.txt";

				await FileSystem.writeAsStringAsync(fileUri, serverFileContent);

				// KML контентыг хадгалах
				setKmlData(serverFileContent);
			} catch (error) {
				console.error("Error loading KML file:", error);
			}
		};

		loadKML();
	}, []);
	return <View style={{ flex: 1 }}>{kmlData ? <KMLRenderer kmlData={kmlData} /> : <Text>Loading KML...</Text>}</View>;
};

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	errorText: {
		color: "red",
		textAlign: "center",
		marginTop: 20
	}
});

export default TestRenderUurhai;
