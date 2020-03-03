
const { default: Grid, WorkflowUtils } = require('grid-core')
const { createLogger } = WorkflowUtils

const logger = createLogger()

const run = async (config) => {
  logger.log('>> hello grid')
}

module.exports = {
  run
}
