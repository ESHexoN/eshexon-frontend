<template>
    <v-app>
        <v-main>
            <div class="app pr_app">
                <h1 class="text-h4" v-text="title"></h1>
                <div class="more">
                    <v-expansion-panels>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            {{ darkMode }}
                        </v-expansion-panel-header>
                        <v-expansion-panel-content class="panel-content">
                            <v-col
                                class="d-flex select-v"
                                cols="12"
                                sm="6"
                            >
                                <v-select
                                :items="darkmodeItems"
                                :label="darkMode"
                                v-model="darkmodeValue"
                                @change="changeDarkMode"
                                outlined
                                ></v-select>
                            </v-col>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    <v-expansion-panel>
                        <v-expansion-panel-header>
                            {{ languages }}
                        </v-expansion-panel-header>
                        <v-expansion-panel-content class="panel-content">
                            <v-col
                                class="d-flex select-v"
                                cols="12"
                                sm="6"
                            >
                                <v-select
                                :items="languagesItems"
                                :label="languages"
                                v-model="languagesValue"
                                @change="changeLanguages"
                                outlined
                                ></v-select>
                            </v-col>
                        </v-expansion-panel-content>
                    </v-expansion-panel>
                    </v-expansion-panels>
                </div>
            </div>
            <v-alert
            class="alert"
                border="left"
                color="green"
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
var Lang = i18n("auto", "preferences");
Lang.darkmodeItems = [
    {
        text: Lang.always_dark,
        value: 0,
    }, 
    {
        text: Lang.always_light,
        value: 1,
    },
    {
        text: Lang.follow_system,
        value: 2,
    }
];
Lang.languagesItems = i18n(1,1);
Lang.darkmodeValue = null;
Lang.languagesValue = null;
Lang.alertText = Lang.alertType = null;
Lang.alertShow = false;
document.title = i18n("auto", "preferences")["title"];
export default {
    name: "CKY",

    components: {},

    data: () => (Lang),

    methods: {
        changeDarkMode() {
            // 0: 总是黑色，1: 总是浅色, 2: 跟随系统
            // this.pageAlert("Still Developing...", "info");
            localStorage.setItem("darkmode", this.darkmodeValue);
            this.pageAlert("OK!", "success");
            setTimeout(() => {
                window.location.reload();
            }, 300);
        },
        changeLanguages() {
            localStorage.setItem("language", this.languagesValue);
            this.pageAlert("OK!", "success");
            setTimeout(() => {
                window.location.reload();
            }, 300);
        },
        pageAlert(text, type) {
            this.alertType = type;
            this.alertText = text;
            this.alertShow = true;
            setTimeout(() => {
                this.alertShow = false
            }, 1500);
        }
    }
};
</script>

<style>
    .pr_app {
        text-align: center;
        margin-top: 18vh!important;
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
    }
    .alert {
        position: fixed !important;
        top: 1rem;
        right: 1rem;
        /* min-width: 6rem; */
    }
</style>

