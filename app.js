'use strict';
let url = 'https://standardebooks.org';
let vm = new Vue({
  el: '#app',
  data: {
    items: [],
    total: 0,
  },
  created: function() {
    let page = '/ebooks/?page=';
    let maxPage = 16;
    for (let i = 1; i <= maxPage; i++) {
      this.scrap(page + i, this.handleList, this.extractList);
    }
  },
  methods: {
    scrap: function(file, handle, extract) {
      fetch(url + file)
      .then(resp => resp.text())
      .then(text => handle(extract(text)));
    },
    extractList: function(text) {
      let html = $.parseHTML(text)
      let ol = html[43].children[0].children[2].children;
      let list = [];
      for (let li of ol) {
        let link = li.children[0].attributes[0].value;
        list.push(link);
      }
      return list;
    },
    handleList: function(list) {
      for (let file of list) {
        this.scrap(file, this.handleItem, this.extractItem);
        this.total++;
      }
    },
    extractItem: function(text) {
      let html = $.parseHTML(text);
      html.reverse();
      let article = null;
      for (let node of html) {
        if (node.localName === 'main') {
          article = node.children[0].children;
          break;
        }
      }
      let header = article[0].children[0].children;
      let ol = article[3].children[2].children;
      let item = {
        title: header[0].innerText,
        author: header[1].innerText,
      };
      for (let li of ol) {
        let a = li.children[0].children[0].children[0];
        let format = a.innerText;
        let file = a.attributes[0].value;
        item[format] = url + file;
      }
      return item;
    },
    handleItem: function(item) {
      this.items.push(item);
    },
  },
});
