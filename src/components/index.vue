<template>
    <v-app>
        <v-main>
            <div class="app">
                <h1 class="text-h3" v-text="title"></h1>
                <div class="more text-h6 font-weight-light" v-html="more"></div>
                <v-btn @click="dash" depressed v-text="index_btn">
                </v-btn>
            </div>
        </v-main>
    </v-app>
</template>

<script>
import i18n from '../i18n';
var Lang = i18n("auto", "index");
document.title = i18n("auto", "title")["index"];
export default {
    name: "ESHexoN",

    components: {},

    data: () => (Lang),

    methods: {
        dash() {
            if (!localStorage.getItem("login_token") && !sessionStorage.getItem("login_token")) {
                this.$router.push("/login/");
            } else {
                this.$router.push("/dash/");
            }
        }
    }
};
</script>

<style>
    .app {
        text-align: center;
        margin-top: 27vh;
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
</style>

