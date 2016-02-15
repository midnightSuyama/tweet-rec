<auth>
  <div class="container">
    <h1>Twitter Auth</h1>

    <h2>1. Get PIN code</h2>
    <button class="btn btn-large btn-default" onclick={ getPinCode }>Get PIN code</button>

    <h2>2. Input PIN code</h2>
    <form onsubmit={ getAccessToken } class="form-auth">
      <input type="text" id="pincode" class="form-control form-control-pincode" placeholder="PIN code">
      <button type="submit" class="btn btn-large btn-primary">Auth</button>
    </form>
  </div>

  <style scoped>
    :scope {
      z-index: 10;
      position: fixed;
      width: 100%;
      height: 100%;
      background: #55acee;
    }

    .container {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: 280px;
      height: 440px;
      margin: auto;
      text-align: center;
    }

    h1 {
      margin: 20px 0 20px;
      color: #fff;
    }
    
    h2 {
      margin: 40px 0 10px;
      color: #fff;
    }

    .form-auth {
      display: inline-block;
      padding: 10px;
      border: 1px solid #c2c2c2;
      border-radius: 4px;
      background: #fff;
    }
    
    .form-control-pincode {
      width: 120px;
      height: 30px;
      margin-right: 5px;
    }
  </style>
  
  <script>
    const OAuth = require('oauth').OAuth
    const oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      process.env.twitter_consumer_key,
      process.env.twitter_consumer_secret,
      '1.0',
      null,
      'HMAC-SHA1'
    )
    const actions = require('./actions')
    
    getPinCode(e) {
      e.target.disabled = true
      
      oauth.getOAuthRequestToken((error, oauth_token, oauth_token_secret, results) => {
        if (error) {
          alert(error)
        } else {
          this.oauth_token        = oauth_token
          this.oauth_token_secret = oauth_token_secret
          electron.shell.openExternal('https://twitter.com/oauth/authenticate?oauth_token=' + oauth_token)
        }
        
        e.target.disabled = false
      });
    }
    
    getAccessToken(e) {
      if (!this.pincode.value) return

      let children = e.target.children;
      for (let i=0; i<children.length; i++) {
        children[i].disabled = true
      }
      
      oauth.getOAuthAccessToken(this.oauth_token, this.oauth_token_secret, this.pincode.value, (error, oauth_access_token, oauth_access_token_secret) => {
        if (error) {
          alert(error)
        } else {
          let json = {
            twitter_access_token_key: oauth_access_token,
            twitter_access_token_secret: oauth_access_token_secret
          }
          localStorage.setItem('TwitterAccessToken', JSON.stringify(json))
          ipcRenderer.send('dispatch-action', actions.setAccessToken(json))
        }

        for (let i=0; i<children.length; i++) {
          children[i].disabled = false
        }
      })
    }

    this.on('mount', () => {
      let str = localStorage.getItem('TwitterAccessToken')
      if (str) {
        let json = JSON.parse(str)
        ipcRenderer.send('dispatch-action', actions.setAccessToken(json))
      }
    })
  </script>
</auth>
