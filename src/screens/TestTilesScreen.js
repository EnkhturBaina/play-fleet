import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import MapView, { UrlTile } from "react-native-maps";

// Улаанбаатар хотын үндсэн координат болон масштабын утга
const UB_CENTER_LAT = 47.92123;
const UB_CENTER_LON = 106.918556;
var Buffer = require("buffer/").Buffer;

const TestTilesScreen = () => {
	const [tileUri, setTileUri] = useState(null);
	const [tilesReady, setTilesReady] = useState(false);

	// Газрын зургийн tile татах функц
	const downloadTile = async (z, x, y) => {
		const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`; // OSM tiles URL
		const fileUri = `${FileSystem.documentDirectory}tiles/${z}/${x}/${y}.png`;

		// Фолдер үүсгэх
		const dir = fileUri.substring(0, fileUri.lastIndexOf("/"));
		await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

		try {
			const response = await axios.get(url, { responseType: "arraybuffer" });
			await FileSystem.writeAsStringAsync(fileUri, Buffer.from(response.data).toString("base64"), {
				encoding: FileSystem.EncodingType.Base64
			});
			console.log(`Tile saved: ${fileUri}`);
		} catch (error) {
			console.error(`Error downloading tile ${z}/${x}/${y}: `, error);
		}
	};

	// Latitude, Longitude-г x, y утга руу хөрвүүлэх функц
	const latLonToTile = (lat, lon, z) => {
		const x = Math.floor(((lon + 180) / 360) * Math.pow(2, z));
		const y = Math.floor(
			((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
				Math.pow(2, z)
		);
		return { x, y };
	};

	// Бүсийн координатыг оруулах функц
	const downloadTilesForRegion = async (z, latStart, latEnd, lonStart, lonEnd) => {
		const start = latLonToTile(latStart, lonStart, z);
		const end = latLonToTile(latEnd, lonEnd, z);

		console.log("start", start);
		console.log("end", end);
		for (let x = start.x; x <= end.x; x++) {
			for (let y = start.y; y >= end.y; y--) {
				await downloadTile(z, x, y);
			}
		}
	};

	const downloadTiles = () => {
		(async () => {
			const ZOOM_LEVEL = 15;
			const LAT_START = 47.89; // Улаанбаатарын өмнөд хэсэг
			const LAT_END = 47.95; // Улаанбаатарын хойд хэсэг
			const LON_START = 106.85; // Баруун
			const LON_END = 106.99; // Зүүн

			console.log("Starting tile download for Ulaanbaatar...");
			await downloadTilesForRegion(ZOOM_LEVEL, LAT_START, LAT_END, LON_START, LON_END);
			console.log("Tile download completed!");
		})();
	};
	useEffect(() => {
		// Жишээ: Улаанбаатар хотын бүсийн координат (Zoom: 15)
	}, []);

	const loadTiles = async () => {
		const tiles = FileSystem.documentDirectory + "tiles/{z}/{x}/{y}.png";
		console.log("tiles", tiles);

		try {
			const fileInfo = await FileSystem.getInfoAsync(tiles);
			console.log("fileInfo", fileInfo);

			if (fileInfo.exists) {
				const fileData = await FileSystem.readAsStringAsync(tiles);
				console.log("fileData", fileData);

				// setFileContent(fileData);
			} else {
				// setFileContent("No file found!");
				downloadTiles();
			}

			if (tiles) {
				setTileUri(tiles);
			}
		} catch (error) {
			console.error("Error reading file:", error);
		}
	};

	useEffect(() => {
		loadTiles();
	}, []);

	return (
		<SafeAreaView>
			{tileUri ? (
				<MapView
					style={{ flex: 1 }}
					initialRegion={{
						latitude: 47.92123,
						longitude: 106.918556,
						latitudeDelta: 0.1,
						longitudeDelta: 0.1
					}}
				>
					<UrlTile
						urlTemplate={tileUri} // Tiles замыг тохируулна
						maximumZ={15}
					/>
				</MapView>
			) : (
				<Text>LOADING.......</Text>
			)}
		</SafeAreaView>
	);
};

export default TestTilesScreen;

const styles = StyleSheet.create({});
