const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: 33333, // 配置端口号
    proxy: {
      '/api': {
        //target: 'http://104.225.234.236:31111', // 替换为你的API基础地址
        target: 'http://34.176.136.161:32222', // 和32222项目共用一个后端
        //target: 'http://localhost:24686', // 替换为你的API基础地址
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  }
})
