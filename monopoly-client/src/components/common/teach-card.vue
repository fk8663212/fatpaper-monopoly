<script setup lang="ts">
import { PropertyInfo,Question } from "@/interfaces/game";
import { PropertyLevel } from "@/utils/var";
import { computed, ref } from "vue";

const { question } = defineProps<{ question: Question | null }>();

// const _propertyBuildLevelColor = computed(() => PropertyLevel[_property.value?.buildingLevel || 0].color);
// const _propertyBuildLevelName = computed(() => PropertyLevel[_property.value?.buildingLevel || 0].name);
// const _property = ref<PropertyInfo | null>(property);
const _question = ref<Question | null>(question);
</script>

<template>
	<div class="question-info" v-if="_question">
		<div class="question">
			<span class="data">{{ _question.question }}</span>
		</div>
		<div class="A">
			<span class="label">A</span><span class="data">{{ _question.A }}</span>
		</div>
		<div class="B">
			<span class="label">B</span><span class="data">{{ _question.B }}</span>
		</div>
		<div class="C">
			<span class="label">C</span><span class="data">{{ _question.C }}</span>
		</div>
		<div class="D">
			<span class="label">D</span><span class="data">{{ _question.D }}</span>
		</div>
		<!-- <div class="name">
			<span class="data">{{ _property.name }}</span>
		</div>

		<div class="buildingLevel">
			<span class="label">当前建筑等级</span
			><span class="data" :style="{ color: _propertyBuildLevelColor }">{{ _propertyBuildLevelName }}</span>
		</div>
		<div class="buildCost">
			<span class="label">升级费用</span><span class="data">{{ _property.buildCost }}</span>
		</div>
		<div class="sellCost">
			<span class="label">空地价格</span><span class="data">{{ _property.sellCost }}</span>
		</div>
		<div class="cost_lv0">
			<span class="label">{{ PropertyLevel[0].name }}过路费</span><span class="data">{{ _property.cost_lv0 }}</span>
		</div>
		<div class="cost_lv1">
			<span class="label">{{ PropertyLevel[1].name }}过路费</span><span class="data">{{ _property.cost_lv1 }}</span>
		</div>
		<div class="cost_lv2">
			<span class="label">{{ PropertyLevel[2].name }}过路费</span><span class="data">{{ _property.cost_lv2 }}</span>
		</div> -->
	</div>
</template>

<style lang="scss" scoped>
.question-info {
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;

	& > .name > .data {
		text-align: center;
		font-size: 1.5rem;
		color: var(--color-primary);
	}

	& > div {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 1.1rem;
		width: 100%;
		margin-bottom: 1rem;

		& > .label {
			flex: 1;
			text-align: center;
			left: 5px;
		}

		& > .data {
			flex: 1;
			text-align: center;
			color: var(--color-second);
			text-shadow: var(--text-shadow);
		}
	}
}
</style>
