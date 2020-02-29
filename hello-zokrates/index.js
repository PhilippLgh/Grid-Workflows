const { default: Grid, FlagBuilder, WorkflowUtils } = require('grid-core')
const { promises: fs } = require('fs') // virutal fs
const { createLogger, prompt } = WorkflowUtils

const logger = createLogger()
const grid = new Grid({
  logger
})

const printCommmand = async (commandName, commandPromise) => {
  const output = await commandPromise
  logger.logAs('ZoKrates',`${commandName} output:\n`, output)
}

// see https://zokrates.github.io/gettingstarted.html#hello-zokrates
const run = async (config) => {
  logger.log('>> hello zokrates', config)

  // get image from docker hub and create container
  const zokrates = await grid.getClient('docker:dockerhub/zokrates/zokrates')
  // start the docker container
  // WARNING special docker syntax: likely to change
  const ipc = await zokrates.start([] /*{ entryPoint: './zokrates', fs } */)

  // only use absolute paths! and no sync operations on mirrored fs
  // TODO await fs.writeFile()
  // this API will probably be replaced by fs
  await zokrates.putFile('root.zok', 
`
def main(private field a, field b) -> (field):
  field result = if a * a == b then 1 else 0 fi
  return result
`)

  await printCommmand('compile', zokrates.execute('./zokrates compile -i root.zok') )
  await printCommmand('setup phase', zokrates.execute('./zokrates setup') )
  await printCommmand('execute program', zokrates.execute('./zokrates compute-witness -a 337 113569') )
  await printCommmand('"generate a proof of computation"', zokrates.execute('./zokrates generate-proof') )
  await printCommmand('"export a solidity verifier"', zokrates.execute('./zokrates export-verifier') )

  const files = await zokrates.execute('ls -la')
  logger.log('files:', files)

  const contract = await zokrates.getFile('verifier.sol')
  logger.log('contract', contract.toString())

  // TODO deploy to local geth... do something with results here

  // TODO await zokrates.destroy()
  // stop docker container
  await zokrates.stop()
}

// lifecycle method:called before workflow stops
const onStop = async () => {
  // used to clean up
  // await grid.stopClients()
}

module.exports = {
  run,
  onStop
}
