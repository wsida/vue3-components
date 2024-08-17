import TableSelect from "./src/main.vue";
import TableSelectPopper from "./src/popper.vue";
import TableSelection from "./src/selection.vue";

import type { App } from "vue";

export * from "./types";

export default {
  install(app: App) {
    app.component(TableSelect.name, TableSelect);
    app.component(TableSelection.name, TableSelection);
    app.component(TableSelectPopper.name, TableSelectPopper);
  }
};
