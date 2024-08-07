import ReTable from "./src/main.vue";
import RePageTable from "./src/page.vue";
import ReEditTable from "./src/editor.vue";
import ReVirtualEditTable from "./src/virtual-editor.vue";
import type { App } from "vue";

export default {
  install(app: App) {
    app.component(ReTable.name, ReTable);
    app.component(RePageTable.name, RePageTable);
    app.component(ReEditTable.name, ReEditTable);
    app.component(ReVirtualEditTable.name, ReVirtualEditTable);
  }
};
