<twitter-text>
  <style scoped>
    :scope {
      display: block;
      line-height: normal;
      color: #292f33;
    }
    
    a {
      color: #2b7bb9;
      text-decoration: none;
    }
  </style>
  
  <script>
    const twitterText = require('twitter-text')
    this.root.innerHTML = twitterText.autoLink(twitterText.htmlEscape(opts.text))
    
    let a = this.root.getElementsByTagName('a')
    for (let i=0; i<a.length; i++) {
      a[i].setAttribute('onclick', 'electron.shell.openExternal(this.href); return false;')
    }
  </script>
</twitter-text>
