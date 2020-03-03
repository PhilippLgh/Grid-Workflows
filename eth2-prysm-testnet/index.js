
const { default: Grid, FlagBuilder, WorkflowUtils } = require('grid-core')
const ethers = require('ethers')
const { createLogger, prompt } = WorkflowUtils

const logger = createLogger()
const grid = new Grid({
  logger
})

const createValidatorAccounts = async (password) => {
  // docker pull gcr.io/prysmaticlabs/prysm/validator:latest
  const validator = await grid.getClient('docker:gcr.io/prysmaticlabs/prysm/validator')
  await grid.startClient(validator)

  // get accounts from docker. NOTE we do not create shared volumes
  // docker run -it -v $HOME/prysm:/data gcr.io/prysmaticlabs/prysm/validator:latest accounts create --keystore-path=/data --password=changeme
  logger.log('>> Generate a validator public / private key')
  const result = await validator.execute(`accounts create --keystore-path=/data --password=${password}`, {
    useBash: false, // do not wrap entrypoint call in bash call
    useEntrypoint: true // execute command using entrypoint 
  })
  // logger.log('result', result)

  const rawTxStart = result.findIndex(log => log === '========================Raw Transaction Data=======================')
  const rawTx = result[rawTxStart +1]
  logger.log('>> Eth1 deposit transaction:', rawTx)
  
  const accountData = await validator.getFile('/data') // as IPackage - see ethpkg
  const entries = await accountData.getEntries()
  const pkEntry = entries.find(e => e.file.name.startsWith('validatorprivatekey'))
  const pkJson = JSON.parse((await pkEntry.file.readContent()).toString())
  logger.log(">> this is a demo and it's a testnet... usually you should not log private key data like this...")
  logger.log('>> validator private key:\n', pkJson)
  const shardWithdrawalKeyEntry = entries.find(e => e.file.name.startsWith('shardwithdrawalkey'))
  const shardKeyJson = JSON.parse((await shardWithdrawalKeyEntry.file.readContent()).toString())
  logger.log('>> validator shard withdrawal key:\n', shardKeyJson)

  return { rawTx, privateKeyFile: pkJson, shardWithdrawalKey: shardKeyJson, accountData }
}

/*
  docker run -it -v $HOME/prysm:/data --network="host" \
  gcr.io/prysmaticlabs/prysm/validator:latest \
  --beacon-rpc-provider=127.0.0.1:4000 \
  --keystore-path=/data \
  --datadir=/data \
  --password=changeme
*/
const setupValidatorNode = async () => {
}

/**
  docker pull gcr.io/prysmaticlabs/prysm/beacon-chain:latest
  docker run -it -v $HOME/prysm:/data -p 4000:4000 gcr.io/prysmaticlabs/prysm/beacon-chain:latest --datadir=/data
 */
const setupBeaconChain = async (accountData /*IPackage*/) => {
  logger.log('setup beacon chain')
  // 
  const beaconChain = await grid.getClient('docker:gcr.io/prysmaticlabs/prysm/validator')

  // setup data dir (copy accounts from validator):
  await beaconChain.putF

  await grid.startClient(beaconChain)

}

const run = async (config) => {

  logger.log('Get GöEth - Test ether')
  // TODO get goerli test eth
  /*
  This test network leverages the Goerli network to simulate validator deposits on a proof-of-work chain.
  You are 0x553a1E02DF58a0B074F7BA9CA78D143deD502D81 and you have 3.5 GöETH.
  To deposit as a validator you'll need at least 3.2 GöETH.
  */
 
  logger.log('>> Creating validator accounts...')
  const password = await prompt('Enter password to encrypt validator account', { type: 'password' })
  const { rawTx, privateKeyFile, shardWithdrawalKey, accountData } = await createValidatorAccounts(password)
  /*
  const rawTx = '0x22895118000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000120b0fc027741e479c4f848f74ed9aa2f0eeb9030beba911e6645a3904d45c4677000000000000000000000000000000000000000000000000000000000000000308f84ca682d73c67845a943722e70628b8e735a0e0cd24a7f16c89ada4e1102db57298b568a4f3f29bc1d7b0d24653b35000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020005a9c2caef3a4d4270e40d8c0f8edea0b619ec601b40da102b3ceebe5b2971e0000000000000000000000000000000000000000000000000000000000000060a4f699b93ddf4eacbdb38f0a391be6d827f526b4970667a453a8dbd02104bff703d6cd4661a5fb495a30abc17525c7ed15f5a4adc949b05e3779bb81678aa046f74fdcb56db7fb30bf4166dad9427874cc253ead0c359c712e30f6234ccfe0a8'
  ethers.utils.defaultAbiCoder.decode(
    [ 'bytes32', 'string' ],
    rawTx
  )
  */

 logger.log('>> Setting up beacon chain node')
 await setupBeaconChain(accountData)

 logger.log('>> Setting up validator node')
 await setupValidatorNode()


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
