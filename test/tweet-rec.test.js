import { assert } from 'chai'
import faker from 'faker'
import Schedule from './factories/schedule'
import Tweet from './factories/tweet'

import rewire from 'rewire'
const TweetRec = rewire('../src/lib/tweet-rec')

describe('TweetRec', () => {
  
  describe('fileFormat', () => {
    const fileFormat = TweetRec.__get__('fileFormat')
    
    describe('.name()', () => {
      it('should return file name', () => {
        let schedule = Schedule.build()
        let name = fileFormat.name(schedule)
        assert.match(name, /^\d{4}-\d{2}-\d{2}_\d{4}_\d{4}\.csv$/)
      })
    })
    
    describe('.header()', () => {
      it('should return header array', () => {
        let schedule = Schedule.build()
        let header = fileFormat.header(schedule)
        assert.deepEqual(header, [
          schedule.date,
          schedule.beginTime,
          schedule.endTime,
          schedule.word
        ])
      })
    })

    describe('.row()', () => {
      it('should return row array', () => {
        let tweet = Tweet.build()
        let row = fileFormat.row(tweet, tweet.entities.hashtags[0].text)
        assert.deepEqual(row, [
          tweet.timestamp_ms,
          tweet.user.screen_name,
          tweet.user.name,
          tweet.user.profile_image_url,
          tweet.text
        ])
      })

      context('when retweet', () => {
        it('should change text', () => {
          let tweet = Tweet.build({
            retweeted_status: {
              user: { screen_name: faker.internet.userName() },
              text: faker.lorem.sentence()
            }
          })
          let row = fileFormat.row(tweet, tweet.entities.hashtags[0].text)
          assert.equal(row[4], `RT @${tweet.retweeted_status.user.screen_name}: ${tweet.retweeted_status.text}`)
        })
      })

      context('when media attached', () => {
        it('should have media', () => {
          let tweet = Tweet.build()
          tweet.entities.media = [ { media_url: faker.image.imageUrl() } ]
          let row = fileFormat.row(tweet, tweet.entities.hashtags[0].text)
          assert.equal(row[5], tweet.entities.media[0].media_url)
        })
      })

      context('when multiple media attached', () => {
        it('should have multiple media', () => {
          let tweet = Tweet.build()
          tweet.entities.media = [ { media_url: faker.image.imageUrl() }, { media_url: faker.image.imageUrl() } ]
          let row = fileFormat.row(tweet, tweet.entities.hashtags[0].text)
          assert.equal(row[5], `${tweet.entities.media[0].media_url},${tweet.entities.media[1].media_url}`)
        })
      })

      context('when hashtag is not included', () => {
        it('should return null', () => {
          let tweet = Tweet.build({
            entities: {}
          })
          let row = fileFormat.row(tweet, faker.commerce.product())
          assert.isNull(row)
        })
      })
    })
  })
  
  describe('.parseHeader()', () => {
    it('should return header hash', () => {
      let schedule = Schedule.build()
      let arg = [schedule.date, schedule.beginTime, schedule.endTime, schedule.word]
      let header = TweetRec.parseHeader(arg)
      assert.deepEqual(header, {
        date: arg[0],
        beginTime: arg[1],
        endTime: arg[2],
        word: arg[3]
      })
    })
  })

  describe('.parseRow()', () => {
    let tweet = Tweet.build()
    let arg = [tweet.timestamp_ms, tweet.user.screen_name, tweet.user.name, tweet.user.profile_image_url, tweet.text]
    
    it('should return row hash', () => {
      let row = TweetRec.parseRow(arg)
      assert.deepEqual(row, {
        timestamp_ms: Number(arg[0]),
        user: {
          screen_name: arg[1],
          name: arg[2],
          profile_image_url: arg[3]
        },
        text: arg[4],
        media: []
      })
    })

    context('when media attached', () => {
      it('should have media', () => {
        let media = faker.image.imageUrl()
        let row = TweetRec.parseRow(arg.concat(media))
        assert.deepEqual(row.media, [media])
      })
    })

    context('when multiple media attached', () => {
      it('should have multiple media', () => {
        let media = [faker.image.imageUrl(), faker.image.imageUrl()]
        let row = TweetRec.parseRow(arg.concat(media.join()))
        assert.deepEqual(row.media, media)
      })
    })
  })

  describe('.rangeDate()', () => {
    it('should return date array', () => {
      let schedule = Schedule.build({
        date: '1970-01-01',
        beginTime: '00:00',
        endTime: '23:59'
      })
      let range = TweetRec.rangeDate(schedule)
      assert.deepEqual(range, [new Date('1970-01-01 00:00'), new Date('1970-01-01 23:59')])
    })

    context('when over days', () => {
      it('should return date array', () => {
        let schedule = Schedule.build({
          date: '1970-01-01',
          beginTime: '23:59',
          endTime: '00:00'
        })
        let range = TweetRec.rangeDate(schedule)
        assert.deepEqual(range, [new Date('1970-01-01 23:59'), new Date('1970-01-02 00:00')])
      })
    })
  })
  
})
