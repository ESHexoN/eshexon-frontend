<template>
    <v-app>
        <v-main>
            <div class="app">
                <h1 class="text-h3" v-text="title"></h1>
                <div class="more text-h6 font-weight-light cardgroup">
                    <div class="card mgr org">
                        <!-- 写作 -->
                        <span>写作</span>
                    </div>
                    <div class="card mgr gre">
                        <!-- 页面 -->
                        <span>页面</span>
                    </div>
                    <div class="card mgr blu">
                        <!-- 说说 -->
                        <span>说说</span>
                    </div>
                    <div class="card gry">
                        <!-- 设置 -->
                        <span>设置</span>
                    </div>
                </div>
            </div>
        </v-main>
    </v-app>
</template>

<script>
import i18n from '../i18n';
var Lang = i18n("auto", "dash");
document.title = i18n("auto", "title")["dash"];
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
        margin-top: 15vh;
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
    .card {
        width: 23%;
        background-color: #ffffff;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }
    .card span {
        padding-bottom: 20px;
        font-weight: 600;
        font-size: 1.5rem;
    }
    .card.mgr {
        margin-right: 1%;
    }
    .cardgroup {
        display: flex;
        height: 300px;
        justify-content: center;
        align-items: center;
        transition: all .2s;
    }
    .dark_theme .cardgroup {
        opacity: 0.8;
    }
    .org {
        background-color: #fd960e;
    }
    .gre {
        background-color: #67d46c;
    }
    .blu {
        background-color: #13d9f1;
    }
    .gry {
        background-color: #999999;
    }
</style>

