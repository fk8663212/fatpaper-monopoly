import { App, createApp, VNode, watch } from "vue";
import FPMessageBoxVue from "./fp-message-box.vue";
import { useUtil } from "@/store";
import useEventBus from "@/utils/event-bus";
import { GameEvents } from "@/enums/game";

interface Options extends Record<string, any> {
	title?: string;
	content?: string | VNode | (() => VNode);
	confirmText?: string;
	cancelText?: string;
}

export function FPMessageBox(options: Options) {
	return new Promise((resolve, reject) => {
		showMessageBox(options, resolve, reject);
	});
}

function showMessageBox(options: Options, resolve: (value: unknown) => void, reject: (reason?: any) => void) {
	const fragment = document.createDocumentFragment();
	const messageBoxApp = createApp(FPMessageBoxVue, options) as App<any>;

	const vm = messageBoxApp.mount(fragment);
	document.body.appendChild(fragment);

	// const container = document.createElement("div");
	// document.body.appendChild(container);

	// const messageBoxApp = createApp(FPMessageBoxVue, options) as App<any>;

	//@ts-ignore
	vm.visible = true;

	watch(
		//@ts-ignore
		() => vm.visible,
		(newVal) => {
			if (!newVal) {
				unmount();
			}
		}
	);

	function unmount() {
		messageBoxApp.unmount();
		useEventBus().remove(GameEvents.TimeOut, unmount);
		//@ts-ignore
		console.log(vm.correct);
		//@ts-ignore
		if(vm.answerqr){
			console.log("answerqr");
			//@ts-ignore
			if (vm.correct) {
				resolve("");
			} else {
				reject();
			}
		}else{
			console.log("not answerqr");
			//@ts-ignore
			if (vm.isConfirm) {
				resolve("");
			} else {
				reject();
			}
		}
		
	}

	useEventBus().once(GameEvents.TimeOut, unmount);
}
