<template>
    <v-app>
        <v-main>
            <div class="app write">
                <h1 class="text-h3" v-text="title"></h1>
                <div class="more text-h6 font-weight-light">
                    <div class="input_float">
                        <codemirror class="code" v-model="code" :options="cmOptions"></codemirror>
                        <div class="_preview markdown-body" v-html="preview"></div>
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
                                    <v-radio-group v-model="radioGroup">
                                      <v-radio
                                        key="post"
                                        label="文章"
                                        value="post"
                                      ></v-radio>
                                      <v-radio
                                        key="draft"
                                        label="草稿"
                                        value="draft"
                                      ></v-radio>
                                      <v-radio
                                        key="page"
                                        label="页面"
                                        value="page"
                                      ></v-radio>
                                    </v-radio-group>
                                    <v-btn @click="get_list" class="mgr vbtn" depressed :loading="getLoading">
                                          获取
                                    </v-btn>
                                    <v-btn @click="create_file" class="mgr vbtn" depressed :loading="createLoading" >
                                          {{ create_file_txt }}
                                    </v-btn>
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
                      <v-btn @click="remove_text" class="mgr vbtn" depressed >
                            清除
                      </v-btn>
                      <v-btn @click="auto_save" class="mgr vbtn" depressed >
                            {{ auto_save_text }}
                      </v-btn>
                      <v-btn @click="show_preview" class="preview_btn vbtn" depressed >
                            {{ pre_text }}
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
import marked from 'marked';
import {codemirror} from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/keymap/sublime' //sublime编辑器效果
import "codemirror/theme/dracula.css"// 配置里面也需要theme设置为monokai
import "codemirror/mode/markdown/markdown.js" // 配置里面也需要mode设置为vue
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
        title: i18n("auto", "write")["title"],
        code: "> 使用 ESHexoN 开始书写。",
        cmOptions: {
            tabSize: 4,// tab的空格个数
            theme: 'dracula',//主题样式
            lineNumbers: true,//是否显示行数
            lineWrapping: true, //是否自动换行
            styleActiveLine: true,//line选择是是否加亮
            matchBrackets: true,//括号匹配
            mode: "markdown", //实现javascript代码高亮
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
        createFilename: "",
        saveLoading: false,
        openLoading: false,
    }),

    methods: {
        async get_list() {
          this.getLoading = true;
          if (this.radioGroup == "post") {
            this.cmpl_show = true;
            let posts_list = await fetch(localStorage.getItem("backend_url")+"/api/get_posts_list", {
                method: "POST",
                body: JSON.stringify({
                    token: localStorage.getItem("login_token") || sessionStorage.getItem("token"),
                }),
            }).then(res => res.json()).then(posts_list => {
                return JSON.parse(posts_list.statusInfo);
            });
            console.log(posts_list);
            let list = [];
            for (let i in posts_list) {
              for (let o in posts_list[i]) {
                list.push(posts_list[i][o]["filepath"]);
              }
            }
            this.full_list = list;
            this.getLoading = false;
          } else if (this.radioGroup == "draft") {
            this.cmpl_show = true;
            let posts_list = await fetch(localStorage.getItem("backend_url")+"/api/get_drafts_list", {
                method: "POST",
                body: JSON.stringify({
                    token: localStorage.getItem("login_token") || sessionStorage.getItem("token"),
                }),
            }).then(res => res.json()).then(posts_list => {
                return JSON.parse(posts_list.statusInfo);
            });
            console.log(posts_list);
            let list = [];
            for (let i in posts_list) {
              for (let o in posts_list[i]) {
                list.push(posts_list[i][o]["filepath"]);
              }
            }
            this.full_list = list;
            this.getLoading = false;
          } else {
            this.alertType = "info";
            this.alertShow = true;
            this.alertText = "该模式下需要手动输入文件名";
            setTimeout(() => {this.alertShow = false}, 1500);
            this.getLoading = false;
          }
        },
        async create_file() {
          this.cmpl_show = false;
        },
        async open_file() {
          this.openLoading = true;
          let filename = this.createFilename;
          let file_content = await fetch(localStorage.getItem("backend_url")+"/api/get_file_content", {
              method: "POST",
              body: JSON.stringify({
                  token: localStorage.getItem("login_token") || sessionStorage.getItem("token"),
                  filename,
              }),
          }).then(res => res.json());
          this.code = file_content.statusInfo;
          if (file_content.statusInfo == "404: Not Found") {
              this.code = "[打开文件失败, 文件不存在]";
          } 
          this.openLoading = false;
        },
        async save() {
          this.saveLoading = true;
          let content = encode(this.code);
          let filename = this.createFilename;
          let b64 = true;
          let uri;
          if (this.radioGroup == "post") {
            uri = localStorage.getItem("backend_url")+"/api/add_posts";
          } else if (this.radioGroup == "draft") {
            uri = localStorage.getItem("backend_url")+"/api/add_drafts"
          }
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
        },
        show_preview() {
          if (this.pre_text == "预览") {
            this.pre_text = "取消预览";
            document.querySelector("._preview").style.width = "100%";
            document.querySelector("._preview").style.display = "block";
            document.querySelector(".code").style.display = "none";
          } else {
            this.pre_text = "预览";
            document.querySelector("._preview").style.width = "50%";
            document.querySelector("._preview").style.display = "none";
            document.querySelector(".code").style.display = "block";
          }
        },
        remove_text() {
          localStorage.setItem("_tmp_auto_save", "");
          this.alertShow = true;
          this.alertText = "清除成功";
          this.alertType = "success";
          setTimeout(() => {this.alertShow = false}, 1500);
        },
        auto_save() {
          if (this.auto_save_text == "开启自动保存") {
            this.auto_save_text = "关闭自动保存";
            localStorage.setItem("auto_save", true);
            this.alertShow = true;
            this.alertText = "开启成功";
            this.alertType = "success";
            setTimeout(() => {this.alertShow = false}, 1500);
          } else {
            this.auto_save_text = "开启自动保存";
            localStorage.setItem("auto_save", false);
            this.alertShow = true;
            this.alertText = "关闭成功";
            this.alertType = "success";
            setTimeout(() => {this.alertShow = false}, 1500);
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
    
        if (localStorage.getItem("auto_save") == "true") {
          this.code = localStorage.getItem("_tmp_auto_save");
          this.auto_save_text = "关闭自动保存";
        }
        setInterval(() => {
            let rawContent = this.code;
            if (rawContent.split("---\n").length > 2) {
              rawContent = rawContent.split("---\n")[2];
            }
            this.preview = marked(rawContent);
            if (localStorage.getItem("auto_save") == "true") {
              localStorage.setItem("_tmp_auto_save", this.code);
            }
        }, 500);
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
    .code, .CodeMirror {
        text-align: left;
        font: 15px SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace !important;
        height: 100%;
        width: 50%;
    }
    ._preview {
        width: 50%;
        word-break: break-all;
        background-color: #282a36 !important;
        padding: 10px;
        text-align: left;
        color: white !important;
        overflow-y: scroll;
    }
    ._preview blockquote {
      color: aliceblue!important;
    }
    ._preview pre {
      background-color: rgba(255, 255, 255, 0.1)!important;
    }
    ._preview pre code {
      background-color: unset!important;
    }
    .preview_btn {
      display: none;
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
    @media screen and (max-width: 850px) {
      .code {
        width: 100%!important;
      }
      ._preview {
        display: none;
      }
      .preview_btn {
        display: inline-block;
      }
    }
    @media screen and (max-width: 576px) {
      .btnGroupWrite {
        left: 0!important;
      }
    }
    @media screen and (min-width: 850px) {
      .code, ._preview {
        width: 50%!important;
      }
      ._preview, .code {
        display: block!important;
      }
      .preview_btn {
        display: none;
      }
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



<style>
.markdown-body .octicon {
  display: inline-block;
  fill: currentColor;
  vertical-align: text-bottom;
}

.markdown-body .anchor {
  float: left;
  line-height: 1;
  margin-left: -20px;
  padding-right: 4px;
}

.markdown-body .anchor:focus {
  outline: none;
}

.markdown-body h1 .octicon-link,
.markdown-body h2 .octicon-link,
.markdown-body h3 .octicon-link,
.markdown-body h4 .octicon-link,
.markdown-body h5 .octicon-link,
.markdown-body h6 .octicon-link {
  color: #1b1f23;
  vertical-align: middle;
  visibility: hidden;
}

.markdown-body h1:hover .anchor,
.markdown-body h2:hover .anchor,
.markdown-body h3:hover .anchor,
.markdown-body h4:hover .anchor,
.markdown-body h5:hover .anchor,
.markdown-body h6:hover .anchor {
  text-decoration: none;
}

.markdown-body h1:hover .anchor .octicon-link,
.markdown-body h2:hover .anchor .octicon-link,
.markdown-body h3:hover .anchor .octicon-link,
.markdown-body h4:hover .anchor .octicon-link,
.markdown-body h5:hover .anchor .octicon-link,
.markdown-body h6:hover .anchor .octicon-link {
  visibility: visible;
}

.markdown-body h1:hover .anchor .octicon-link:before,
.markdown-body h2:hover .anchor .octicon-link:before,
.markdown-body h3:hover .anchor .octicon-link:before,
.markdown-body h4:hover .anchor .octicon-link:before,
.markdown-body h5:hover .anchor .octicon-link:before,
.markdown-body h6:hover .anchor .octicon-link:before {
  width: 16px;
  height: 16px;
  content: ' ';
  display: inline-block;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' version='1.1' width='16' height='16' aria-hidden='true'%3E%3Cpath fill-rule='evenodd' d='M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z'%3E%3C/path%3E%3C/svg%3E");
}.markdown-body {
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  line-height: 1.5;
  color: #24292e;
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
  font-size: 16px;
  line-height: 1.5;
  word-wrap: break-word;
}

.markdown-body details {
  display: block;
}

.markdown-body summary {
  display: list-item;
}

.markdown-body a {
  background-color: initial;
}

.markdown-body a:active,
.markdown-body a:hover {
  outline-width: 0;
}

.markdown-body strong {
  font-weight: inherit;
  font-weight: bolder;
}

.markdown-body h1 {
  font-size: 2em;
  margin: .67em 0;
}

.markdown-body img {
  border-style: none;
}

.markdown-body code,
.markdown-body kbd,
.markdown-body pre {
  font-family: monospace,monospace;
  font-size: 1em;
}

.markdown-body hr {
  box-sizing: initial;
  height: 0;
  overflow: visible;
}

.markdown-body input {
  font: inherit;
  margin: 0;
}

.markdown-body input {
  overflow: visible;
}

.markdown-body [type=checkbox] {
  box-sizing: border-box;
  padding: 0;
}

.markdown-body * {
  box-sizing: border-box;
}

.markdown-body input {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
}

.markdown-body a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-body a:hover {
  text-decoration: underline;
}

.markdown-body strong {
  font-weight: 600;
}

.markdown-body hr {
  height: 0;
  margin: 15px 0;
  overflow: hidden;
  background: transparent;
  border: 0;
  border-bottom: 1px solid #dfe2e5;
}

.markdown-body hr:after,
.markdown-body hr:before {
  display: table;
  content: "";
}

.markdown-body hr:after {
  clear: both;
}

.markdown-body table {
  border-spacing: 0;
  border-collapse: collapse;
}

.markdown-body td,
.markdown-body th {
  padding: 0;
}

.markdown-body details summary {
  cursor: pointer;
}

.markdown-body kbd {
  display: inline-block;
  padding: 3px 5px;
  font: 11px SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;
  line-height: 10px;
  color: #444d56;
  vertical-align: middle;
  background-color: #fafbfc;
  border: 1px solid #d1d5da;
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 #d1d5da;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 0;
  margin-bottom: 0;
}

.markdown-body h1 {
  font-size: 32px;
}

.markdown-body h1,
.markdown-body h2 {
  font-weight: 600;
}

.markdown-body h2 {
  font-size: 24px;
}

.markdown-body h3 {
  font-size: 20px;
}

.markdown-body h3,
.markdown-body h4 {
  font-weight: 600;
}

.markdown-body h4 {
  font-size: 16px;
}

.markdown-body h5 {
  font-size: 14px;
}

.markdown-body h5,
.markdown-body h6 {
  font-weight: 600;
}

.markdown-body h6 {
  font-size: 12px;
}

.markdown-body p {
  margin-top: 0;
  margin-bottom: 10px;
}

.markdown-body blockquote {
  margin: 0;
}

.markdown-body ol,
.markdown-body ul {
  padding-left: 0;
  margin-top: 0;
  margin-bottom: 0;
}

.markdown-body ol ol,
.markdown-body ul ol {
  list-style-type: lower-roman;
}

.markdown-body ol ol ol,
.markdown-body ol ul ol,
.markdown-body ul ol ol,
.markdown-body ul ul ol {
  list-style-type: lower-alpha;
}

.markdown-body dd {
  margin-left: 0;
}

.markdown-body code,
.markdown-body pre {
  font-family: SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;
  font-size: 12px;
}

.markdown-body pre {
  margin-top: 0;
  margin-bottom: 0;
}

.markdown-body input::-webkit-inner-spin-button,
.markdown-body input::-webkit-outer-spin-button {
  margin: 0;
  -webkit-appearance: none;
  appearance: none;
}

.markdown-body :checked+.radio-label {
  position: relative;
  z-index: 1;
  border-color: #0366d6;
}

.markdown-body .border {
  border: 1px solid #e1e4e8!important;
}

.markdown-body .border-0 {
  border: 0!important;
}

.markdown-body .border-bottom {
  border-bottom: 1px solid #e1e4e8!important;
}

.markdown-body .rounded-1 {
  border-radius: 3px!important;
}

.markdown-body .bg-white {
  background-color: #fff!important;
}

.markdown-body .bg-gray-light {
  background-color: #fafbfc!important;
}

.markdown-body .text-gray-light {
  color: #6a737d!important;
}

.markdown-body .mb-0 {
  margin-bottom: 0!important;
}

.markdown-body .my-2 {
  margin-top: 8px!important;
  margin-bottom: 8px!important;
}

.markdown-body .pl-0 {
  padding-left: 0!important;
}

.markdown-body .py-0 {
  padding-top: 0!important;
  padding-bottom: 0!important;
}

.markdown-body .pl-1 {
  padding-left: 4px!important;
}

.markdown-body .pl-2 {
  padding-left: 8px!important;
}

.markdown-body .py-2 {
  padding-top: 8px!important;
  padding-bottom: 8px!important;
}

.markdown-body .pl-3,
.markdown-body .px-3 {
  padding-left: 16px!important;
}

.markdown-body .px-3 {
  padding-right: 16px!important;
}

.markdown-body .pl-4 {
  padding-left: 24px!important;
}

.markdown-body .pl-5 {
  padding-left: 32px!important;
}

.markdown-body .pl-6 {
  padding-left: 40px!important;
}

.markdown-body .f6 {
  font-size: 12px!important;
}

.markdown-body .lh-condensed {
  line-height: 1.25!important;
}

.markdown-body .text-bold {
  font-weight: 600!important;
}

.markdown-body .pl-c {
  color: #6a737d;
}

.markdown-body .pl-c1,
.markdown-body .pl-s .pl-v {
  color: #005cc5;
}

.markdown-body .pl-e,
.markdown-body .pl-en {
  color: #6f42c1;
}

.markdown-body .pl-s .pl-s1,
.markdown-body .pl-smi {
  color: #24292e;
}

.markdown-body .pl-ent {
  color: #22863a;
}

.markdown-body .pl-k {
  color: #d73a49;
}

.markdown-body .pl-pds,
.markdown-body .pl-s,
.markdown-body .pl-s .pl-pse .pl-s1,
.markdown-body .pl-sr,
.markdown-body .pl-sr .pl-cce,
.markdown-body .pl-sr .pl-sra,
.markdown-body .pl-sr .pl-sre {
  color: #032f62;
}

.markdown-body .pl-smw,
.markdown-body .pl-v {
  color: #e36209;
}

.markdown-body .pl-bu {
  color: #b31d28;
}

.markdown-body .pl-ii {
  color: #fafbfc;
  background-color: #b31d28;
}

.markdown-body .pl-c2 {
  color: #fafbfc;
  background-color: #d73a49;
}

.markdown-body .pl-c2:before {
  content: "^M";
}

.markdown-body .pl-sr .pl-cce {
  font-weight: 700;
  color: #22863a;
}

.markdown-body .pl-ml {
  color: #735c0f;
}

.markdown-body .pl-mh,
.markdown-body .pl-mh .pl-en,
.markdown-body .pl-ms {
  font-weight: 700;
  color: #005cc5;
}

.markdown-body .pl-mi {
  font-style: italic;
  color: #24292e;
}

.markdown-body .pl-mb {
  font-weight: 700;
  color: #24292e;
}

.markdown-body .pl-md {
  color: #b31d28;
  background-color: #ffeef0;
}

.markdown-body .pl-mi1 {
  color: #22863a;
  background-color: #f0fff4;
}

.markdown-body .pl-mc {
  color: #e36209;
  background-color: #ffebda;
}

.markdown-body .pl-mi2 {
  color: #f6f8fa;
  background-color: #005cc5;
}

.markdown-body .pl-mdr {
  font-weight: 700;
  color: #6f42c1;
}

.markdown-body .pl-ba {
  color: #586069;
}

.markdown-body .pl-sg {
  color: #959da5;
}

.markdown-body .pl-corl {
  text-decoration: underline;
  color: #032f62;
}

.markdown-body .mb-0 {
  margin-bottom: 0!important;
}

.markdown-body .my-2 {
  margin-bottom: 8px!important;
}

.markdown-body .my-2 {
  margin-top: 8px!important;
}

.markdown-body .pl-0 {
  padding-left: 0!important;
}

.markdown-body .py-0 {
  padding-top: 0!important;
  padding-bottom: 0!important;
}

.markdown-body .pl-1 {
  padding-left: 4px!important;
}

.markdown-body .pl-2 {
  padding-left: 8px!important;
}

.markdown-body .py-2 {
  padding-top: 8px!important;
  padding-bottom: 8px!important;
}

.markdown-body .pl-3 {
  padding-left: 16px!important;
}

.markdown-body .pl-4 {
  padding-left: 24px!important;
}

.markdown-body .pl-5 {
  padding-left: 32px!important;
}

.markdown-body .pl-6 {
  padding-left: 40px!important;
}

.markdown-body .pl-7 {
  padding-left: 48px!important;
}

.markdown-body .pl-8 {
  padding-left: 64px!important;
}

.markdown-body .pl-9 {
  padding-left: 80px!important;
}

.markdown-body .pl-10 {
  padding-left: 96px!important;
}

.markdown-body .pl-11 {
  padding-left: 112px!important;
}

.markdown-body .pl-12 {
  padding-left: 128px!important;
}

.markdown-body hr {
  border-bottom-color: #eee;
}

.markdown-body kbd {
  display: inline-block;
  padding: 3px 5px;
  font: 11px SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;
  line-height: 10px;
  color: #444d56;
  vertical-align: middle;
  background-color: #fafbfc;
  border: 1px solid #d1d5da;
  border-radius: 3px;
  box-shadow: inset 0 -1px 0 #d1d5da;
}

.markdown-body:after,
.markdown-body:before {
  display: table;
  content: "";
}

.markdown-body:after {
  clear: both;
}

.markdown-body>:first-child {
  margin-top: 0!important;
}

.markdown-body>:last-child {
  margin-bottom: 0!important;
}

.markdown-body a:not([href]) {
  color: inherit;
  text-decoration: none;
}

.markdown-body blockquote,
.markdown-body details,
.markdown-body dl,
.markdown-body ol,
.markdown-body p,
.markdown-body pre,
.markdown-body table,
.markdown-body ul {
  margin-top: 0;
  margin-bottom: 16px;
}

.markdown-body hr {
  height: .25em;
  padding: 0;
  margin: 24px 0;
  background-color: #e1e4e8;
  border: 0;
}

.markdown-body blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: .25em solid #dfe2e5;
}

.markdown-body blockquote>:first-child {
  margin-top: 0;
}

.markdown-body blockquote>:last-child {
  margin-bottom: 0;
}

.markdown-body h1,
.markdown-body h2,
.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}

.markdown-body h1 {
  font-size: 2em;
}

.markdown-body h1,
.markdown-body h2 {
  padding-bottom: .3em;
  border-bottom: 1px solid #eaecef;
}

.markdown-body h2 {
  font-size: 1.5em;
}

.markdown-body h3 {
  font-size: 1.25em;
}

.markdown-body h4 {
  font-size: 1em;
}

.markdown-body h5 {
  font-size: .875em;
}

.markdown-body h6 {
  font-size: .85em;
  color: #6a737d;
}

.markdown-body ol,
.markdown-body ul {
  padding-left: 2em;
}

.markdown-body ol ol,
.markdown-body ol ul,
.markdown-body ul ol,
.markdown-body ul ul {
  margin-top: 0;
  margin-bottom: 0;
}

.markdown-body li {
  word-wrap: break-all;
}

.markdown-body li>p {
  margin-top: 16px;
}

.markdown-body li+li {
  margin-top: .25em;
}

.markdown-body dl {
  padding: 0;
}

.markdown-body dl dt {
  padding: 0;
  margin-top: 16px;
  font-size: 1em;
  font-style: italic;
  font-weight: 600;
}

.markdown-body dl dd {
  padding: 0 16px;
  margin-bottom: 16px;
}

.markdown-body table {
  display: block;
  width: 100%;
  overflow: auto;
}

.markdown-body table th {
  font-weight: 600;
}

.markdown-body table td,
.markdown-body table th {
  padding: 6px 13px;
  border: 1px solid #dfe2e5;
}

.markdown-body table tr {
  background-color: #fff;
  border-top: 1px solid #c6cbd1;
}

.markdown-body table tr:nth-child(2n) {
  background-color: #f6f8fa;
}

.markdown-body img {
  max-width: 100%;
  box-sizing: initial;
  background-color: #fff;
}

.markdown-body img[align=right] {
  padding-left: 20px;
}

.markdown-body img[align=left] {
  padding-right: 20px;
}

.markdown-body code {
  padding: .2em .4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(27,31,35,.05);
  border-radius: 3px;
}

.markdown-body pre {
  word-wrap: normal;
}

.markdown-body pre>code {
  padding: 0;
  margin: 0;
  font-size: 100%;
  word-break: normal;
  white-space: pre;
  background: transparent;
  border: 0;
}

.markdown-body .highlight {
  margin-bottom: 16px;
}

.markdown-body .highlight pre {
  margin-bottom: 0;
  word-break: normal;
}

.markdown-body .highlight pre,
.markdown-body pre {
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 3px;
}

.markdown-body pre code {
  display: inline;
  max-width: auto;
  padding: 0;
  margin: 0;
  overflow: visible;
  line-height: inherit;
  word-wrap: normal;
  background-color: initial;
  border: 0;
}

.markdown-body .commit-tease-sha {
  display: inline-block;
  font-family: SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;
  font-size: 90%;
  color: #444d56;
}

.markdown-body .full-commit .btn-outline:not(:disabled):hover {
  color: #005cc5;
  border-color: #005cc5;
}

.markdown-body .blob-wrapper {
  overflow-x: auto;
  overflow-y: hidden;
}

.markdown-body .blob-wrapper-embedded {
  max-height: 240px;
  overflow-y: auto;
}

.markdown-body .blob-num {
  width: 1%;
  min-width: 50px;
  padding-right: 10px;
  padding-left: 10px;
  font-family: SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;
  font-size: 12px;
  line-height: 20px;
  color: rgba(27,31,35,.3);
  text-align: right;
  white-space: nowrap;
  vertical-align: top;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.markdown-body .blob-num:hover {
  color: rgba(27,31,35,.6);
}

.markdown-body .blob-num:before {
  content: attr(data-line-number);
}

.markdown-body .blob-code {
  position: relative;
  padding-right: 10px;
  padding-left: 10px;
  line-height: 20px;
  vertical-align: top;
}

.markdown-body .blob-code-inner {
  overflow: visible;
  font-family: SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;
  font-size: 12px;
  color: #24292e;
  word-wrap: normal;
  white-space: pre;
}

.markdown-body .pl-token.active,
.markdown-body .pl-token:hover {
  cursor: pointer;
  background: #ffea7f;
}

.markdown-body .tab-size[data-tab-size="1"] {
  -moz-tab-size: 1;
  tab-size: 1;
}

.markdown-body .tab-size[data-tab-size="2"] {
  -moz-tab-size: 2;
  tab-size: 2;
}

.markdown-body .tab-size[data-tab-size="3"] {
  -moz-tab-size: 3;
  tab-size: 3;
}

.markdown-body .tab-size[data-tab-size="4"] {
  -moz-tab-size: 4;
  tab-size: 4;
}

.markdown-body .tab-size[data-tab-size="5"] {
  -moz-tab-size: 5;
  tab-size: 5;
}

.markdown-body .tab-size[data-tab-size="6"] {
  -moz-tab-size: 6;
  tab-size: 6;
}

.markdown-body .tab-size[data-tab-size="7"] {
  -moz-tab-size: 7;
  tab-size: 7;
}

.markdown-body .tab-size[data-tab-size="8"] {
  -moz-tab-size: 8;
  tab-size: 8;
}

.markdown-body .tab-size[data-tab-size="9"] {
  -moz-tab-size: 9;
  tab-size: 9;
}

.markdown-body .tab-size[data-tab-size="10"] {
  -moz-tab-size: 10;
  tab-size: 10;
}

.markdown-body .tab-size[data-tab-size="11"] {
  -moz-tab-size: 11;
  tab-size: 11;
}

.markdown-body .tab-size[data-tab-size="12"] {
  -moz-tab-size: 12;
  tab-size: 12;
}

.markdown-body .task-list-item {
  list-style-type: none;
}

.markdown-body .task-list-item+.task-list-item {
  margin-top: 3px;
}

.markdown-body .task-list-item input {
  margin: 0 .2em .25em -1.6em;
  vertical-align: middle;
}
</style>