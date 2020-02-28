const { default: Grid, FlagBuilder, WorkflowUtils } = require('grid-core')
const ethers = require('ethers')
const { createLogger, prompt } = WorkflowUtils 

const logger = createLogger()
const grid = new Grid({
  logger
})

const runConfig = {
  client: {
    description: 'name of the client',
    default: 'geth',
    required: false
  },
  version: {
    description: 'client version',
    default: 'latest'
  }
}

const run = async (config) => {
  logger.log('>> hello repl')
  logger.log('run with config', config)
  const client = await grid.getClient(config.client, {
    version: config.version
  })
  const flags = FlagBuilder.create(client)
    .dev(true)
    .rpcAddress('127.0.0.1')
  const ipc = await grid.startClient(client, flags)
  const clientVersion = await client.rpc('web3_clientVersion')
  logger.log('>> Received client version via RPC:', clientVersion)

  const ethereum = new ethers.providers.JsonRpcProvider(flags.getRpcAddressFull())
  logger.log('using ethers: ', ethers.version)
  logger.log('Type something in this interactive ethers REPL')
  logger.log('Try: ethereum.getNetwork()')

  while(true) {
    const answer = await prompt('> ')
    if (answer === 'exit') {
      break;
    }
    try {
      let result = eval(answer)
      if (result.then) {
        result = await result
        logger.log('result: <Promise> => ', result)
      } else {
        logger.log('result:', result)
      }
    } catch (error) {
      logger.log('error:', error)
    }
  }
  logger.log('>> exited repl loop')
  await client.stop()
}

// lifecycle method: use to clean up
const onStop = async () => {
  // await client.stop()
}

module.exports = {
  run: {
    config: runConfig,
    fn: run
  },
  onStop
}
