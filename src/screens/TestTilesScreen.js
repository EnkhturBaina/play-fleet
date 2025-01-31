import React, { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import MapView, { UrlTile } from "react-native-maps";
import { useNetworkStatus } from "../contexts/NetworkContext";

// Улаанбаатар хотын төв координатууд
const UB_CENTER_LAT = 47.92123;
const UB_CENTER_LON = 106.918556;
const ZOOM_LEVEL = 15; // Zoom-ний түвшин
const LAT_START = 47.89; // Улаанбаатарын өмнөд хэсэг
const LAT_END = 47.95; // Улаанбаатарын хойд хэсэг
const LON_START = 106.85; // Баруун
const LON_END = 106.99; // Зүүн

var Buffer = require("buffer/").Buffer;

const TestTilesScreen = (props) => {
	const { isConnected } = useNetworkStatus();
	const [tileUri, setTileUri] = useState(null); // MapView-д зориулсан tile URI
	const [tilesReady, setTilesReady] = useState(false); // Tiles-үүд бэлэн болсныг шалгах
	const [progress, setProgress] = useState(null);

	// Latitude, Longitude-г x, y координат руу хөрвүүлэх
	const latLonToTile = (lat, lon, z) => {
		const x = Math.floor(((lon + 180) / 360) * Math.pow(2, z));
		const y = Math.floor(
			((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
				Math.pow(2, z)
		);
		return { x, y };
	};

	// Газрын зурагны tile татаж хадгалах
	const downloadTile = async (z, x, y) => {
		const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`; // OSM tiles URL
		const fileUri = `${FileSystem.documentDirectory}tiles4/${z}/${x}/${y}.png`;

		// Фолдер үүсгэх
		const dir = fileUri.substring(0, fileUri.lastIndexOf("/"));
		await FileSystem.makeDirectoryAsync(dir, { intermediates: true });

		try {
			const response = await axios.get(url, { responseType: "arraybuffer" });
			await FileSystem.writeAsStringAsync(fileUri, Buffer.from(response.data).toString("base64"), {
				encoding: FileSystem.EncodingType.Base64
			});
			console.log(`Tile saved: ${fileUri}`);
			setProgress(`Tile saved z:${z} x:${x} y:${y}`);
		} catch (error) {
			console.error(`Error downloading tile ${z}/${x}/${y}: `, error);
			setProgress(`Error downloading tile`);
		}
	};

	// Бүсийн координатын tile-уудыг татаж хадгалах
	const downloadTilesForRegion = async (z, latStart, latEnd, lonStart, lonEnd) => {
		const start = latLonToTile(latStart, lonStart, z);
		const end = latLonToTile(latEnd, lonEnd, z);

		console.log("start", start);
		console.log("end", end);
		for (let x = start.x; x <= end.x; x++) {
			for (let y = end.y; y <= start.y; y++) {
				await downloadTile(z, x, y);
			}
		}
	};

	// Хадгалсан tiles-ийг шалгах
	const loadTiles = async () => {
		const start = latLonToTile(LAT_START, LON_START, ZOOM_LEVEL);
		const end = latLonToTile(LAT_END, LON_END, ZOOM_LEVEL);
		let allTilesExist = true;

		// Бүх tile-ууд хадгалагдсан эсэхийг шалгах
		for (let x = start.x; x <= end.x; x++) {
			for (let y = end.y; y <= start.y; y++) {
				const tileUri = `${FileSystem.documentDirectory}tiles4/${ZOOM_LEVEL}/${x}/${y}.png`;
				const fileInfo = await FileSystem.getInfoAsync(tileUri);
				// console.log("fileInfo", fileInfo);
				if (!fileInfo.exists) {
					allTilesExist = false;
					break;
				}
			}
			if (!allTilesExist) break;
		}

		// Хэрэв бүх tile-ууд хадгалагдсан бол Map-д харуулна
		if (allTilesExist) {
			setTileUri(`${FileSystem.documentDirectory}tiles4/{z}/{x}/{y}.png`);
			setProgress("Tiles loaded storage");
			setTilesReady(true);
		} else {
			console.log("Tiles not found, downloading...");
			setProgress("Tiles not found, downloading...");
			downloadTiles(); // Хэрвээ байхгүй бол дахин татаж авах
		}
	};

	// Улаанбаатарын бүсийн tiles-ийг татах
	const downloadTiles = async () => {
		console.log("Starting tile download for Ulaanbaatar...");
		setProgress("Starting tile download for Ulaanbaatar...");
		await downloadTilesForRegion(ZOOM_LEVEL, LAT_START, LAT_END, LON_START, LON_END);
		console.log("Tile download completed!");
		setProgress("Tile download completed!");
		setTilesReady(true);
		setTileUri(`${FileSystem.documentDirectory}tiles4/{z}/{x}/{y}.png`);
	};

	useEffect(() => {
		loadTiles(); // Компьютер үүсэнгүүтээ tile-уудыг шалгах
	}, []);

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<TouchableOpacity
				style={{ marginTop: 100, height: 50, marginLeft: 20 }}
				onPress={() => {
					props.navigation.goBack();
				}}
			>
				{isConnected ? (
					<Text style={{ color: "green" }}>isConnected: true</Text>
				) : (
					<Text style={{ color: "red" }}>isConnected: false</Text>
				)}
				<Text style={{}}>Tile status: {progress}</Text>
			</TouchableOpacity>
			{tilesReady ? (
				<MapView
					style={{ flex: 1 }}
					initialRegion={{
						latitude: UB_CENTER_LAT,
						longitude: UB_CENTER_LON,
						latitudeDelta: 0.1,
						longitudeDelta: 0.1
					}}
				>
					<UrlTile
						urlTemplate={tileUri} // Урл замыг хэрэглэнэ
						maximumZ={ZOOM_LEVEL}
						tileSize={256}
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
