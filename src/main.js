import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios';
import '@/style/global.css'
import enLocale from 'element-ui/lib/locale/lang/en' 
import esLocale from 'element-ui/lib/locale/lang/es' 
import zhLocale from 'element-ui/lib/locale/lang/zh-CN'
import locale from 'element-ui/lib/locale'
import Vuex from 'vuex'

//选择系统语言
const browserLanguage = navigator.language || navigator.userLanguage
let lang

if (browserLanguage.startsWith('zh')) {
  lang = zhLocale
} else if (browserLanguage.startsWith('es')) {
  lang = esLocale
}else{
  lang = enLocale
}

Vue.config.productionTip = false;
Vue.use(ElementUI, {locale:lang});
locale.use(lang)
Vue.prototype.axios = axios;
Vue.use(Vuex)

function removeExtraSpaces(str){
  if (typeof str !== 'string'){
    //先判断数据类型是不是字符串，不是的话直接返回
    return str
  }
  return str.replace(/\s+/g, ' ');
}

async function removeArrayExtraSpaces(arr) {
  if (!Array.isArray(arr)){
    //先判断是不是数组
    console.log("arr不是数组")
    return arr
  }
  arr.forEach(item => {    //去除多余空格
    for (let key in item){ 
        item[key] = removeExtraSpaces(item[key])
    }
  })
  return arr
}
//全局函数，去除多余的空格，只保留一个
Vue.prototype.$removeExtraSpaces = removeExtraSpaces;
Vue.prototype.$removeArrayExtraSpaces = removeArrayExtraSpaces;


new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

