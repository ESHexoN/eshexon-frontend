<template>
    <v-app>
        <v-main>
            <div class="app write">
                <h1 class="text-h3" v-text="title"></h1>
                <div class="more text-h6 font-weight-light">
                    <div class="input_float">
                        <codemirror class="code cfg" v-model="code" :options="cmOptions"></codemirror>
                        <!-- <div class="_preview markdown-body" v-html="preview"></div> -->
                    </div>
                    <div class="btnGroupWrite">
                      <v-col cols="auto" class="dp-inline">
                        <v-dialog
                          transition="dialog-bottom-transition"
                          max-width="600"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-btn
                              color=""
                              class="vbtn"
                              v-bind="attrs"
                              v-on="on" depressed
                            >新建/打开</v-btn>
                          </template>
                          <template v-slot:default="dialog">
                            <v-card>
                              <v-toolbar
                                color="primary"
                                dark
                              >新建 / 打开文件</v-toolbar>
                              <v-card-text>
                                <div class="select-file">
                                  <v-container
                                    class="px-0"
                                    fluid
                                  >
                                    <v-btn @click="open_file" class="mgr vbtn" depressed :loading="openLoading" v-show="createFilename">
                                          打开
                                    </v-btn>
                                    <v-col
                                      cols="12"
                                    >
                                      <v-text-field
                                        label="文件名"
                                        placeholder="请输入文件名"
                                        outlined
                                        v-show="!cmpl_show"
                                        v-model="createFilename"
                                      ></v-text-field>
                                    </v-col>
                                    <v-autocomplete
                                      v-show="cmpl_show"
                                      auto-select-first
                                      small-chips
                                      label="输入文件路径"
                                      :items="full_list"
                                      filled
                                      class="mgt"
                                      v-model="createFilename"
                                    ></v-autocomplete>
                                    <p>选择路径: {{ createFilename }}</p>
                                  </v-container>
                                </div>
                              </v-card-text>
                              <v-card-actions class="justify-end">
                                <v-btn
                                  text
                                  @click="dialog.value = false"
                                >关闭</v-btn>
                              </v-card-actions>
                            </v-card>
                          </template>
                        </v-dialog>
                      </v-col>
                      
                      <!-- <v-btn  class="mgr vbtn" depressed >
                            本地保存
                      </v-btn> -->
                      <v-btn  class="mgr vbtn" depressed @click="save" :loading="saveLoading">
                            保存
                      </v-btn>
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
import {codemirror} from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/keymap/sublime' //sublime编辑器效果
import "codemirror/theme/dracula.css"// 配置里面也需要theme设置为monokai
import "codemirror/mode/javascript/javascript.js" // 配置里面也需要mode设置为vue
import "codemirror/mode/yaml/yaml.js"
import 'codemirror/addon/selection/active-line' //光标行背景高亮，配置里面也需要styleActiveLine设置为true
import i18n from '../../i18n';
import { encode } from 'js-base64';
document.title = i18n("auto", "title")["write"];
export default {
    name: "ESHexoN",

    components: {
        codemirror
    },

    data: () => ({
        title: "管理",
        code: "",
        cmOptions: {
            tabSize: 4,// tab的空格个数
            theme: 'dracula',//主题样式
            lineNumbers: true,//是否显示行数
            lineWrapping: true, //是否自动换行
            styleActiveLine: true,//line选择是是否加亮
            matchBrackets: true,//括号匹配
            mode: "javascript", //实现javascript代码高亮
            readOnly: false//只读
        },
        preview: "",
        pre_text: "预览",
        auto_save_text: "开启自动保存",
        alertText: null,
        alertType: null,
        alertShow: false,
        radioGroup: "post",
        full_list: ["加载中..."],
        cmpl_show: false,
        create_file_txt: "手动输入",
        createLoading: false,
        getLoading: false,
        createFilename: "eshexon.json",
        saveLoading: false,
        openLoading: false,
    }),

    methods: {
        async create_file() {
          this.cmpl_show = false;
        },
        async save() {
          this.saveLoading = true;
          let content = encode(this.code);
          let filename = this.createFilename;
          let b64 = true;
          let uri = localStorage.getItem("backend_url")+"/api/add_drafts";
          let save_file = await fetch(uri, {
                method: "POST",
                body: JSON.stringify({
                    token: localStorage.getItem("login_token") || sessionStorage.getItem("token"),
                    content,
                    filename,
                    b64,
                }),
            }).then(res => res.json());
          if (save_file.statusCode == 200) {
            this.alertType = "success";
            this.alertShow = true;
            this.alertText = "保存成功";
            setTimeout(() => {this.alertShow = false}, 1500);
            this.saveLoading = false;
          } else {
            this.alertType = "error";
            this.alertShow = true;
            this.alertText = "保存失败";
            setTimeout(() => {this.alertShow = false}, 1500);
            this.saveLoading = false;
          }
        },
        dash() {
            if (!localStorage.getItem("login_token") && !sessionStorage.getItem("login_token")) {
                this.$router.push("/login/");
            } else {
                this.$router.push("/dash/");
            }
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
    
    }
    
};

</script>

<style>
    .mgt {
      margin-top: 10px!important;
    }
    .dp-inline {
      display: inline;
    }
    .alert {
        position: fixed !important;
        top: 1rem;
        right: 1rem;
        /* min-width: 6rem; */
      }
    .app.write  {
        text-align: center;
        margin-top: 3vh;
        transition: all .3s;
    }
    .mgr {
      margin-right: 15px;
    }
    .code.cfg, .CodeMirror {
        text-align: left;
        font: 15px SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace !important;
        height: 100%;
        width: 100%!important;
    }
    .btnGroupWrite {
      position: fixed;
      top: 75vh;
      left: 6vw;
      /* max-width: 60px; */
      /* left: calc(50vw - 60px); */
    }
    .btnGroupWrite .vbtn {
      margin-top: 5px;
    }
    ::-webkit-scrollbar {
        width: 1px;
        height: 3px;
    }

    /*滚动条里面小方块*/
    ::-webkit-scrollbar-thumb {
        border-radius: 2px;
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        background: rgba(0, 0, 0, 0.2);
    }

    /*滚动条里面轨道*/
    ::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        border-radius: 0;
        background: rgba(0, 0, 0, 0.1);
    }
    .CodeMirror {
        width: 100%;
    }
    .input_float {
        position: fixed;
        left: 5%;
        width: 90%;
        height: 48vh;
        display: flex;
        /* justify-content: center;
        align-items: center; */
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
