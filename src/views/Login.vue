<template>
    <div>
        <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" label-width="100px" class="login-box">
            <el-form-item label="User Name" prop="userName">
                <!--el-input v-model.number="ruleForm.age"></el-input-->
                <el-input v-model="ruleForm.userName"></el-input>
            </el-form-item>
            <el-form-item label="Password" prop="passwd">
                <el-input type="password" v-model="ruleForm.passwd" autocomplete="off"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" class="my-button" @click="submitForm('ruleForm')">
                  &nbsp;&nbsp;&nbsp;LOGIN&nbsp;&nbsp;&nbsp;
                </el-button>
                <!--el-button @click="resetForm('ruleForm')">重置</el-button-->
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
export default {
    name: 'login',
    data(){
        var checkAge = (rule, value, callback) => {
          if (!value) {
            return callback(new Error('用户名不能为空'));
          }
          /*
          setTimeout(() => {
            if (!Number.isInteger(value)) {
              callback(new Error('请输入数字值'));
            } else {
              if (value < 18) {
                callback(new Error('必须年满18岁'));
              } else {
                callback();
              }
            }
          }, 1000);
          */
         callback();
      };
      var validatePass = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入密码'));
        } else {
          /*
          if (this.ruleForm.checkPass !== '') {
            this.$refs.ruleForm.validateField('checkPass');
          }
          */
          callback();
        }
      };
      return {
        ruleForm: {
          passwd: '',
          userName: '',
        },
        rules: {
          passwd: [
            { validator: validatePass, trigger: 'blur' }
          ],
          userName: [
            { validator: checkAge, trigger: 'blur' }
          ]
        }
      };
    },
    methods:{
        submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            //alert('submit!');
            this.axios({
                method: "post",
                //url: "http://localhost:24686/api/login",   //后端服务器的实际端口
                //url: "http://104.225.234.236:31111/api/login", //通过ngnix反向代理
                url:"/api/login",
                params: {
                    userName: this.ruleForm.userName,
                    password: this.ruleForm.passwd,
                },
            })
                .then((repos) => {
                    //console.log(repos.data);
                    //alert('收到回复')
                    let data = repos.data;
                    if (data.success == 'true'){
                      alert("成功")
                      this.$router.push({ name: 'Default' })
                    }else if(data.success == 'false'){
                      alert("失败")
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      },
      resetForm(formName) {
        this.$refs[formName].resetFields();
      },
    },
}
</script>

<style scoped>
.login-box {
    width: 400px;
    margin: 100px auto;
    border: 1px solid #DCDFE6;
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0 0 30px #EBEEF5;
}

.login-title {
    text-align: center;
}

.my-button {
  width: 250px;
}
</style>