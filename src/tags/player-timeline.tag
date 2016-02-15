<player-timeline>
  <ul class="list-group">
    <li each={ opts.tweets.filter(isShow) } class="list-group-item">
      <div class="tweet-container">
        <img class="tweet-icon" src={ user.profile_image_url } onclick={ openUser }>
        <div class="tweet-body">
          <div>
            <span class="tweet-name">{ user.name }</span><span class="tweet-screen-name">@{ user.screen_name }</span>
          </div>
          <twitter-text text={ text }></twitter-text>
          <div class="tweet-media">
            <div each={ item in media }><img src={ item }></div>
          </div>
        </div>
      </div>
    </li>
  </ul>

  <style scoped>
    :scope {
      width: 100%;
    }

    .list-group * {
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
    }
    .list-group-item {
      animation: fade-in 0.6s;
    }
    @keyframes fade-in {
      0%   { opacity: 0; transform: translateY(-100%); }
      100% { opacity: 1; transform: translateY(0); }
    }

    .tweet-container {
      display: flex;
    }
    .tweet-icon {
      width: 32px;
      height: 32px;
      margin-right: 10px;
      border: 1px solid #ddd;
      border-radius: 50%;
    }
    .tweet-body {
      flex: 1;
    }
    .tweet-name {
      color: #292f33;
      font-weight: bold;
    }
    .tweet-screen-name {
      margin-left: 3px;
      color: #8899a6;
    }
    .tweet-media {
      display: flex;
      flex-wrap: wrap;
      margin: 0 0 0 -10px;
    }
    .tweet-media > div {
      margin: 10px 0 0 10px;
      line-height: 0;
    }
    .tweet-media img {
      width: 260px;
      max-width: 320px;
      height: auto;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
  </style>
  
  <script>
    isShow(item) {
      return (item.timestamp_ms < opts.time && item.timestamp_ms > opts.time-300000) ? true : false
    }

    openUser(e) {
      electron.shell.openExternal('https://twitter.com/' + e.item.user.screen_name)
    }
  </script>
</player-timeline>
