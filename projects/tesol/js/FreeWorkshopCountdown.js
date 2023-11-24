const component = document.querySelector("#free-workshop-countdown");

const time = component.attributes["data-time"].value;
const timeArray = time.split(" ");
const hour = timeArray[0].split(":");
const date = timeArray[1].split("/").reverse().join("-");

const countDownDate = new Date(date);
countDownDate.setHours(hour[0]);
countDownDate.setMinutes(hour[1]);

const dayDom = component.querySelector("#countdown-day");
const hourDom = component.querySelector("#countdown-hour");
const minuteDom = component.querySelector("#countdown-minute");
const secondDom = component.querySelector("#countdown-second");

setInterval(() => {
	const now = new Date().getTime();
	const distance = countDownDate - now;

	const days = Math.floor(distance / (1000 * 60 * 60 * 24));
	const hours = Math.floor(
		(distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
	);
	const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((distance % (1000 * 60)) / 1000);

	dayDom.setAttribute("style", `--value:${days};`);
	hourDom.setAttribute("style", `--value:${hours};`);
	minuteDom.setAttribute("style", `--value:${minutes};`);
	secondDom.setAttribute("style", `--value:${seconds};`);

	if (distance < 0) {
		dayDom.setAttribute("style", "--value:0;");
		hourDom.setAttribute("style", "--value:0;");
		minuteDom.setAttribute("style", "--value:0;");
		secondDom.setAttribute("style", "--value:0;");
	}
}, 1000);
