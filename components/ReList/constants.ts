import type { ReListItemMetas } from "./types";

export const DEFAULT_LIST_ITEM_METAS: ReListItemMetas = {
  // avatar: {
  //   dataIndex: "avatar"
  // },
  title: {
    dataIndex: "title"
  },
  // subTitle: {
  //   dataIndex: "subTitle"
  // },
  // content: {
  //   dataIndex: "content"
  // },
  description: {
    dataIndex: "description"
  }
  // extra: []
};

export const DEFAULT_LIST_ITEM_RENDER_META_INDEX = Object.keys(
  DEFAULT_LIST_ITEM_METAS
);
