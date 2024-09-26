<template>
    <div>
        <el-container>
            <el-header>
                <div>
                    <el-button type="warning" icon="el-icon-folder-remove"
                        @click="onDisplayNoBought">显示未发货（包括已下单和已接单）订单</el-button>
                    <el-button type="primary" icon="el-icon-folder-add" @click="onDisplayAll">显示所有订单</el-button>
                </div>
                <div>
                    <!--el-button @click="toggleSelection([showData[1], showData[2]])">切换第二、第三行的选中状态</el-button>
                    <el-button @click="toggleSelection()">取消选择</el-button-->
                    <el-button type="success" icon="el-icon-truck" @click="onDeliverBatch">批量发货</el-button>
                    <el-button type="warning" icon="el-icon-lock" @click="onLockBatch">批量接单</el-button>
                    <el-button type="danger" icon="el-icon-delete" @click="onDeleteBatch">批量删除订单</el-button>
                </div>
            </el-header>
            <el-main>
                <h2>订单管理后台</h2>
                <el-table ref="multipleTable" @selection-change="handleSelectionChange" :data="showData" border
                    style="width: 100%" size="mini" :row-style="rowStyle">
                    <el-table-column type="selection" width="55">
                    </el-table-column>
                    <el-table-column label="Número De Serie" width="50">
                        <template slot="header">序号</template>
                        <template slot-scope="scope">{{ (currentPage - 1) * pageSize + scope.$index + 1 }}</template>
                    </el-table-column>
                    <el-table-column prop="UserName" label="用户名" width="120"></el-table-column>
                    <el-table-column prop="OrderID" label="订单号" width="80"></el-table-column>
                    <el-table-column prop="ProductID" label="产品ID" width="120"> </el-table-column>
                    <el-table-column prop="SubCategory" label="子类" width="150"></el-table-column>
                    <el-table-column prop="Address" label="收货地址" width="150"></el-table-column>
                    <el-table-column prop="ProductNum" width="80">
                        <template slot="header">订购数量</template>
                    </el-table-column>
                    <el-table-column prop="OrderDate" label="订单日期" width="135"></el-table-column>
                    <el-table-column prop="Status" label="状态" width="100" :formatter="formatStatus"></el-table-column>
                    <el-table-column label="操作" width="170">
                        <template slot-scope="scope">
                            <el-button v-if="scope.row.Status !== 9" size="medium" type="success" icon="el-icon-truck"
                                @click="onDeliverRow(scope.$index)" circle></el-button>
                            <el-button v-if="scope.row.Status !== 9" type="warning" icon="el-icon-lock"
                                @click="onLockRow(scope.$index)" circle></el-button>
                            <el-button v-if="scope.row.Status !== 9" type="danger" icon="el-icon-delete"
                                @click="onDeleteRow(scope.$index)" circle></el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <el-form :inline="true">
                    <el-row style="margin-top: 10px">
                        <el-col :span="8">
                            <p></p>
                        </el-col>
                        <el-col :span="10" style="text-align: right; margin-top: 0px">
                            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                                :current-page="currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="10"
                                layout="total, sizes, prev, pager, next, jumper" :total="searchLength">
                            </el-pagination>
                        </el-col>
                    </el-row>
                </el-form>
                <div style="margin-top: 10px;">
                    <el-progress v-if="showProgress" :text-inside="true" :color="customColors" :stroke-width="20"
                        :percentage="progress"></el-progress>
                </div>
            </el-main>
            <!--el-footer style="line-height: 30px; height: 30px">Footer</el-footer-->
        </el-container>
    </div>
</template>


<script>
// @ is an alias to /src
export default {
    name: "MyOrders",

    data() {
        return {
            form: {  //表单
                fuzzyQuery: '',  //模糊查询条件
            },
            progress: 0,    //进度条进度 0-100
            showProgress: true, //是否显示进度条
            customColors: [
                { color: '#e6a23c', percentage: 80 },  //橙色
                { color: '#67c23a', percentage: 100 },    //绿色
            ],
            totalData: [],      //所有数据
            searchData: [],  //根据条件筛选后数据集
            searchLength: 0,   //数据个数
            showData: [],    //当前显示的数据
            pageSize: 10, //每页展示的数据个数
            currentPage: 1,  //当前页
            isGetAll: false,   //是否已经获取所有数据
            //多选框
            multipleSelection: [],
        };
    },

    beforeRouteEnter: (to, from, next) => {
        //alert("进入Debt路由");
        next((vm) => {
            vm.startProgress();
            vm.getData('admin_unsettled');   //获取未成交的订单，就是Status!=9的所有订单
        });
    },
    /*
    mounted: ()=>{
        alert('mounted')
        this.getData()
    },
    */
    methods: {
        toggleSelection(rows) { //暂时不用
            if (rows) {
                rows.forEach(row => {
                    this.$refs.multipleTable.toggleRowSelection(row);
                });
            } else {
                this.$refs.multipleTable.clearSelection();
            }
        },
        handleSelectionChange(val) {
            this.multipleSelection = val; //val是所有选中行的数据
            console.log(`val = `, ...this.multipleSelection);
        },
        onDeliverBatch() {
            if (this.multipleSelection.length == 0) {
                return;
            }
            let ids = [];
            this.multipleSelection.forEach(item => {
                if (item.Status == 9){
                    this.$message('排除已收货状态的订单');
                    return; //foreach的return相当于continue
                }
                ids.push(item.OrderID);
            });
            this.sendUpdatePost(ids, 2);    //改为'🚛发货中'状态
        },
        onLockBatch(){
            if (this.multipleSelection.length == 0) {
                return;
            }
            let ids = [];
            this.multipleSelection.forEach(item => {
                if (item.Status == 9){
                    this.$message('排除已收货状态的订单');
                    return; //foreach的return相当于continue
                }
                ids.push(item.OrderID);
            });
            this.sendUpdatePost(ids, 1);    //改为'🔒已接单'状态
        },
        onDeliverRow(scopeIndex) {
            const orderID = this.showData[scopeIndex].OrderID;
            let ids = [];
            ids.push(orderID);
            this.sendUpdatePost(ids, 2);  //改为'🚛发货中'状态
        },
        onLockRow(scopeIndex) {
            const orderID = this.showData[scopeIndex].OrderID;
            let ids = [];
            ids.push(orderID);
            this.sendUpdatePost(ids, 1); //改为'🔒已接单'状态
        },
        sendUpdatePost(orderIDs, status) {
            let orders = [];
            orderIDs.forEach(item => {
                const order = {
                    OrderID: item,
                    UserID: this.$store.getters.getUserID,
                    Status: status,
                };
                orders.push(order);
            })
            this.axios({
                method: "post",
                //url: "http://localhost:24686/api/debt_daily",   //后端服务器的实际端口
                //url: "http://35.203.42.244:31111/api/debt_daily", //通过ngnix反向代理
                //url: "http://104.225.234.236:31111/api/debt_daily", //通过ngnix反向代理
                url: "/api/order",
                //params:{} //params是作为URL里的查询参数传递
                data: {
                    operation: 'update',
                    orders: orders,
                },
                headers: {
                    'Content-Type': 'application/json'  // 明确指定 JSON 格式
                },
            })
                .then((repos) => {
                    //console.log(repos.data);
                    if (repos.data.Success == "true") {
                        //alert("ConfirmReceipt成功");
                        this.$notify({
                            title: '成功',
                            message: `修改状态成功`,
                            type: 'success',
                        });
                        orderIDs.forEach(orderID =>{
                            let index = this.totalData.findIndex(item => item.OrderID === orderID);
                        if (index != -1) {
                            this.totalData[index].Status = status;
                        }
                        index = this.searchData.findIndex(item => item.OrderID === orderID);
                        if (index != -1) {
                            this.searchData[index].Status = status;
                        }
                        })
                        this.searchLength = this.searchData.length;
                        this.changeShowPage();
                    } else {
                        this.$notify({
                            title: '失败',
                            message: `提交ConfirmReceipt错误，请重新登陆后再试`,
                            type: 'error',
                        });
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        onDeleteBatch() {
            if (this.multipleSelection.length == 0) {
                return;
            }
            let ids = [];
            this.multipleSelection.forEach(item => {
                ids.push(item.OrderID);
            });
            this.sendDeletePost(ids);
        },
        onDeleteRow(scopeIndex) {
            const orderID = this.showData[scopeIndex].OrderID;
            let ids = [];
            ids.push(orderID);
            this.sendDeletePost(ids);
        },
        sendDeletePost(orderIDs) {
            let orders = [];
            orderIDs.forEach(item => {
                const order = {
                    OrderID: item,
                    UserID: this.$store.getters.getUserID,
                };
                orders.push(order);
            })
            this.axios({
                method: "post",
                //url: "http://localhost:24686/api/debt_daily",   //后端服务器的实际端口
                //url: "http://35.203.42.244:31111/api/debt_daily", //通过ngnix反向代理
                //url: "http://104.225.234.236:31111/api/debt_daily", //通过ngnix反向代理
                url: "/api/order",
                //params:{} //params是作为URL里的查询参数传递
                data: {
                    operation: 'delete',
                    orders: orders,
                },
                headers: {
                    'Content-Type': 'application/json'  // 明确指定 JSON 格式
                },
            })
                .then((repos) => {
                    //console.log(repos.data);
                    if (repos.data.Success == "true") {
                        this.$notify({
                            title: '成功',
                            message: `取消订单成功`,
                            type: 'success',
                        });
                        orderIDs.forEach(orderID => {
                            let index = this.totalData.findIndex(item => item.OrderID === orderID)
                            if (index != -1) {
                                this.totalData.splice(index, 1)
                            }
                            index = this.searchData.findIndex(item => item.OrderID === orderID)
                            if (index != -1) {
                                this.searchData.splice(index, 1)
                            }
                        })
                        this.searchLength = this.searchData.length;
                        this.changeShowPage();
                    } else {
                        this.$notify({
                            title: '失败',
                            message: `提交delete order错误，请重新登陆后再试`,
                            type: 'error',
                        });
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        rowStyle({ row }) {
            switch (row.Status) {
                case 9:
                    return { backgroundColor: '#a8a6a8' }; // 浅灰色
                default:
                    return {};
            }
        },
        formatStatus(row, column, cellValue) {
            switch (cellValue) {
                case 0:
                    return '🧾已下单';
                case 1:
                    return '🔒已接单';
                case 2:
                    return '🚛发货中';
                case 9:
                    return '✔已收货';
                default:
                    return '未知状态';
            }
        },
        onDisplayNoBought() {
            //显示 '🧾已下单'和'🔒已接单'两种状态
            //alert('onDisplayNoBought');
            this.searchData = [];
            this.totalData.forEach(item => {
                if (item.Status == 0 || item.Status == 1) {
                    this.searchData.push(item);
                }
            });
            this.searchLength = this.searchData.length;
            this.changeShowPage();
        },
        onDisplayAll() {
            //显示所有
            //alert('onDisplayAll');
            if (!this.isGetAll){
                //如果没有获取过所有数据，那么发送获取所有数据请求
                this.getData('admin_all')
            }
            this.searchData = this.totalData;
            this.searchLength = this.searchData.length;
            this.changeShowPage();
        },
        startProgress() {
            const interval = setInterval(() => {
                if (this.progress < 100) {
                    this.progress += 10;
                } else {
                    clearInterval(interval);
                    setTimeout(() => {
                        this.showProgress = false;
                    }, 1000); // 1秒后隐藏进度条
                }
            }, 1000); // 每秒增加10%
        },
        getData(volume) {
            this.axios({
                method: "get",
                //url: "http://localhost:24686/api/debt_daily",   //后端服务器的实际端口
                //url: "http://35.203.42.244:31111/api/debt_daily", //通过ngnix反向代理
                //url: "http://104.225.234.236:31111/api/debt_daily", //通过ngnix反向代理
                url: "/api/order",
                params: {    //params是作为URL里的查询参数传递
                    volume: volume,
                    userid: this.$store.getters.getUserID,
                },
            })
                .then((repos) => {
                    //alert("收到回复")
                    //console.log(repos.data);
                    if (repos.data.Success == "true") {
                        //alert("成功")
                        this.totalData = this.$removeExtraSpaces(repos.data.AnyBody);   //去两个以上的重复空格
                        this.searchData = this.totalData;
                        this.searchLength = this.searchData.length;
                        this.changeShowPage();
                    } else {
                        this.$notify({
                            title: '失败',
                            message: `获取不到订单记录`,
                            type: 'error',
                        });
                    }
                    this.progress = 100;
                })
                .catch((error) => {
                    console.log(error);
                });
        },
        handleSizeChange(val) {
            console.log(`每页 ${val} 条`);
            this.pageSize = val;
            this.changeShowPage();
        },
        handleCurrentChange(val) {
            console.log(`当前页: ${val}`);
            this.currentPage = val;
            this.changeShowPage();
        },
        changeShowPage() {
            var start = (this.currentPage - 1) * this.pageSize;
            var end = (this.currentPage - 1) * this.pageSize + this.pageSize;
            var str = "start=" + start + " end=" + end;
            console.log(str);
            this.showData = this.searchData.slice(start, end);
        },
        onPageUp() {
            if (this.currentPage > 1) {
                this.handleCurrentChange(this.currentPage - 1);
            }
        },
        onPageDown() {
            if (this.currentPage * this.pageSize < this.searchLength) {
                this.handleCurrentChange(this.currentPage + 1);
            }
        },
    },
};
</script>

<style scoped>
.el-container {
    margin: 0px;
    padding: 0px;
    height: 100%;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
}

.el-table .highlight-row {
    background-color: #a8a6a8;
}
</style>