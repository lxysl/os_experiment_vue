<template>
  <div>
    <el-container>
      <el-header>{{ msg }}</el-header>
      <el-container style="height: 500px">
        <el-aside width="40%" style="padding: 20px">
          <el-tabs v-model="operationName" type="border-card">
            <el-tab-pane label="创建进程" name="tab_first" style="height: 380px">
              <el-form ref="form" :model="form" label-width="80px">
                <el-form-item label="所需时间">
                  <el-input v-model="form.time"></el-input>
                </el-form-item>
                <el-form-item label="所需内存">
                  <el-input v-model="form.ram"></el-input>
                </el-form-item>
                <el-form-item label="优先级">
                  <el-select v-model="form.priority" placeholder="请选择进程优先级">
                    <el-option label="1" value="1"></el-option>
                    <el-option label="2" value="2"></el-option>
                    <el-option label="3" value="3"></el-option>
                    <el-option label="4" value="4"></el-option>
                    <el-option label="5" value="5"></el-option>
                    <el-option label="6" value="6"></el-option>
                    <el-option label="7" value="7"></el-option>
                    <el-option label="8" value="8"></el-option>
                    <el-option label="9" value="9"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="进程属性">
                  <el-radio-group v-model="form.property">
                    <el-radio label="0">独立进程</el-radio>
                    <el-radio label="1">同步进程</el-radio>
                  </el-radio-group>
                </el-form-item>
                <el-form-item label="前驱进程">
                  <el-select v-model="form.precursor" multiple placeholder="请选择前驱进程" :disabled="precursor_flag">
                    <el-option
                        v-for="item in precursor_options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-form>
              <el-button type="primary" @click="createPCB">立即创建</el-button>
            </el-tab-pane>
            <el-tab-pane label="挂起 / 解挂进程" name="tab_second" style="height: 380px">
              <div style="text-align: center; padding-top: 40px">
                <el-transfer
                    style="text-align: left; display: inline-block"
                    v-model="hanging_value"
                    :titles="['未挂起', '挂起']"
                    :format="{
                      noChecked: '0/${total}',
                      hasChecked: '${checked}/${total}'
                    }"
                    @change="hangingDataChange"
                    :data="non_hanging_pcb_value">
                  <span slot-scope="{ option }">{{ option.key }}</span>
                </el-transfer>
              </div>
            </el-tab-pane>
            <el-tab-pane label="运行" name="tab_forth" style="height: 380px">
              <el-button type="primary" @click="refresh">刷新</el-button>
              <el-button type="primary" @click="run">运行</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-aside>
        <el-main width="60%">
          <el-table :data="pcbData" border style="width: 100%" height="450">
            <el-table-column fixed prop="pid" label="进程号" width="80" align="center"></el-table-column>
            <el-table-column prop="time" label="进程所需时间" width="120" align="center"></el-table-column>
            <el-table-column prop="ram" label="进程所需内存" width="120" align="center"></el-table-column>
            <el-table-column prop="priority" label="进程优先级" width="120" align="center"></el-table-column>
            <el-table-column prop="state" label="进程状态" width="120" align="center"></el-table-column>
            <el-table-column prop="property" label="进程属性" width="120" align="center"></el-table-column>
            <el-table-column prop="precursor" label="进程前驱" width="200" align="center"></el-table-column>
            <el-table-column prop="successor" label="进程后继" width="200" align="center"></el-table-column>
          </el-table>
        </el-main>
      </el-container>
      <el-container>
        <el-aside width="40%" style="padding: 20px">
          <el-tabs v-model="displayName" type="border-card">
            <el-tab-pane label="内存空间" name="tab_first" style="height: 380px">
              <el-table :data="mainMemory" border style="width: 100%" height="380">
                <el-table-column fixed prop="memory_PCB" label="进程号" width="125" align="center"></el-table-column>
                <el-table-column prop="start" label="起址" width="125" align="center"></el-table-column>
                <el-table-column prop="length" label="长度" width="130" align="center"></el-table-column>
                <el-table-column prop="memory_state" label="分配情况" width="130" align="center"></el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="处理机" name="tab_second" style="height: 380px">
              <div v-for="processor in processors" :key="processor.id" style="float: left">
                <el-table :data="processor.pid_list" border style="width: 100%" height="380">
                  <el-table-column v-bind:label="processor.id" style="margin-bottom: 10px" align="center">
                    <el-table-column fixed prop="pid" label="进程号" width="120" align="center"></el-table-column>
                  </el-table-column>
                </el-table>
              </div>
            </el-tab-pane>
            <el-tab-pane label="后备队列" name="tab_third" style="height: 380px">
              <el-table :data="backupQueue" border style="width: 100%" height="380">
                <el-table-column fixed prop="pid" label="进程号" align="center"></el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="挂起队列" name="tab_forth" style="height: 380px">
              <el-table :data="hangingQueue" border style="width: 100%" height="380">
                <el-table-column fixed prop="pid" label="进程号" align="center"></el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-aside>
        <el-main width="60%">
          <div class="demo-fit">
            <div class="block" v-for="fit in fits" :key="fit">
              <span class="title">{{ fit }}</span>
              <el-avatar shape="square" :size="100" :fit="fit" :src="url"></el-avatar>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>

export default {
  name: "os",
  props: {
    msg: String
  },
  data() {
    return {
      operationName: 'tab_first',
      displayName: 'tab_first',
      fits: ['fill'],
      url: 'https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg',
      form: {
        time: '',
        ram: '',
        priority: '',
        property: '',
        precursor: [],
      },
      pcbData: [],
      mainMemory: [],
      processors: [],
      backupQueue: [],
      hangingQueue: [],
    };
  },
  computed: {
    precursor_flag: function () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.form.precursor = [];
      return this.form.property === '0' || this.form.property === '';
    },
    precursor_options: function () {
      // 提取可选前驱进程
      var options = [];
      for (var i = 0; i < this.pcbData.length; i++) {
        options.push({
          'value': this.pcbData[i].pid,
          'label': this.pcbData[i].pid,
        });
      }
      return options;
    },
    non_hanging_pcb_value: function () {
      var values = [];
      for (var i = 0; i < this.pcbData.length; i++) {
        if (this.pcbData[i].state !== '进程结束'){
          values.push({
            'key': this.pcbData[i].pid,
          });
        }
      }
      return values;
    },
    hanging_value: function () {
      var values = [];
      for (var i = 0; i < this.hangingQueue.length; i++) {
        values.push(this.hangingQueue[i].pid);
      }
      return values;
    }
  },
  watch: {
    pcbData: function () {
      this.getMainMemory();
      this.getProcessors();
      this.getBackupQueue();
      this.getHangingQueue();
    },
  },
  methods: {
    refresh() {
      this.$axios({
        method: "get",
        url: "http://127.0.0.1:5000/os/get_PCB_list", // 接口地址
      }).then(response => {
        console.log(response);   // 成功的返回
        this.pcbData = this.transferPCB(response.data['pcb_list']); // 将返回的数据转换为用于在表格中显示的形式
      }).catch(error => console.log(error, "error")); // 失败的返回
    },
    run() {
      this.$axios({
        method: "get",
        url: "http://127.0.0.1:5000/os/run",
      }).then(response => {
        console.log(response);
        this.pcbData = this.transferPCB(response.data['pcb_list']);
      }).catch(error => {
        console.log(error.response, "error");
        this.$message({
          message: error.response.data.errMsg,
          type: 'error'
        });
      });
    },
    createPCB() {
      if (this.form.property === 1 && this.form.precursor.length === 0) {
        this.form.property = 0;
        this.$message({
          message: '未选择前驱进程，已切换为独立进程！',
          type: 'warning'
        });
      }
      this.$axios({
        method: "post",
        url: "http://127.0.0.1:5000/os/create_PCB", // 接口地址
        data: {'form': this.form,}
      }).then(response => {
        console.log(response);   // 成功的返回
        this.pcbData = this.transferPCB(response.data['pcb_list']); // 将返回的数据转换为用于在表格中显示的形式
      }).catch(error => {
        console.log(error.response, "error");
        this.$message({
          message: error.response.data.errMsg,
          type: 'error'
        });
      }); // 失败的返回
    },
    transferPCB(pcb_list) {
      // 将返回的数据转换为用于在表格中显示的形式
      for (var i = 0; i < pcb_list.length; i++) {
        switch (pcb_list[i].property) {
          case 'INDEPENDENT':
            pcb_list[i].property = '独立进程';
            break;
          case 'SYNCHRONIZED':
            pcb_list[i].property = '同步进程';
            break;
        }
        switch (pcb_list[i].state) {
          case 'CREATE':
            pcb_list[i].state = '创建';
            break;
          case 'ACTIVE_READY':
            pcb_list[i].state = '活动就绪';
            break;
          case 'STATIC_READY':
            pcb_list[i].state = '静止就绪';
            break;
          case 'RUNNING':
            pcb_list[i].state = '进程运行';
            break;
          case 'SUSPENDING':
            pcb_list[i].state = '进程挂起';
            break;
          case 'EXIT':
            pcb_list[i].state = '进程结束';
            break;
        }
        if (pcb_list[i].precursor.length === 0) {
          pcb_list[i].precursor = '无';
        } else {
          pcb_list[i].precursor = pcb_list[i].precursor.join(',');
        }
        if (pcb_list[i].successor.length === 0) {
          pcb_list[i].successor = '无';
        } else {
          pcb_list[i].successor = pcb_list[i].successor.join(',');
        }
      }
      return pcb_list;
    },
    transferMainMemory(main_memory) {
      for (var i = 0; i < main_memory.length; i++) {
        switch (main_memory[i].memory_state) {
          case 'UNASSIGNED':
            main_memory[i].memory_state = '未分配';
            break;
          case 'ASSIGNED':
            main_memory[i].memory_state = '已分配';
            break;
          case 'OS_ASSIGNED':
            main_memory[i].memory_state = '操作系统';
            break;
        }
      }
      return main_memory;
    },
    getMainMemory() {
      this.$axios({
        method: "get",
        url: "http://127.0.0.1:5000/os/get_main_memory",
      }).then(response => {
        console.log(response);
        this.mainMemory = this.transferMainMemory(response.data['main_memory']);
      }).catch(error => console.log(error, "error"));
    },
    getProcessors() {
      this.$axios({
        method: "get",
        url: "http://127.0.0.1:5000/os/get_processors",
      }).then(response => {
        console.log(response);
        this.processors = response.data['processors'];
      }).catch(error => console.log(error, "error"));
    },
    getBackupQueue() {
      this.$axios({
        method: "get",
        url: "http://127.0.0.1:5000/os/get_backup_queue",
      }).then(response => {
        console.log(response);
        this.backupQueue = response.data['backup_queue'];
      }).catch(error => console.log(error, "error"));
    },
    getHangingQueue() {
      this.$axios({
        method: "get",
        url: "http://127.0.0.1:5000/os/get_hanging_queue",
      }).then(response => {
        console.log(response);
        this.hangingQueue = response.data['hanging_queue'];
      }).catch(error => console.log(error, "error"));
    },
    hangingDataChange(hangingPIDs, direction, movedPIDs) {
      // hangingPIDList：所有挂起的pid列表
      // direction：移动方向
      // movedPIDList：本次移动的pid列表
      console.log(hangingPIDs, direction, movedPIDs);
      if (direction === 'right') {
        this.hangPCBList(movedPIDs);
      }
      if (direction === 'left') {
        this.unhangPCBList(movedPIDs);
      }
    },
    hangPCBList(pcbList) {
      this.$axios({
        method: "post",
        url: "http://127.0.0.1:5000/os/hang_PCB_list",
        data: {'form': pcbList,}
      }).then(response => {
        console.log(response);
        this.pcbData = this.transferPCB(response.data['pcb_list']);
      }).catch(error => console.log(error, "error"));
    },
    unhangPCBList(pcbList) {
      this.$axios({
        method: "post",
        url: "http://127.0.0.1:5000/os/unhang_PCB_list",
        data: {'form': pcbList,}
      }).then(response => {
        console.log(response);
        this.pcbData = this.transferPCB(response.data['pcb_list']);
      }).catch(error => console.log(error, "error"));
    }
  }
}
</script>

<style>
.el-header, .el-footer {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
}

.el-aside {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
}

.el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
}

.el-transfer-panel {
  width: 150px !important;
}
</style>