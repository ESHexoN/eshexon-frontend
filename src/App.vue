<template>
  <v-app>
    <v-main>
      <transition name="fade">
        <router-view></router-view>
      </transition>
      <v-footer
            fixed
        >
            <v-row
                justify="center"
                no-gutters
            >
            <!-- <v-btn
                v-for="link in links"
                :key="link.name"
                color="black"
                text
                rounded
                class="my-2 footer-link"
            >
                <router-link :to="link.path">
                  {{ link.name }}
                </router-link>
            </v-btn> -->
            <router-link
            v-for="link in links"
            :key="link.name"
            :to="link.path"
            class="footer-link-a"
            ><v-btn
                :color="linkColor"
                text
                rounded
                class="my-2 footer-link">{{ link.name }}</v-btn>
            </router-link>
            <v-col
                :class="linkClass"
                cols="12"
            >
                &copy; 2021-{{ new Date().getFullYear() }} — <strong>ESHexoN</strong>
            </v-col>
            </v-row>
        </v-footer>
    </v-main>
  </v-app>
</template>

<script>
import i18n from './i18n';
var links, inlang;
const browserlang = navigator.language;
const allowLang = i18n(0,0);
if (!localStorage.getItem("language")) {
  for (let i of allowLang) {
    if (i == browserlang) {
      localStorage.setItem("language", i);
      inlang = true;
    }
  }
  if (inlang == false) {
    console.log("Unknown language. Default is Chinese.");
    localStorage.setItem("language", "zh-CN");
  }
}
document.getElementsByTagName("html")[0].lang = localStorage.getItem("language");
links = i18n("auto", "links");
export default {
  name: 'CKY',

  components: {
    // page,
  },

  data: () => ({
    links,
    linkColor: "black",
    linkClass: "py-4 text-center black--text",
  }),

  created: function() {
    var darkmode = localStorage.getItem("darkmode");

    if (!darkmode) darkmode = 2;
    if (darkmode == "0") {
      this.$vuetify.theme.dark = true;
      this.linkColor = "white";
      this.linkClass = "py-4 text-center white--text";
      document.body.classList += "dark_theme";
    } else if (darkmode == "2") {
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        this.$vuetify.theme.dark = true;
        this.linkColor = "white";
        this.linkClass = "py-4 text-center white--text";
        document.body.classList += "dark_theme";
      }
    }
    
  }
};

// var darkmode = localStorage.getItem("darkmode");

// if (!darkmode) darkmode = 2;
// if (darkmode == "0") {
//   appContent.methods.dark();
// } else if (darkmode == "2") {
//   if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
//     appContent.methods.dark();
//   }
// }
// export default appContent;

</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.footer-link-a {
  color: black!important;
  text-decoration: none;
}
</style>
