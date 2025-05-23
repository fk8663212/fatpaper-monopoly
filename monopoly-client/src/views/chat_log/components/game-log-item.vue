<script setup lang="ts">
import { GameLog } from "@/interfaces/bace";
import playerCard from "@/views/game/components/player-card.vue";
import propertyInfoCard from "@/views/game/utils/components/property-info-card.vue";
import chanceCard from "@/views/game/components/chance-card.vue";
import arrivedEventCard from "@/views/game/utils/components/arrived-event-card.vue";
import { GameLinkItem } from "@/enums/game";
import { useDeviceStatus, useGameInfo, useMapData } from "@/store";
import { App, Component, computed, createApp, h, ref, render, toRaw } from "vue";
import { ArrivedEvent, ChanceCardInfo, PlayerInfo, Property, PropertyInfo } from "@/interfaces/game";

const props = defineProps<{ gameLog: GameLog }>();
const gameInfoStore = useGameInfo();
const mapInfoStroe = useMapData();

enum GameLogType {
	Text,
	Link,
}

type LinkItemDataMap = {
	[GameLinkItem.ArrivedEvent]: ArrivedEvent;
	[GameLinkItem.Property]: PropertyInfo;
	[GameLinkItem.Player]: PlayerInfo;
	[GameLinkItem.ChanceCard]: ChanceCardInfo;
};

type LinkDataItem = { type: GameLinkItem; data: LinkItemDataMap[GameLinkItem]; text: string; color: string };

type GameLogContent = {
	[GameLogType.Text]: string;
	[GameLogType.Link]: LinkDataItem;
};

type ParsedGameLog = { type: GameLogType; content: GameLogContent[GameLogType] };

const gameLogArr = ref<ParsedGameLog[]>(handleGameLog(props.gameLog));

function handleGameLog(gameLog: GameLog) {
	const regex = /@-#(.*?)#-#(.*?)#/g;
	const parts: ParsedGameLog[] = [];
	let lastIndex = 0;

	gameLog.content.replace(regex, (match, type: GameLinkItem, id: string, offset: number) => {
		// 添加文本部分
		if (lastIndex < offset) {
			parts.push({ type: GameLogType.Text, content: gameLog.content.slice(lastIndex, offset) });
		}

		if (type && id) {
			let item: LinkDataItem | null = null;

			switch (type) {
				case GameLinkItem.ArrivedEvent:
					const arrivedEvent = toRaw(mapInfoStroe.getArrivedItemInfoById(id));
					if (arrivedEvent) {
						item = { type, data: arrivedEvent, text: arrivedEvent.name, color: "var(--color-second)" };
					}
					break;

				case GameLinkItem.ChanceCard:
					const chanceCard = toRaw(mapInfoStroe.getChanceCardInfoById(id));
					if (chanceCard) {
						item = { type, data: chanceCard, text: chanceCard.name, color: chanceCard.color };
					}
					break;

				case GameLinkItem.Player:
					const player = toRaw(gameInfoStore.getPlayerInfoById(id));
					if (player) {
						item = { type, data: player, text: player.user.username, color: player.user.color };
					}
					break;

				case GameLinkItem.Property:
					const property = toRaw(gameInfoStore.getPropertyById(id));
					if (property) {
						item = {
							type,
							data: property,
							text: property.name,
							color: property.owner ? property.owner.color : "var(--color-second)",
						};
					}
					break;

				default:
					break;
			}

			if (item) {
				parts.push({ type: GameLogType.Link, content: item });
			} else {
				parts.push({ type: GameLogType.Text, content: match }); // 如果没有找到对应项，保留原始匹配
			}
		}

		lastIndex = offset + match.length; // 更新上一个匹配的索引
		return match; // 继续替换
	});

	// 添加最后一段文本
	if (lastIndex < gameLog.content.length) {
		parts.push({ type: GameLogType.Text, content: gameLog.content.slice(lastIndex) });
	}

	return parts;
}

function generatePopItem(e: MouseEvent, itemType: GameLinkItem, props: any) {
	const x = e.clientX;
	const y = e.clientY;
	let compoentToRender: Component | null = null;
	let compoentProps: { [key: string]: any } | null = null;
	switch (itemType) {
		case GameLinkItem.ArrivedEvent:
			compoentToRender = arrivedEventCard;
			compoentProps = { arrivedEvent: props };
			break;
		case GameLinkItem.ChanceCard:
			compoentToRender = chanceCard;
			compoentProps = { chanceCard: props, disable: false };
			break;
		case GameLinkItem.Player:
			compoentToRender = playerCard;
			compoentProps = { player: props, roundMark: false };
			break;
		case GameLinkItem.Property:
			compoentToRender = propertyInfoCard;
			compoentProps = { property: props };
			break;
	}
	const documentFragment = document.createDocumentFragment();
	const appInstance = createApp(compoentToRender, compoentProps) as App<any>;

	const vm = appInstance.mount(documentFragment);
	const el = vm.$el as HTMLElement;
	el.style.position = "absolute";
	el.style.zIndex = "1000000";
	el.style.left = x - 20 + "px";
	el.style.bottom = document.body.clientHeight - y - 20 + "px";
	el.style.boxShadow = "var(--box-shadow)";
	if (useDeviceStatus().isMobile) {
		window.addEventListener("touchend", unMount, { once: true });
	} else {
		el.addEventListener("mouseleave", unMount, { once: true });
	}
	document.body.appendChild(documentFragment);

	function unMount() {
		appInstance.unmount();
	}
}

const logTime = computed(() => {
	const date = new Date(props.gameLog.time); // 创建 Date 对象
	const hours = String(date.getUTCHours()).padStart(2, "0"); // 获取小时并补零
	const minutes = String(date.getUTCMinutes()).padStart(2, "0"); // 获取分钟并补零
	const seconds = String(date.getUTCSeconds()).padStart(2, "0"); // 获取秒并补零

	return `${hours === "00" ? "" : hours + ":"}${minutes}:${seconds}`; // 返回格式化后的字符串
});
</script>

<template>
	<div class="game-log-item">
		<span class="time">{{ logTime }}:</span>
		<template v-for="log in gameLogArr">
			<span v-if="log.type === GameLogType.Text" class="text-item">{{ log.content }}</span>
			<span
				v-else
				class="link-item"
				:style="{color: (log.content as LinkDataItem).color}"
				@click="generatePopItem($event, (log.content as LinkDataItem).type, (log.content as LinkDataItem).data)"
			>
				{{ (log.content as LinkDataItem).text }}
			</span>
		</template>
	</div>
</template>

<style lang="scss" scoped>
.game-log-item {
	margin-bottom: .3rem;
	color: #4d4d4d;
	& > .time {
		margin-right: .5rem;
	}
	& > .text-item {
		color: var(--color-primary);
	}
	& > .link-item {
		text-decoration: underline;
		cursor: pointer;
	}
}
</style>
