import { createDrawerNavigator } from "@react-navigation/drawer";
import { MainStackNavigator } from "./MainStackNavigation";
import MotoHoursAndFuelScreen from "../screens/MotoHourAndFuel/MotoHoursAndFuelScreen";
import { SafeAreaView, ScrollView, Text } from "react-native";
import { useContext, useState } from "react";
import HomeScreenSideBar from "../screens/Sidebar/HomeScreenSideBar";
import HomeScreenSideBarSUB from "../screens/Sidebar/HomeScreenSideBarSUB";
import Constants from "expo-constants";
import { OrientationContext } from "../helper/OrientationContext";

const Drawer = createDrawerNavigator();
export const DrawerNavigation = () => {
	const [sideBarStep, setSideBarStep] = useState(1);
	const [menuType, setMenuType] = useState(null);
	const orientation = useContext(OrientationContext);

	function CustomDrawerContent(props) {
		return (
			<ScrollView
				contentContainerStyle={{
					flexDirection: "column",
					justifyContent: "space-between",
					paddingTop: orientation == "PORTRAIT" ? Constants.statusBarHeight : 20
				}}
				bounces={false}
				showsVerticalScrollIndicator={false}
			>
				<SafeAreaView>
					{sideBarStep == 1 ? (
						<HomeScreenSideBar
							{...props}
							sideBarStep={1}
							setSideBarStep={setSideBarStep}
							menuType={menuType}
							setMenuType={setMenuType}
						/>
					) : null}
					{sideBarStep == 2 ? (
						<HomeScreenSideBarSUB
							{...props}
							sideBarStep={1}
							setSideBarStep={setSideBarStep}
							menuType={menuType}
							setMenuType={setMenuType}
						/>
					) : null}
				</SafeAreaView>
			</ScrollView>
		);
	}

	return (
		<Drawer.Navigator
			initialRouteName="Main"
			drawerContent={(props) => <CustomDrawerContent {...props} />}
			screenOptions={{
				headerShown: false,
				drawerType: "front",
				swipeEnabled: false
			}}
		>
			<Drawer.Screen name="Main" component={MainStackNavigator} />
			<Drawer.Screen name="Settings" component={MotoHoursAndFuelScreen} />
		</Drawer.Navigator>
	);
};
