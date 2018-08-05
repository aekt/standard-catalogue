'use strict';
window.onload = () => {
  let url = 'https://standardebooks.org';
  let getPage = (i => '/ebooks/?page=' + i);
  let vm = new Vue({
    el: '#app',
    data: {
      items: [],
      total: 0,
    },
    created: function() {
      this.scrap(getPage(1), this.handleMaxPage, this.extractMaxPage);
    },
    methods: {
      scrap: function(file, handle, extract) {
        fetch(url + file)
        .then(resp => resp.text())
        .then(text => handle(extract(text)));
      },
      extractMaxPage: function(text) {
        let html = $.parseHTML(text);
        let ol = html[43].children[0].children[3].children[1].children;
        return ol.length;
      },
      handleMaxPage: function(maxPage) {
        for (let i = 1; i <= maxPage; i++) {
          this.scrap(getPage(i), this.handleList, this.extractList);
        }
      },
      extractList: function(text) {
        let html = $.parseHTML(text);
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
        this.items.unshift(item);
      },
      compare: function(a, b) {
        return a < b ? -1 : 1;
      },
      sortByTitle: function() {
        this.items.sort((a, b) => this.compare(a.title, b.title));
      },
      sortByAuthor: function() {
        this.items.sort((a, b) => {
          let lastName = (s => s.author.split(' ').slice(-1));
          return this.compare(lastName(a), lastName(b));
        });
      },
    },
  });
};
