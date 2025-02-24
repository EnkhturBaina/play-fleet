import { useEffect } from "react";
import { Alert } from "react-native";
import dayjs from "dayjs";

const scheduleAlert = (props) => {
	// Эхний хугацаа
	const eventTime = dayjs("2025-02-02 19:00:26");

	// 20 минутын өмнөх цаг (18:40:26)
	const alertTime = eventTime.subtract(20, "minute");

	// Одоогийн цагийг авах
	const now = dayjs();

	// Хугацааны зөрүүг миллисекундээр тооцох
	const timeDifference = alertTime.diff(now);

	if (timeDifference > 0) {
		setTimeout(() => {
			Alert.alert("Сануулга", "20 минутын дараа таны төлөвийн цаг болно!", [{ text: "Ойлголоо", style: "cancel" }]);
			console.log("Alert харууллаа:", alertTime.format("YYYY-MM-DD HH:mm:ss"));
		}, timeDifference);
	} else {
		console.log("Alert цаг аль хэдийн өнгөрсөн байна.");
	}
};

// React Native Component
const ShiftAlertComponent = () => {
	useEffect(() => {
		scheduleAlert();
	}, []);

	return null;
};

export default ShiftAlertComponent;
