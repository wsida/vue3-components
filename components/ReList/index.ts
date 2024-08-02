import ReList from "./src/List.vue";
import ReListItem from "./src/Item.vue";
import ReListCardItem from "./src/CardItem.vue";
import RePageList from "./src/PageList.vue";
import ReScrollList from "./src/ScrollList.vue";
import ReVirtualList from "./src/VirtualList.vue";
import type { App } from "vue";

export * from "./types";

export default {
  install(app: App) {
    app.component(ReList.name, ReList);
    app.component(ReListItem.name, ReListItem);
    app.component(ReListCardItem.name, ReListCardItem);
    app.component(RePageList.name, RePageList);
    app.component(ReScrollList.name, ReScrollList);
    app.component(ReVirtualList.name, ReVirtualList);
  }
};
