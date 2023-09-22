// noinspection ES6ConvertModuleExportToExport
module.exports = async (deployer: Truffle.Deployer, network: string) => {
    const contract = artifacts.require("ChainOfTrustDidSsi");
    console.log(`Deploying contract ${contract.contractName} to network: ${network}.`);
    await deployer.deploy(contract);

    await contract.deployed();
    console.log(`Contract ${contract.contractName} deployed to network: ${network}.`);
};
