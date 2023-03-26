
<template>
  <div>
    <div class="content">
      <a-button type="primary" @click="addFirstItem">增加一级节点</a-button>
      <a-tree :tree-data="treeSource" :expandedKeys="expandedData" @expand="handleExpand">
        <a-icon slot="icon" type="carry-out" />
        <!-- 插槽名称写死为custom,需要传入的treeData中需要用到自定义插槽的对象中增加scopedSlots: { title: "custom" }属性 -->
        <template slot="custom" slot-scope="item">
          <span v-if="item.isEdit">
            <a-input
              ref="new"
              type="text"
              class="editInput"
              v-model.trim="newItem"
              @pressEnter="addConfirm(item)"
            />
            <a-icon type="close-circle" style="margin-right: 5px" @click="addCancel(item)" />
            <a-icon type="check-circle" @click="addConfirm(item)" />
          </span>
          <div v-else>
            <span class="node-title">{{ item.title }}</span>
            <span class="icon-wrap">
              <a-icon type="plus" title="添加子集" @click="addItem(item)" />
            </span>
            <span class="icon-wrap">
              <a-icon type="form" title="编辑" @click="editItem(item)" />
            </span>
            <span class="icon-wrap">
              <a-icon type="delete" title="删除" @click="deleteItem(item)" />
            </span>
          </div>
        </template>
      </a-tree>
    </div>
  </div>
</template>

<script>
export default {
  name: 'treeEdit',
  props: {
    isRequired: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    },
    // 树的数据源，结构{scopedSlots: { title: "custom" },//插槽名称写死为custom,children:[],key:xx,title:xx,level:xx,isEdit:true}
    treeData: {
      type: Array,
      default: () => {
        return []
      }
    },
    defaultExpanded: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data() {
    return {
      treeSource: [],
      expandedData: [],
      newItem: '',
      editFlag: false, // 记录是否有已经处于编辑状态的标识
      newFlag: false // 记录是否是新建节点，用于在cancel的时候判断是该删除还是恢复原样
    }
  },
  methods: {
    handleExpand(expandedKeys) {
      this.expandedData = expandedKeys
    },
    addFirstItem() {
      if (this.editFlag) {
        this.$message.warning('已有编辑项，请先编辑完成！')
        return
      }
      this.treeSource.push({
        children: [],
        key: this.getItemNextId(),
        title: '',
        level: 1,
        scopedSlots: { title: 'custom' },
        isEdit: true
      })
      this.newItem = ''
      this.editFlag = true
      this.newFlag = true
      this.$nextTick(() => {
        this.$refs.new.focus()
      })
    },
    addItem(item) {
      if (this.editFlag) {
        this.$message.warning('已有编辑项，请先编辑完成！')
        return
      }
      item.children.push({
        children: [],
        key: this.getItemNextId(),
        title: '',
        level: item.level + 1,
        scopedSlots: { title: 'custom' },
        isEdit: true
      })
      this.newItem = ''
      this.editFlag = true
      this.newFlag = true
      this.expandedData.push(item.key)
      this.$nextTick(() => {
        this.$refs.new.focus()
      })
    },
    editItem(item) {
      if (this.editFlag) {
        this.$message.warning('已有编辑项，请先编辑完成！')
        return
      }
      item.isEdit = true
      this.newFlag = false
      this.editFlag = true
      this.newItem = item.title
      this.treeListItemActions(this.treeSource, item.key, 'edit', item)
      this.$nextTick(() => {
        this.$refs.new.focus()
      })
    },
    deleteItem(item) {
      if (item.children.length > 0) {
        let that = this
        this.$confirm({
          title: '操作提示',
          content: '将会删除此节点的所有子节点，确定删除?',
          centered: true,
          onOk() {
            that.treeListItemActions(that.treeSource, item.key, 'delete')
          },
          onCancel() {
            that.$message.info('已取消')
          }
        })
      } else {
        this.treeListItemActions(this.treeSource, item.key, 'delete')
      }
    },
    addCancel(item) {
      this.newItem = ''
      item.isEdit = false
      this.editFlag = false
      this.treeListItemActions(this.treeSource, item.key, this.newFlag ? 'delete' : 'edit', item)
    },
    addConfirm(item) {
      if (this.newItem !== null && this.newItem.trim() !== '') {
        item.title = this.newItem
        item.isEdit = false
        this.editFlag = false
        this.treeListItemActions(this.treeSource, item.key, 'edit', item)
      } else {
        this.$message.warning('不允许为空')
      }
    },
    // 获取新节点的id（时间戳加随机数）
    getItemNextId() {
      return (new Date().getTime() + Math.ceil(Math.random() * 10000)).toString()
    },
    // 根据id属性从数组（树结构）中匹配元素，执行action操作
    treeListItemActions(treeList, key, action, item) {
      if (!treeList || !treeList.length) {
        return
      }
      for (let i = 0; i < treeList.length; i++) {
        if (treeList[i].key === key) {
          if (action === 'delete') {
            treeList.splice(i, 1)
            this.$forceUpdate()
          } else if (action === 'edit') {
            treeList[i] = item
            this.$forceUpdate()
          }
          break
        }
        this.treeListItemActions(treeList[i].children, key, action, item)
      }
    },
    // 提供给调用方获取树的数据源的方法
    getData() {
      return this.treeSource
    }
  },
  created() {
    this.treeSource = JSON.parse(JSON.stringify(this.treeData))
    this.expandedData = JSON.parse(JSON.stringify(this.defaultExpanded))
  }
}
</script>

<style lang="less" scoped>
.content {
  margin-left: 10px;
  .icon-wrap {
    margin-left: 8px;
    color: #d1b38b;
  }
  .editInput {
    width: 100px;
    padding: 0;
    margin-right: 5px;
    height: 24px;
  }
  /deep/ .ant-tree li ul {
    padding: 0 0 0 10px;
  }
}
</style>

