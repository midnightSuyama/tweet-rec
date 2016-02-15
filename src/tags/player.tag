<player>
  <div id="window" class="window">
    <div if={ global.state.recording != null } class="recording">REC / { global.state.recording.beginTime } - { global.state.recording.endTime } / #{ global.state.recording.word }</div>
    
    <header class="toolbar toolbar-header">
      <div class="control-items">
        <div class="rec">
          <button class="btn btn-default" onclick={ showSchedule }><span class="icon icon-clock"></span></button>
        </div>
        <div>
          <button class="btn btn-default" onclick={ openFile }><span class="icon icon-folder"></span></button>
        </div>
        <div>
          <button class="btn btn-default" onclick={ togglePlayStop } disabled={ endTime == 0 }><span class="icon icon-play { icon-pause: isPlaying }"></span></button>
        </div>
        <div class="seek">
          <input type="range" name="seek" value={ currentTime } min={ beginTime } max={ endTime } step="1000" onchange={ seekOnChange } onmousedown={ seekOnMouseDown } onmouseup={ seekOnMouseUp } disabled={ endTime == 0 }>
        </div>
        <div>
          <span>{ progressTimeFormat() }</span>
        </div>
      </div>
    </header>
    
    <div class="window-content">
      <player-timeline tweets={ tweets } time={ currentTime }></player-timeline>
    </div>

    <player-status word={ word } time={ currentTime }></player-status>
  </div>
  
  <style scoped>
    .recording {
      padding: 3px;
      background: #fb2f29;
      color: #fff;
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .toolbar-header {
      min-height: 36px;
    }
    
    .control-items {
      display: flex;
      align-items: center;
      padding: 6px;
    }
    .control-items > :not(:first-child) {
      margin-left: 6px;
    }
    .control-items .rec {
      padding-right: 6px;
      border-right: 1px solid #a19fa1;
    }
    .control-items .seek {
      flex: 1;
    }
    .control-items .seek input[type=range] {
      display: block;
      width: 100%;
    }
  </style>
  
  <script>
    const fs       = require('fs')
    const path     = require('path')
    const parse    = require('csv').parse
    const es       = require('event-stream')
    const TweenMax = require('gsap/src/minified/TweenMax.min.js')
    const TweetRec = require('./lib/tweet-rec')
    
    this.tweets    = []
    this.isPlaying = false
    this.word      = null
    this.beginTime = this.endTime = this.currentTime = 0
    
    var interval = null

    openFile() {
      let options = {
        title:       'Open CSV File',
        defaultPath: path.join(remote.app.getPath('appData'), remote.app.getName(), 'csv'),
        filters:     [{ name: 'CSV File', extensions: ['csv'] }],
        properties:  ['openFile']
      }
      
      remote.dialog.showOpenDialog(options, (filenames) => {
        if (!filenames) return
        
        this.stop()
        
        let header = null
        this.tweets = []
        fs.createReadStream(filenames[0]).on('close', () => {
          this.update()
        }).pipe(parse()).pipe(es.map((data) => {
          if (!header) {
            header = TweetRec.parseHeader(data)
            let [beginDate, endDate] = TweetRec.rangeDate(header)
            this.word        = header.word
            this.beginTime   = beginDate.getTime()
            this.endTime     = endDate.getTime()
            this.currentTime = this.beginTime
          } else {
            let tweet = TweetRec.parseRow(data)
            this.tweets.unshift(tweet)
          }
        }))
      })
    }

    play() {
      interval = setInterval(() => {
        this.currentTime += 1000
        if (this.currentTime >= this.endTime) {
          this.currentTime = this.endTime
          this.stop()
        }
        this.update()
      }, 1000)

      this.isPlaying = true
    }

    stop() {
      clearInterval(interval)
      interval = null

      this.isPlaying = false
    }

    togglePlayStop() {
      if (this.isPlaying) {
        this.stop()
      } else {
        this.play()
      }
    }

    seekOnChange(e) {
      this.currentTime = Number(e.target.value)
    }

    seekOnMouseDown(e) {
      e.target.isPlaying = this.isPlaying
      this.stop()
      return true
    }

    seekOnMouseUp(e) {
      if (e.target.isPlaying) {
        e.target.isPlaying = false
        this.play()
      }
      return true
    }

    progressTimeFormat() {
      const timeFormat = (time) => {
        time = Math.floor(time / 1000)
        let m = ('00' + Math.floor(time / 60)).slice(-3)
        let s = ('0' + (time % 60)).slice(-2)
        return `${m}:${s}`
      }
      
      let progress = timeFormat(this.currentTime - this.beginTime)
      let total    = timeFormat(this.endTime - this.beginTime)
      return `${progress} / ${total}`
    }

    this.on('mount', () => {
      this.mixin('schedule')
      this.update()
    })
  </script>
</player>
