const { default: Grid, FlagBuilder, WorkflowUtils } = require('grid-core')
const { createLogger, prompt } = WorkflowUtils 

const logger = createLogger()
const grid = new Grid({
  logger
})

const run = async () => {
  logger.log('>> hello block-explorer')
  const client = await grid.getClient('geth')
  const ipc = await grid.startClient(client, FlagBuilder.create(client).graphql())
  const clientVersion = await client.rpc('web3_clientVersion')
  logger.log('>> Received client version via RPC:', clientVersion)
  const app = await grid.startWebApp('github:marcgarreau/grid-blocks-app')
}

// called before workflow stops
const onStop = async () => {
  await grid.stopClients()
}

module.exports = {
  run,
  onStop
}
