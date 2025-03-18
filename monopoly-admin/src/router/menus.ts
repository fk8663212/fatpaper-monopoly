import { Component } from "vue";

interface menuItem {
	path: string;
	menuName: string;
	name: string;
	component: Component;
	icon: string;
}

interface staticRouteItem {
	path: string;
	name: string;
	component: Component;
}

export const menus: menuItem[] = [
	{
		path: "/dashboard",
		menuName: "控制台",
		name: "dashboard",
		component: () => import("@/views/manage/dashboard/dashboard.vue"),
		icon: "gauge",
	},
	{
		path: "/game",
		menuName: "遊戲紀錄",
		name: "game",
		component: () => import("@/views/manage/game/game.vue"),
		icon: "game-controller",
	},
	{
		path: "/role",
		menuName: "遊戲角色管理",
		name: "role",
		component: () => import("@/views/manage/role-manage/role-manage.vue"),
		icon: "crown",
	},
	{
		path: "/map",
		menuName: "地圖管理",
		name: "map",
		component: () => import("@/views/manage/map-manage/map-manage.vue"),
		icon: "map-location-dot",
	},
	{
		path: "/model",
		menuName: "模型管理",
		name: "model",
		component: () => import("@/views/manage/model-manage/model-manage.vue"),
		icon: "box",
	},
	{
		path: "/chance-card",
		menuName: "機會卡管理",
		name: "chance-card",
		component: () => import("@/views/manage/chance-card-manage/chance-card-manage.vue"),
		icon: "credit-card",
	},
	{
		path: "/arrived-event",
		menuName: "到達事件管理",
		name: "arrived-event",
		component: () => import("@/views/manage/arrived-event-manage/arrived-event-manage.vue"),
		icon: "wand-magic-sparkles",
	},
	{
		path: "/music",
		menuName: "音樂管理",
		name: "music",
		component: () => import("@/views/manage/music-manage/music-manage.vue"),
		icon: "headset",
	},
	{
		path: "/user",
		menuName: "使用者管理",
		name: "user",
		component: () => import("@/views/manage/user-manage/user-manage.vue"),
		icon: "account",
	},
];

export const staticRoute: staticRouteItem[] = [
	{
		path: "/map-editor",
		name: "map-editor",
		component: () => import("@/views/manage/map-manage/components/map-editor/map-editor.vue"),
	},
	{
		path: "/chance-card-editor",
		name: "chance-card-editor",
		component: () => import("@/views/manage/chance-card-manage/components/chance-card-editor.vue"),
	},
	{
		path: "/arrived-event-editor",
		name: "arrived-event-editor",
		component: () => import("@/views/manage/arrived-event-manage/components/arrived-event-editor.vue"),
	},
];
