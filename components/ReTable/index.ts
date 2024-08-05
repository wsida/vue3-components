import ReTable from "./src/main.vue";
import RePageTable from "./src/page.vue";
import type { App } from "vue";

export default {
  install(app: App) {
    app.component(ReTable.name, ReTable);
    app.component(RePageTable.name, RePageTable);
  }
};
