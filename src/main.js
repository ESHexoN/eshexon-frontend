import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import VueRouter from 'vue-router'
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import './css/main.css';
NProgress.configure({     
  easing: 'ease',  // 动画方式    
  speed: 500,  // 递增进度条的速度    
  showSpinner: true, 
  trickleSpeed: 200, // 自动递增间隔    
  minimum: 0.3 // 初始化时的最小百分比
});

Vue.config.productionTip = false

// import page from './components/page.vue'
import index from './components/index.vue'
// import preferences from './components/preferences.vue'
import login from './components/login.vue'
import reg from './components/reg.vue'
import dash from './components/dash.vue'
import dash_write from './components/dash/write.vue'
const routes = [
  { meta: { title: "Home" }, path: '/', component: index },
  { meta: { title: "Login" }, path: '/login/', component: login},
  { meta: { title: "Register" }, path: '/reg/', component: reg},
  { meta: { title: "Dashboard" }, path: '/dash/', component: dash},
  { meta: { title: "Write" }, path: '/dash/write/', component: dash_write},
  // { meta: { title: "Preferences" }, path: '/preferences/', component: preferences },
]
const router = new VueRouter({
  routes // (缩写) 相当于 routes: routes
})

// 当路由进入前
router.beforeEach((to, from , next) => {
    // 每次切换页面时，调用进度条
  NProgress.start();
  // 这个一定要加，没有 next() 页面不会跳转的
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});
// 当路由进入后：关闭进度条
router.afterEach(() => {  
  // 在即将进入新的页面组件前，关闭掉进度条
  NProgress.done()
})

Vue.use(VueRouter);

new Vue({
  vuetify,
  render: h => h(App),
  router,
}).$mount('#app')

