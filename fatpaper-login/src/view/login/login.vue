<script setup lang="ts">
import { apiLogin, apiRegister, getPublicKey } from "@/utils/api";
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import FPMessage from "@/components/fp-message";
import { getEncryption } from "@/utils";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import axios from "axios";
import { useRouter } from "vue-router";

const router = useRouter();

// 在组件挂载后获取公钥，并添加全局消息监听器
onMounted(() => {
	getPublicKey();
	window.addEventListener("message", handleMessage);
});

onBeforeUnmount(() => {
	window.removeEventListener("message", handleMessage);
});

// 消息监听函数：处理 popup 窗口传回的登录成功信息
function handleMessage(event: MessageEvent) {
	console.log("event", event);
	// 可根据实际情况校验 event.origin
	if (event.data && event.data.type === "login_success") {
		const { token, user } = event.data;
		localStorage.setItem("token", token);
		localStorage.setItem("user", JSON.stringify(user));
		//確認是否成功保存token
		console.log("token:", localStorage.getItem("token"));
		console.log("user:", localStorage.getItem("user"));
		// 跳转到游戏房间页面
		console.log("跳转到游戏房间页面");
		//router.push("/room-router");
		if (token) {
			window.top && window.top.postMessage(token, "*");
		}
		// if (router && router.push) {
      	// 	router.push("/");
    	// } 
		// else {
      	// 	console.error("Router is undefined!");
    	// }
	}
}

const isLoading = ref(false);
const title = "FatPaper的小窩";
const avatarFile = ref<File | undefined>();

const loginForm = reactive({
	useraccount: "",
	password: "",
});

const registerForm = reactive({
	useraccount: "",
	username: "",
	password: "",
	confirmPassword: "",
	avatar: "",
	color: "#000000",
});

function handleFileChange(event: Event) {
	const target = event.target as HTMLInputElement;
	const file = target.files?.[0];

	if (file) {
		avatarFile.value = file;
		const reader = new FileReader();
		reader.onload = (e) => {
			registerForm.avatar = (e.target?.result as string) || "";
		};
		reader.readAsDataURL(file);
	} else {
		registerForm.avatar = "";
	}
}

function resetRegisterForm() {
	registerForm.useraccount = "";
	registerForm.username = "";
	registerForm.password = "";
	registerForm.confirmPassword = "";
	registerForm.avatar = "";
	registerForm.color = "#000000";
}

const handleRegister = async () => {
	isLoading.value = true;
	if (
		!(
			registerForm.avatar &&
			registerForm.useraccount &&
			registerForm.username &&
			registerForm.password &&
			registerForm.confirmPassword
		)
	) {
		FPMessage({
			type: "warning",
			message: "表单没填完 我怎么帮你注册😡",
		});
		isLoading.value = false;
		return;
	}
	if (registerForm.password === registerForm.confirmPassword) {
		const formData = new FormData();
		const epassword = await getEncryption(registerForm.password);
		if (epassword && avatarFile.value) {
			formData.append("avatar", avatarFile.value);
			formData.append("useraccount", registerForm.useraccount);
			formData.append("username", registerForm.username);
			formData.append("password", epassword.toString());
			formData.append("color", registerForm.color);
			try {
				if (await apiRegister(formData)) {
					loginForm.useraccount = registerForm.useraccount;
					resetRegisterForm();
					loginMode.value = true;
				}
			} finally {
				isLoading.value = false;
			}
		}
	} else {
		FPMessage({
			type: "error",
			message: "两次输入的密码不一样",
		});
		registerForm.confirmPassword = "";
	}
	isLoading.value = false;
};

async function handleLogin() {
	isLoading.value = true;
	if (!(loginForm.useraccount && loginForm.password)) {
		FPMessage({
			type: "warning",
			message: "表单没填完 你想怎么登录😡",
		});
		isLoading.value = false;
		return;
	}
	try {
		const token = await apiLogin(loginForm.useraccount, loginForm.password);
		if (token) {
			// 这里如果是传统登录，可以通过 postMessage 通知父窗口
			window.top && window.top.postMessage(token, "*");
		}
	} finally {
		isLoading.value = false;
	}
}

// Google 登录：打开 popup 窗口进行 Google 登录
async function loginWithGoogle() {
  const googleLoginWindow = window.open(
    "http://localhost:83/auth/google",
    "googleLogin",
    "width=500,height=600"
  );
  if (!googleLoginWindow) {
    FPMessage({
      type: "error",
      message: "无法打开 Google 登录窗口",
    });
  }
}

const loginMode = ref(true);
</script>

<template>
	<div class="login-page">
		<div class="title">
			<span :data-content="title">{{ title }}</span>
		</div>
		<!-- <Transition name="change"> -->
		<div class="form-container">
			<div v-if="loginMode" class="login-form">
				<div class="mode_tag">登录小窝</div>
				<div class="form-item">
					<span class="lable">账号</span>
					<input autocomplete="off" class="fp-input" type="text" id="useraccount" v-model="loginForm.useraccount" />
				</div>
				<div class="form-item">
					<span class="lable">密码</span>
					<input autocomplete="off" class="fp-input" type="password" id="password" v-model="loginForm.password" />
				</div>

				<div class="tip">
					<span>没有账号？点击<span @click="loginMode = false">注册</span></span>
				</div>

				<div class="login-container">
				<!-- 其他登录方式按钮 -->
				<button @click="loginWithGoogle" class="google-login-btn">
				使用 Google 帳號登入
				</button>
			</div>

				<button :disabled="isLoading" @click="handleLogin" class="submit-button">
					<FontAwesomeIcon v-if="isLoading" icon="spinner" spin />
					<span v-else>登录</span>
				</button>
			</div>

			<div v-else class="register-form">
				<div class="mode_tag">注册新账号</div>
				<div class="avatar_user-container">
					<div class="form-item">
						<span class="lable">头像</span>
						<label for="avatar">
							<div class="avatar_preview-container">
								<img v-if="registerForm.avatar" class="avatar_preview" :src="registerForm.avatar" />
							</div>
						</label>
						<input
							style="display: none"
							@change="handleFileChange"
							id="avatar"
							accept=".png,.jpg,.jpeg"
							class="fp-input avatar"
							type="file"
						/>
					</div>
					<div class="form-item">
						<span class="lable">用户名</span>
						<input autocomplete="off" class="fp-input" type="text" id="username" v-model="registerForm.username" />
					</div>
				</div>
				<div class="form-item">
					<span class="lable">账号(用于登录)</span>
					<input autocomplete="off" class="fp-input" type="text" id="useraccount" v-model="registerForm.useraccount" />
				</div>
				<div class="form-item">
					<span class="lable">密码</span>
					<input autocomplete="off" class="fp-input" type="password" id="password" v-model="registerForm.password" />
				</div>
				<div class="form-item">
					<span class="lable">确认密码</span>
					<input
						autocomplete="off"
						class="fp-input"
						type="password"
						id="confirmPassword"
						v-model="registerForm.confirmPassword"
					/>
				</div>
				<div class="form-item">
					<span class="lable">代表颜色</span>
					<input class="fp-input" type="color" id="color" v-model="registerForm.color" />
				</div>

				<div class="tip">
					<span>已有账号？点击<span @click="loginMode = true">登录</span></span>
				</div>

				<button :disabled="isLoading" @click="handleRegister" class="submit-button">
					<FontAwesomeIcon v-if="isLoading" icon="spinner" spin />
					<span v-else>注册</span>
				</button>
			</div>
		</div>

		<!-- </Transition> -->
	</div>
</template>


<style lang="scss" scoped>
.login-page {
	display: flex;
	flex-direction: column;
	align-items: center;

	@media screen and (max-width: 900px) {
	}

	@media screen and (max-height: 600px) {
		flex-direction: row;
		.title {
			margin: 0 1.5rem;
		}
		.form-container {
			margin: 0 1.5rem;
		}
	}
}

.form-container {
	flex: 1;
	display: flex;
	align-items: center;
	margin-bottom: calc(2rem + 10px);
}

.form-item {
	display: flex;
	flex-direction: column;

	input {
		width: 100%;
		margin: 0.3rem 0;
		height: 2.5rem;
		font-size: 1.2rem;
		color: var(--color-primary);
	}

	#color {
		padding: 0.3rem 0.7rem;
	}

	span.lable {
		display: block;
		font-size: 1.3rem;
		margin-bottom: 0;
		color: #ffffff;
		text-shadow: 2px 2px 2px var(--color-primary);
	}
}

.login-form,
.register-form {
	position: relative;
	box-shadow: var(--box-shadow);
}

.mode_tag {
	height: 2.8rem;
	position: absolute;
	left: 50%;
	top: 0;
	transform: translate(-50%, -50%);
	z-index: 10;
	margin: 0;
	font-size: 1.8rem;
	background-color: var(--color-primary);
	display: flex;
	text-align: center;
	align-items: center;
	color: #ffffff;
	border-radius: 0.5rem;
	padding: 0.2rem 1rem;
	user-select: none;
	box-shadow: var(--box-shadow);
}

.tip {
	text-align: right;

	& > span {
		margin-left: auto;
		font-size: 0.8rem;
		color: var(--color-text-second);
		user-select: none;

		& > span {
			color: var(--color-primary);
			border-bottom: 0.1rem solid var(--color-primary);
			cursor: pointer;
		}
	}
}

.login-form {
	width: 26rem;
	padding: 1.8rem 1.25rem;
	padding-top: 2rem;
	border-radius: 1rem;
	background-color: rgba(255, 255, 255, 0.7);

	& input {
		height: 3rem;
	}

	& span.lable {
		font-size: 1.5rem;
	}

	& > .form-item,
	& > .tip {
		margin: 0.5rem 0;
	}

	& > .submit-button {
		width: 100%;
		padding: 0.6rem;
		border-radius: 0.8rem;
		font-size: 1.6rem;
	}
}

.register-form {
	$avatar_size: 4rem;
	width: 26rem;
	padding: 1.4rem 1.25rem;
	padding-top: 2rem;
	border-radius: 1rem;
	background-color: rgba(255, 255, 255, 0.7);

	& #username {
		height: $avatar_size;
		font-size: calc($avatar_size / 2);
		border-radius: 1.2rem;
		padding: 0 0.8rem;
	}

	& > .avatar_user-container {
		display: flex;

		& .avatar_preview-container {
			width: $avatar_size;
			height: $avatar_size;
			border-radius: 1rem;
			border: 0.3rem solid rgba(255, 255, 255);
			background-color: rgba(255, 255, 255, 0.8);
			margin-right: 0.6rem;
			margin-top: 0.3rem;
			cursor: pointer;
			overflow: hidden;
			box-sizing: border-box;

			& > img {
				width: 100%;
				height: 100%;
			}
		}

		& > div {
			display: flex;
			flex-direction: column;
		}
	}

	& > .form-item,
	& > .tip {
		margin: 0.4rem 0;
	}

	& > .submit-button {
		width: 100%;
		padding: 0.4rem;
		border-radius: 0.8rem;
		font-size: 1.4rem;
	}
}

.change-enter-active,
.change-leave-active {
	transition: opacity 0.5s ease;
}

.change-enter-from,
.change-leave-to {
	opacity: 0;
}

.title {
	margin-top: 1.5rem;
	user-select: none;
	text-align: center;

	& > span {
		font-size: 6em;
		color: #ffffff;
		letter-spacing: 0.1em;
		display: block;
		position: relative;

		&::before,
		&::after {
			content: attr(data-content);
		}

		&:before,
		&:after {
			position: absolute;
			left: 0;
			top: 0;
		}

		&:before {
			color: var(--color-primary);
			z-index: -1;
			animation: rotate1 5s ease-in-out infinite;
		}

		&:after {
			color: #7e7e7e;
			z-index: -2;
			animation: rotate2 5s ease-in-out infinite;
		}
	}

	@keyframes rotate1 {
		0%,
		100% {
			-webkit-transform: translate3d(3px, 3px, 3px);
			transform: translate3d(3px, 3px, 3px);
		}

		50% {
			-webkit-transform: translate3d((-3px, 3px, -3px));
			transform: translate3d((-3px, 3px, -3px));
		}
	}

	@keyframes rotate2 {
		0%,
		100% {
			-webkit-transform: translate3d(5px, 5px, 5px);
			transform: translate3d(5px, 5px, 5px);
		}

		50% {
			-webkit-transform: translate3d((-5px, 5px, -5px));
			transform: translate3d((-5px, 5px, -5px));
		}
	}
}
.google-login-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  border-radius: 4px;
}
.google-login-btn:hover {
	background-color: #357ae8;
}

</style>
