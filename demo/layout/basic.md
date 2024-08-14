```vue
<template>
  <el-container class="ap-layout-demo">
    <el-aside width="100px">Aside</el-aside>
    <el-container>
      <el-header>Header</el-header>
      <el-main>
        <RePage>
          <RePageCard>Content1</RePageCard>
          <RePageCard>Content2</RePageCard>
        </RePage>
      </el-main>
    </el-container>
  </el-container>
</template>

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
