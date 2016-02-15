<player-status>
  <footer class="toolbar toolbar-footer">
    <div class="status-items">
      <div>{ hashtag() }</div>
      <div>{ dateFormat() }</div>
    </div>
  </footer>

  <style scoped>
    .toolbar-footer {
      min-height: 24px;
    }

    .status-items {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding: 3px 6px;
      font-size: 11px;
    }
  </style>

  <script>
    const moment = require('moment');

    hashtag() {
      return opts.word ? `#${opts.word}` : null
    }
    
    dateFormat() {
      return opts.time ? moment(opts.time).format('YYYY/MM/DD HH:mm:ss') : null
    }
  </script>
</player-status>
