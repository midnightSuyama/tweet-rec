import { Factory } from 'rosie'
import faker from 'faker'
import moment from 'moment'

export default new Factory()
  .attr('date',      () => moment().format('YYYY-MM-DD'))
  .attr('beginTime', () => moment().add(1, 'm').format('HH:mm'))
  .attr('endTime',   () => moment().add(31, 'm').format('HH:mm'))
  .attr('word',      () => faker.commerce.product())
