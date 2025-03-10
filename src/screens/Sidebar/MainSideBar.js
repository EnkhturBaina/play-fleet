import { StyleSheet, View } from "react-native";
import React from "react";
import HomeScreenSideBar from "./HomeScreenSideBar";
import HomeScreenSideBarSUB from "./HomeScreenSideBarSUB";

const MainSideBar = (props) => {
	return (
		<View>
			{props.sideBarStep == 1 ? <HomeScreenSideBar {...props} /> : null}
			{props.sideBarStep == 2 ? <HomeScreenSideBarSUB {...props} /> : null}
		</View>
	);
};

export default MainSideBar;

const styles = StyleSheet.create({});
