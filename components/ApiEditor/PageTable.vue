<template>
  <div class="es-page-table-wrapper">
    <el-table v-bind="$attrs" class="es-page-table-wrapper__table" :data="pageData" style="width: 100%">
      <slot></slot>
    </el-table>
    <div v-if="!!this.pagination" class="mt-12px">
      <el-pagination
        class="es-page-table-wrapper__table"
        v-bind="paginationProps"
        @size-change="handleSizeChange"
        @current-change="handleCurrentPageChange"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'PageTable',
  inheritAttrs: false,
  emits: {
    'size-change': (pageSize: number) => true,
    'page-change': (currentPage: number) => true
  },
  props: {
    data: {
      type: Array,
      default: () => ([])
    },

    pagination: {
      type: [Boolean, Object],
      default: true
    },

    remote: Boolean,
    total: Number,
    pageSize: {
      type: Number,
      default: 20
    },
    currentPage: {
      type: Number,
      default: 1
    }
  },

  data() {
    return {
      localCurrentPage: 1,
      localPageSize: 20,
      defaultPagination: {
        hideOnSinglePage: true,
        layout: 'total, ->, sizes, prev, pager, next',
        background: true
      }
    }
  },

  computed: {
    pageData() {
      if (this.remote) return this.data
      if (!this.pagination) return this.data
      const page = this.localCurrentPage
      const pageSize = this.paginationProps.pageSize
      const startIndex = (page - 1) * pageSize
      return this.data.slice(startIndex, startIndex + pageSize)
    },

    actualCurrentPage() {
      if (this.remote) return this.currentPage
      return this.localCurrentPage
    },

    actualPageSize() {
      if (this.remote) return this.pageSize
      return this.localPageSize
    },

    paginationProps() {
      let props = {
        ...this.defaultPagination
      }

      if (typeof this.pagination !== 'boolean') {
        props = {
          ...props,
          ...this.pagination
        }
      }

      if (!!this.pagination) {
        props = {
          ...props,
          total: this.data.length,
          pageSize: this.pageSize,
          currentPage: this.actualCurrentPage
        }
      }

      if (this.remote) {
        props = {
          ...props,
          total: this.total
        }
      }

      return props
    }
  },

  methods: {
    handleSizeChange(pageSize: number): void {
      this.$emit('size-change', pageSize)
      this.localPageSize = pageSize
    },
    handleCurrentPageChange(currentPage: number): void {
      this.$emit('page-change', currentPage)
      this.localCurrentPage = currentPage
    }
  }
})
</script>
