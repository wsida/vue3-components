import { debounce } from 'lodash-es'
import { onScopeDispose, ref, watch } from 'vue'
import type { Ref } from 'vue'

export function useDrawerSize(visible: Ref<boolean>): Ref<string> {
  const size = ref(window.innerWidth > 1440 ? '1440px' : '100%')
  watch(
    visible,
    (val) => {
      if (val) {
        size.value = window.innerWidth > 1440 ? '1440px' : '100%'
      }
    }
  )
  return size
}

export function useEditorHeight(offset: number, min = 0): Ref<number> {
  const minHeight = ref(Math.max(window.innerHeight - offset, min))

  const resizeHandler = debounce(() => {
    minHeight.value = Math.max(window.innerHeight - offset, min)
  }, 300)

  window.addEventListener('resize', resizeHandler)

  onScopeDispose(() => {
    window.removeEventListener('resize', resizeHandler)
  })

  return minHeight
}