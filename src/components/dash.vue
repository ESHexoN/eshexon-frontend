<template>
    <v-app>
        <v-main>
            <div class="app dash">
                <h1 class="text-h3" v-text="title"></h1>
                <div class="more text-h6 font-weight-light cardgroup">
                    <div class="card mgr org" @click="go2('write')">
                        <!-- 写作 -->
                        <div class="txtgroup" >
                            <p><span>书写</span></p>
                            <p><span class="op8h">共 {{posts_num}} 篇文章</span></p>
                        </div>
                    </div>
                    <div class="card mgr gre" @click="go2('cfg')">
                        <!-- 页面 -->
                        <div class="txtgroup">
                            <p><span>管理</span></p>
                            <p><span class="op8h">共 {{drafts_num}} 篇草稿</span></p>
                        </div>
                    </div>
                    <div class="card mgr blu">
                        <!-- 说说 -->
                        <div class="txtgroup">
                            <p><span>说说</span></p>
                            <p><span class="op8h">正在开发中</span></p>
                        </div>
                    </div>
                    <div class="card gry">
                        <!-- 设置 -->
                        <div class="txtgroup">
                            <p><span>设置</span></p>
                            <p><span class="op8h">管理设置信息</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </v-main>
    </v-app>
</template>

<script>
import i18n from '../i18n';
var Lang = i18n("auto", "dash");
Lang.posts_num = Lang.drafts_num = "...";
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
        },
        go2(id) {
            this.$router.push("/dash/"+id+"/");
        }
    },

    created: async function() {
        // 确保 Token 有效
        if (!localStorage.getItem("login_token") && !sessionStorage.getItem("login_token")) {
            this.$router.push("/login/");
        }
        if (!localStorage.getItem("backend_url")) {
            this.$router.push("/");
        }
        let check_token = await fetch(localStorage.getItem("backend_url")+"/api/check_token", {
            method: "POST",
            body: JSON.stringify({
                token: localStorage.getItem("login_token") || sessionStorage.getItem("token"),
            }),
        }).then(res => res.json());
        if (check_token.statusCode != 200) {
            localStorage.removeItem("login_token");
            sessionStorage.removeItem("login_token");
            this.$router.push("/");
        }
        // 统计文章数量
        fetch(localStorage.getItem("backend_url")+"/api/get_posts_list", {
            method: "POST",
            body: JSON.stringify({
                token: localStorage.getItem("login_token") || sessionStorage.getItem("token"),
            }),
        }).then(res => res.json()).then(posts_list => {
            posts_list = JSON.parse(posts_list.statusInfo);
            let posts_num = 0;
            for (let i in posts_list) {
                posts_num = posts_num + posts_list[i].length;
            }
            this.posts_num = posts_num;
        });
        // 统计草稿数量
        fetch(localStorage.getItem("backend_url")+"/api/get_drafts_list", {
            method: "POST",
            body: JSON.stringify({
                token: localStorage.getItem("login_token") || sessionStorage.getItem("token"),
            }),
        }).then(res => res.json()).then(drafts_list => {
            drafts_list = JSON.parse(drafts_list.statusInfo);
            let drafts_num = 0;
            for (let i in drafts_list) {
                drafts_num = drafts_num + drafts_list[i].length;
            }
            this.drafts_num = drafts_num;
        });
        
    }
};
</script>

<style>
    .app.dash  {
        text-align: center;
        margin-top: 11vh;
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
        user-select: none;
    }
    .txtgroup {
        padding-bottom: 5px;
        font-weight: 600;
        font-size: 1.5rem;
    }
    span.op8h {
        opacity: 0.8;
        font-weight: 400;
        font-size: 1.3rem;
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

