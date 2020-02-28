// This is a boilerplate workflow...
const { default: Grid, FlagBuilder, WorkflowUtils } = require('grid-core')
const ethers = require('ethers')
const { createLogger, prompt } = WorkflowUtils

const logger = createLogger()
const grid = new Grid({
  logger
})

const run = async (config) => {
  logger.log('>> hello workflow', config)
  const client = await grid.getClient('geth')
  const flags = await FlagBuilder.create(client).graphql()
  const ipc = await grid.startClient(client, flags)
  await grid.startWebApp('http://localhost:8547')
}

// lifecycle method:called before workflow stops
const onStop = async () => {
  await grid.stopClients()
}

module.exports = {
  run,
  onStop
}
