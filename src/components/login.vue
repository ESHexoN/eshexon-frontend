<template>
    <v-app>
        <v-main>
            <div class="app pr_app login">
                <h1 class="text-h4">登录 ESHexoN</h1>
                <div class="more">
                
                    <div class="form">
                        <v-col class="select-v"
                            cols="12"
                            >
                            <v-text-field
                                :label="username"
                                v-model="l_username"
                                outlined
                            ></v-text-field>
                        </v-col>
                        <v-col class="select-v"
                            cols="12"
                            >
                            <v-text-field
                                :label="password"
                                v-model="l_password"
                                outlined
                                type="password"
                            ></v-text-field>
                        </v-col>
                        <v-col class="select-v"
                            cols="12"
                            >
                            <v-text-field
                                :label="backend"
                                v-model="l_burl"
                                outlined
                                type="url"
                            ></v-text-field>
                        </v-col>
                        <v-btn id="clk_btn" @click="login" depressed 
                        :loading="clk_load" :disabled="clk_load">
                            登录
                        </v-btn>

                        <p style="opacity: 0.8;margin-top: 20px;">如果您尚未注册账号，请<router-link to="/reg/">注册</router-link>。</p>
                    </div>
                </div>
            </div>
            <v-alert
            class="alert"
                border="left"
                elevation="3"
                :type="alertType"
                v-text="alertText"
                v-show="alertShow"
            ></v-alert>
        </v-main>
    </v-app>
</template>

<script>
import i18n from '../i18n';
import md5 from 'js-md5';
var Lang = i18n("auto", "login");
Lang.title = "登录 ESHexoN";
Lang.alertText = Lang.alertType= Lang.l_password = Lang.l_username = null;
Lang.alertShow = false;
Lang.clk_load = false;
Lang.l_burl = localStorage.getItem("backend_url") || "";
document.title = i18n("auto", "login")["title"];
export default {
    name: "CKY",

    components: {},

    data: () => (Lang),

    methods: {
        async login() {
            let bkendUrl = new URL(this.l_burl);
            let username = this.l_username;
            let password = this.l_password;
            if (!username || !password || !bkendUrl) {
                this.alertType = "error",
                this.alertText = "用户名、密码或后端地址不可为空";
                this.alertShow = true;
                return false;
            }
            bkendUrl = `${bkendUrl.protocol}//${bkendUrl.host}${bkendUrl.port ? ":" + bkendUrl.port : ""}`;
            localStorage.setItem("backend_url", bkendUrl);
            
            this.clk_load = true;
            password = md5(password);
            let f_d = await fetch(bkendUrl + "/api/login", {
                method: "POST",
                body: JSON.stringify({
                    username,
                    password,
                }),
            }).then(res => res.json());
            if (f_d.statusCode == 200) {
                this.clk_load = false;
                this.alertType = "success",
                this.alertText = "登录成功";
                this.alertShow = true;
                localStorage.setItem("login_token", f_d.statusInfo);
                setTimeout(() => {this.$router.push("/")}, 1500);
                return true;
            } else {
                this.clk_load = false;
                this.alertType = "error",
                this.alertText = "登录失败，"+f_d.statusInfo;
                this.alertShow = true;
                setTimeout(() => {this.alertShow = false}, 1500);
            }
        }
    }
};

// document.onkeydown = (e) => {
//     if (e.keyCode == 13) {
//         document.getElementById("clk_btn").click();
//     }
// }
</script>

<style>
    .pr_app.login {
        text-align: center;
        margin-top: 11vh!important;
        transition: all .3s;
    }
    .more {
        margin: 30px auto;
        animation: show_more 1.5s 1;
        line-height: 1.3;
    }
    @keyframes show_more {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    html, body {
        overflow: auto;
    }
    .select-v {
        margin: 0 auto;
        padding: 0;
    }
    .alert {
        position: fixed !important;
        top: 1rem;
        right: 1rem;
        /* min-width: 6rem; */
    }
</style>

