const { default: Grid, FlagBuilder, WorkflowUtils } = require('grid-core')

const { createLogger, prompt } = WorkflowUtils

const logger = createLogger()
const grid = new Grid({
  logger
})

const run = async (config) => {
  logger.log('>> hello workflow')
  const client = await grid.getClient('geth')
  const flags = ['--dev', '--rpc', '--rpcaddr', '127.0.0.1']
  const ipc = await grid.startClient(client, flags)
  const clientVersion = await client.rpc('web3_clientVersion')
  logger.log('>> Received client version via RPC:', clientVersion)

  /**
   * This will find the latest version of the RPC Tester App on
   * https://github.com/ryanio/grid-rpc-app > Releases using an ethpkg query
   * and will serve the app locally
   */
  const rpcAppQuery = 'github:ryanio/grid-rpc-app' // ethpkg query
  logger.log(`>> Starting RPC tester app from: ${rpcAppQuery}`)
  const rpcApp = await grid.startWebApp(rpcAppQuery)
}

// lifecycle method: use to clean up
const onStop = async () => {
  await grid.stopClients()
}

module.exports = {
  run,
  onStop
}
