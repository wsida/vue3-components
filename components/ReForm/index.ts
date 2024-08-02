import ReForm from "./src/index.vue";
import ReFormRenderItems from "./src/renderItems.vue";
import ReFormRenderItem from "./src/renderItem.vue";
import ReDrawerForm from "./src/drawerForm.vue";
import ReModalForm from "./src/modalForm.vue";
import ReSearchForm from "./src/searchForm.vue";
import type { App } from "vue";
import useForm from "./src/useForm";

export * from "./types";

export { useForm };

export default {
  install(app: App) {
    app.component(ReForm.name, ReForm);
    app.component(ReFormRenderItems.name, ReFormRenderItems);
    app.component(ReFormRenderItem.name, ReFormRenderItem);
    app.component(ReDrawerForm.name, ReDrawerForm);
    app.component(ReModalForm.name, ReModalForm);
    app.component(ReSearchForm.name, ReSearchForm);
  }
};
