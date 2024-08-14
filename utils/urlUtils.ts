import { isEmpty } from "lodash-es";

/**
 * Created by simon on 2016/8/3.
 */

const UrlUtils = {
  linkArgs: function (args: Record<string, any>) {
    if (isEmpty(args)) {
      return "";
    }
    const items: any = [];
    for (const key of Object.keys(args)) {
      items.push(key + "=" + encodeURIComponent(args[key]));
    }
    return items.join("&");
  },

  getPagePath: function (url: string) {
    const index = url.indexOf("?");
    if (index > 0) {
      url = url.substring(0, index);
    }
    return this.trimHash(url);
  },

  buildLink: function (url: string, args?: Record<string, any>) {
    if (isEmpty(args)) {
      return url;
    }
    if (url.indexOf("?") > 0) {
      return url + "&" + this.linkArgs(args);
    } else {
      return url + "?" + this.linkArgs(args);
    }
  },

  trimHash: function (url: string) {
    const index = url.indexOf("#");
    if (index >= 0) {
      return url.substring(0, index);
    }
    return url;
  },

  getUrlArg: function (name: string, url: string) {
    const args = this.getUrlArgs(url);
    if (args.hasOwnProperty(name)) {
      return args[name];
    }
    return "";
  },

  getUrlArgs: function (url: string) {
    if (isEmpty(url)) {
      url = document.URL;
    }
    url = this.trimHash(url);
    const index = url.indexOf("?");
    if (index >= 0) {
      url = url.substring(index + 1);
    } else {
      return {};
    }
    return this.parseArgs(url);
  },

  parseArgs: function (query: string) {
    if (isEmpty(query)) {
      return {};
    }
    const result = {};
    const matrix = (query as string).split("&");
    for (let i = 0; i < matrix.length; i++) {
      const temp = matrix[i];
      const index = temp.indexOf("=");
      if (index > 0) {
        result[temp.substring(0, index)] = temp.substring(index + 1);
      } else {
        result[temp.substring(0, index)] = "";
      }
    }
    return result;
  }
};

export { UrlUtils };
