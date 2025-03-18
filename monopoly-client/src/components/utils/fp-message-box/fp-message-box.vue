<script setup lang="ts">
import { ref, onMounted, VNode, render, isVNode } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

export interface Props {
	title?: string;
	content?: any;
	confirmText?: string;
	cancelText?: string;
	A?: string;
	B?: string;
	C?: string;
	D?: string;
	
}
const props = withDefaults(defineProps<Props>(), {
	title: "Message Box",
	content: "test",
	confirmText: "确认",
	cancelText: "取消",
	A: "A",
	B: "B",
	C: "C",
	D: "D",
});

const ContentContainer = ref<HTMLElement | null>(null);
const visible = ref(false);
const isConfirm = ref(false);
const correct = ref(false);
const answerqr = ref(false);

function handleCancle(){
	answerqr.value = false;
	isConfirm.value = false;
	visible.value = false;
};
function handleConfirm(){
	answerqr.value = false;
	isConfirm.value = true;
	visible.value = false;
};
function checkAnswer(choose:string){
	answerqr.value = true;
	var answer = props.content.props.question.answer;
	console.log(props.content.props.question.answer);
	if(choose == answer){
		correct.value = true;
	}else{
		correct.value = false;
	}
	console.log("答案是否正確"+correct.value);
	visible.value = false;
}

onMounted(() => {
	if (typeof props.content !== "string") {
		const vnode = props.content;
		if (isVNode(vnode) && ContentContainer.value) {
			render(vnode, ContentContainer.value);
		}
	}
});

defineExpose({
	visible,
	isConfirm,
	correct,
	answerqr,
});
</script>

<template>
	<div class="fp-message-box__overlay" v-show="visible">
		<div class="fp-message-box">
			<div class="fp-message-box__title">
				<span>{{ title }}</span>
				<!-- <FontAwesomeIcon @click="handleCancle" class="close__btn" icon="close"></FontAwesomeIcon> -->
			</div>
			<div ref="ContentContainer" class="fp-message-box__content"></div>
			<div class="fp-message-box__footer">
				<button v-if="confirmText && confirmText !== '@'" class="confirm__btn" @click="handleConfirm">{{ confirmText }}</button>
				<button v-if="cancelText && cancelText !== '@'" class="cancle__btn" @click="handleCancle">{{ cancelText }}</button>
				<button v-if="D && D !== '@'" class="D__btn" @click="checkAnswer(D)">{{ D }}</button>
				<button v-if="C && C !== '@'" class="C__btn" @click="checkAnswer(C)">{{ C }}</button>
				<button v-if="B && B !== '@'" class="B__btn" @click="checkAnswer(B)">{{ B }}</button>
				<button v-if="A && A !== '@'" class="A_btn" @click="checkAnswer(A)">{{ A }}</button>
				
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.fp-message-box__overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 999;
	background-color: rgba($color: #000000, $alpha: 0.3);

	& > .fp-message-box {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		min-width: 26rem;
		min-height: 16rem;
		background-color: var(--color-bg-light);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border-radius: 0.6rem;
		box-shadow: var(--box-shadow);
		overflow: hidden;
		z-index: 4001;
	}
}

.fp-message-box__title {
	font-size: 1.4rem;
	height: 2.4rem;
	line-height: 2.4rem;
	background-color: var(--color-third);
	color: var(--color-text-white);
	padding: 0 0.5rem;
	display: flex;
	justify-content: space-between;
	align-items: center;
	text-shadow: var(--text-shadow);

	& > .close__btn {
		cursor: pointer;
	}
}

.fp-message-box__content {
	flex: 1;
	padding: 1.2rem 0.5rem;
}

.fp-message-box__footer {
	width: 100%;
	padding: 0.5rem;
	box-sizing: border-box;

	& > button {
		float: right;
		padding: 0.5rem 1rem;
		border-radius: 0.3rem;
		margin-left: 0.6rem;
	}
}
</style>
