<template>
  <div>
    <el-container>
      <el-header>{{ msg }}</el-header>
      <el-container style="height: 500px">
        <el-aside width="30%" style="padding: 20px">
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
              <el-button type="primary" @click="submit">立即创建</el-button>
            </el-tab-pane>
            <el-tab-pane label="挂起进程" name="tab_second" style="height: 380px">挂起进程</el-tab-pane>
            <el-tab-pane label="解挂进程" name="tab_third" style="height: 380px">解挂进程</el-tab-pane>
            <el-tab-pane label="运行" name="tab_forth" style="height: 380px">
              <el-button type="primary" @click="refresh">刷新</el-button>
              <el-button type="primary" @click="run">运行</el-button>
            </el-tab-pane>
          </el-tabs>
        </el-aside>
        <el-main width="70%">
          <el-table :data="pcbData" border style="width: 100%" height="450">
            <el-table-column fixed prop="pid" label="进程号" width="80"></el-table-column>
            <el-table-column fixed prop="time" label="进程所需时间" width="120"></el-table-column>
            <el-table-column fixed prop="ram" label="进程所需内存" width="120"></el-table-column>
            <el-table-column fixed prop="priority" label="进程优先级" width="120"></el-table-column>
            <el-table-column fixed prop="property" label="进程属性" width="120"></el-table-column>
            <el-table-column fixed prop="precursor" label="进程前驱" width="200"></el-table-column>
            <el-table-column fixed prop="successor" label="进程后继" width="200"></el-table-column>
          </el-table>
        </el-main>
      </el-container>
      <el-container>
        <el-aside width="30%" style="padding: 20px">
          <el-tabs v-model="displayName" type="border-card">
            <el-tab-pane label="内存空间" name="tab_first" style="height: 380px">
              <el-table :data="mainMemory" border style="width: 100%" height="500">
                <el-table-column fixed prop="start" label="起址" width="90"></el-table-column>
                <el-table-column fixed prop="length" label="长度" width="94"></el-table-column>
                <el-table-column fixed prop="memory_state" label="分配情况" width="90"></el-table-column>
                <el-table-column fixed prop="memory_PCB" label="进程号" width="90"></el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="处理机" name="tab_second" style="height: 380px">处理机</el-tab-pane>
            <el-tab-pane label="后备队列" name="tab_third" style="height: 380px">后备队列</el-tab-pane>
            <el-tab-pane label="挂起队列" name="tab_forth" style="height: 380px">
              挂起队列
            </el-tab-pane>
          </el-tabs>
        </el-aside>
        <el-main width="70%">
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
    }
  },
  watch: {
    pcbData: function () {
      this.$axios({
        method: "get",
        url: "http://127.0.0.1:5000/os/get_main_memory", // 接口地址
      }).then(response => {
        console.log(response);   // 成功的返回
        this.mainMemory = this.transferMainMemory(response.data['main_memory']); // 将返回的数据转换为用于在表格中显示的形式
      }).catch(error => console.log(error, "error")); // 失败的返回
    }
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
        url: "http://127.0.0.1:5000/os/run", // 接口地址
      }).then(response => {
        console.log(response);   // 成功的返回
        this.pcbData = this.transferPCB(response.data['pcb_list']); // 将返回的数据转换为用于在表格中显示的形式
      }).catch(error => console.log(error, "error")); // 失败的返回
    },
    submit() {
      if(this.form.precursor.length === 0) {
        this.form.property = 0;
        alert('未选择前驱进程，已切换为独立进程！');
      }
      this.$axios({
        method: "post",
        url: "http://127.0.0.1:5000/os/create_PCB", // 接口地址
        data: {'form': this.form,}
      }).then(response => {
        console.log(response);   // 成功的返回
        this.pcbData = this.transferPCB(response.data['pcb_list']); // 将返回的数据转换为用于在表格中显示的形式
      }).catch(error => console.log(error, "error")); // 失败的返回
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
        switch (main_memory[i].memory_state){
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
    }
  }
}
</script>

<style scoped>
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
</style>