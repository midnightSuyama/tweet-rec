import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import { stringify } from 'csv'
import { CronJob } from 'cron'
import Twitter from 'twitter'

const fileFormat = {
  name: schedule => (
    `${schedule.date}_${schedule.beginTime.replace(':', '')}_${schedule.endTime.replace(':', '')}.csv`
  ),
  header: schedule => [
    schedule.date,
    schedule.beginTime,
    schedule.endTime,
    schedule.word
  ],
  row: (data, word) => {
    let isHashtag = false
    if (data.entities.hashtags) {
      let hashtags = word.split(',')
      data.entities.hashtags.forEach((item) => {
        if (hashtags.indexOf(item.text) >= 0) isHashtag = true
      })
    }
    if (!isHashtag) return null
    
    let row = [
      data.timestamp_ms,
      data.user.screen_name,
      data.user.name,
      data.user.profile_image_url,
      data.text
    ]
    
    if (data.retweeted_status) {
      row[4] = `RT @${data.retweeted_status.user.screen_name}: ${data.retweeted_status.text}`
    }
    
    if (data.entities.media) {
      let urls =[]
      data.entities.media.forEach((item) => {
        urls.push(item.media_url)
      })
      row.push(urls.join())
    }
    
    return row
  }
}

export default class TweetRec {
  constructor() {
    this.client        = null
    this.twitterStream = null
    this.stringifier   = null
    this.jobs          = {}
    this.jobStop       = null
    this.distDir       = './'
  }

  setupTwitter(consumer_key, consumer_secret, access_token_key, access_token_secret) {
    this.client = new Twitter({consumer_key, consumer_secret, access_token_key, access_token_secret})
  }
  
  createJob(schedule, onStart=null, onStop=null, onError=null) {
    let [beginDate, endDate] = TweetRec.rangeDate(schedule)
    
    let job = new CronJob(beginDate, () => {
      this.start(schedule, onError)
      if (typeof onStart === 'function') onStart()
      
      if (this.jobStop) this.jobStop.stop()
      this.jobStop = new CronJob(endDate, () => {
        this.stop()
        if (typeof onStop === 'function') onStop()
        this.jobStop = null
      }, null, true)
    }, null, true)
    
    this.jobs[schedule.id] = job
  }
  
  destroyJob(id) {
    if (this.jobs[id]) {
      this.jobs[id].stop()
      delete this.jobs[id]
    }
  }
  
  start(schedule, onError=null) {
    this.stop()

    mkdirp.sync(this.distDir)
    let ws = fs.createWriteStream(path.join(this.distDir, fileFormat.name(schedule)))
    this.stringifier = stringify()
    this.stringifier.pipe(ws)

    let header = fileFormat.header(schedule)
    this.stringifier.write(header)
    
    this.client.stream('statuses/filter', { track: schedule.word }, (stream) => {
      this.twitterStream = stream

      stream.on('data', (chunk) => {
        let row = fileFormat.row(chunk, schedule.word)
        if (row) this.stringifier.write(row)
      })

      stream.on('error', (error) => {
        this.stop()
        if (typeof onError === 'function') onError()
      })
    })
  }

  stop() {
    if (this.twitterStream) {
      this.twitterStream.destroy()
      this.twitterStream = null
    }

    if (this.stringifier) {
      this.stringifier.end()
      this.stringifier = null
    }
  }

  static parseHeader(header) {
    return {
      date: header[0],
      beginTime: header[1],
      endTime: header[2],
      word: header[3]
    }
  }
  
  static parseRow(row) {
    return {
      timestamp_ms: Number(row[0]),
      user: {
        screen_name: row[1],
        name: row[2],
        profile_image_url: row[3]
      },
      text: row[4],
      media: (row[5] ? row[5].split(',') : [])
    }
  }

  static rangeDate(schedule) {
    let beginDate = new Date(`${schedule.date} ${schedule.beginTime}`)
    let endDate   = new Date(`${schedule.date} ${schedule.endTime}`)
    if (beginDate.getTime() > endDate.getTime()) {
      endDate.setDate(endDate.getDate() + 1)
    }
    return [beginDate, endDate]
  }
}
