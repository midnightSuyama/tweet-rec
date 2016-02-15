import { Factory } from 'rosie'
import faker from 'faker'
import moment from 'moment'

const User = new Factory()
      .attr('screen_name',       () => faker.internet.userName())
      .attr('name',              () => faker.internet.userName())
      .attr('profile_image_url', () => faker.image.avatar())

export default new Factory()
  .attr('timestamp_ms', () => moment().format('x'))
  .attr('user',         () => User.build())
  .attr('text',         () => faker.lorem.sentence())
  .attr('entities',     () => ({
    hashtags: [ { text: faker.commerce.product() } ]
  }))
