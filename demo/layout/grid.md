```vue
<template>
  <el-container class="ap-layout-demo">
    <el-aside width="100px">Aside</el-aside>
    <el-container>
      <el-header>Header</el-header>
      <el-main>
        <ReGridPage :columns="{ sm: 2, lg: 3, _960px: 3 }" :dense="dense">
          <ReGridPageItem><RePageCard>Role1</RePageCard></ReGridPageItem>
          <ReGridPageItem><RePageCard>Role1</RePageCard></ReGridPageItem>
          <ReGridPageItem><RePageCard>Role1</RePageCard></ReGridPageItem>
          <ReGridPageItem :c-span="6"
            ><RePageCard>dense: <el-switch v-model="dense" /></RePageCard
          ></ReGridPageItem>
          <ReGridPageItem :r-span="2"
            ><RePageCard h-full>Role1</RePageCard></ReGridPageItem
          >
          <ReGridPageItem><RePageCard>Role1</RePageCard></ReGridPageItem>
          <ReGridPageItem><RePageCard>Role1</RePageCard></ReGridPageItem>
          <ReGridPageItem><RePageCard>Role1</RePageCard></ReGridPageItem>
          <ReGridPageItem :c-span="2"
            ><RePageCard>Role1</RePageCard></ReGridPageItem
          >
          <ReGridPageItem><RePageCard>Role1</RePageCard></ReGridPageItem>
          <ReGridPageItem><RePageCard>Role1</RePageCard></ReGridPageItem>
        </ReGridPage>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const dense = ref(false);
</script>

<style lang="scss">
.ap-layout-demo {
  height: 200px;
  background-color: #f2f3f5;

  .el-main {
    padding: 0;
  }

  .el-header {
    padding: 0 16px;
    height: 40px;
    background-color: #fff;
    border-bottom: 1px solid #e4e7ed;
  }

  .el-aside {
    padding: 16px;
    background-color: #fff;
    border-right: 1px solid #e4e7ed;
  }
}
</style>
```
