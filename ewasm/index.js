const { default: Grid, FlagBuilder, WorkflowUtils } = require('grid-core')
const ethers = require('ethers')
const { createLogger, prompt } = WorkflowUtils

const logger = createLogger()
const grid = new Grid({
  logger
})

const run = async (config) => {
  logger.log('>> hello ewasm')
  logger.log('>> run with config', config)
  /**
   * This call involves some **magic™**:
   * The workflow defines a Dockerfile in the directory.
   * When the plugin is initialized the resources are wrapped in a package and provided as context for the ClientManager
   * When the ClientManager is asked to create a new Client it can create a docker image based on the Dockerfile
   * The repository information is used to specify if we want to run a local image (Dockerfile) vs remote
   * The last part of the specifier is the image (& client) name: please note that Grid will prefix these names for better image mgtm
   * If the image is found it will not be re-created unless forced - TODO
   * The ClientManager will search for an existing container or start a new one. The container state will not be changed
   * So if there is a running container it Grid will just attach to it
   */
  let options = undefined
  const client = await grid.getClient('docker:local/ewasm')

  const flags = FlagBuilder.create(client)
    .docker() // IMPORTANT: docker has mappings of ports and addresses
    .rpc() // start rpc server and if docker expose port
    .testnet() 
  const ipc = await grid.startClient(client, flags, {
    entryPoint: '/usr/local/bin/geth', 
    service: true
  })
  const provider = new ethers.providers.JsonRpcProvider(flags.getRpcAddressFull())

  // https://github.com/ethereum/wiki/wiki/JSON-RPC#web3_clientversion
  logger.log('>> client:', await provider.send('web3_clientVersion'))
  logger.log('>> network:', await provider.getNetwork())

  await grid.stopClient(client)
}

// lifecycle method: use to clean up
const onStop = async () => {
  // await grid.stopClients()
}

module.exports = {
  run,
  onStop
}
