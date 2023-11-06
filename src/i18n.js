
const i18nTr = {
    "zh-CN": {
        index: {
            title: "欢迎使用 ESHexoN!",
            more: "ESHexoN 是一款简洁、强大的 Hexo 在线编辑器。",
            login: "立即登录",
            todash: "管理面板",
            index_btn: "开始使用"
        },
        login: {
            title: "登录 ESHexoN",
            backend: "后端地址",
            username: "用户名",
            password: "密码",
            remember: "保存登录状态",
        },
        dash: {
            title: "管理面板"
        },
        write: {
            title: "书写",
        },
        title: {
            index: "首页",
            login: "登录",
            dash: "管理面板",
            write: "书写"
        },
        links: [
            {
                name: "首页",
                path: "/"
            },
            {
                name: "管理面板",
                path: "/dash/"
            }
        ]
    }
}    
const i18n = (lang, text) => {
    if (lang == "auto") {
        var _lang = localStorage.getItem("language");
        return i18n(_lang, text);
    } else if (lang == 0 && text == 0) {
        return ["zh-CN"];
    } else if (lang == 1 && text == 1) {
        return [
            {
                text: "简体中文",
                value: "zh-CN"
            },
            // {
            //     text: "繁體中文",
            //     value: "zh-TW"
            // },
            // {
            //     text: "English",
            //     value: "en-US"
            // },
            // {
            //     text: "日本語",
            //     value: "ja"
            // },
        ]
    } else {
        if (!lang) lang = 'zh-CN';
        return i18nTr[lang][text];
    }
}
export default i18n;
