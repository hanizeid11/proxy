import hre from "hardhat";

async function main() {
    const { ethers } = await hre.network.connect();
    const [deployer] = await ethers.getSigners();

    const network = await ethers.provider.getNetwork();
    if (network.chainId !== 11155111n) {
        throw new Error(`Wrong network: expected Sepolia (11155111), got ${network.chainId.toString()}`);
    }

    console.log("Network:", network.name, `(${network.chainId.toString()})`);
    console.log("Deployer:", deployer.address);

    const MyTokenV1 = await ethers.getContractFactory("MyTokenV1");
    const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");
    const UUPSProxy = await ethers.getContractFactory("UUPSProxy");

    console.log("\n1) Deploy MyTokenV1 implementation...");
    const implementationV1 = await MyTokenV1.deploy();
    await implementationV1.waitForDeployment();
    const implementationV1Address = await implementationV1.getAddress();
    console.log("MyTokenV1 implementation:", implementationV1Address);

    const initData = implementationV1.interface.encodeFunctionData("initialize", [
        "MyToken",
        "HWK",
        deployer.address,
    ]);

    console.log("\n2) Deploy UUPSProxy pointing to V1 + initialize...");
    const proxy = await UUPSProxy.deploy(implementationV1Address, initData);
    await proxy.waitForDeployment();
    const proxyAddress = await proxy.getAddress();
    console.log("UUPS Proxy:", proxyAddress);

    const tokenV1OnProxy = MyTokenV1.attach(proxyAddress);
    const labelBefore = await tokenV1OnProxy.myTokenLabel();
    const versionBefore = await tokenV1OnProxy.version();

    console.log("\n3) Read value before upgrade");
    console.log("version:", versionBefore);
    console.log("myTokenLabel:", labelBefore);

    console.log("\n4) Deploy MyTokenV2 implementation...");
    const implementationV2 = await MyTokenV2.deploy();
    await implementationV2.waitForDeployment();
    const implementationV2Address = await implementationV2.getAddress();
    console.log("MyTokenV2 implementation:", implementationV2Address);

    const initV2Data = MyTokenV2.interface.encodeFunctionData("initializeV2", ["v2"]);

    console.log("\n5) Upgrade proxy to V2 and run initializeV2('v2')...");
    const upgradeTx = await tokenV1OnProxy.connect(deployer).upgradeToAndCall(implementationV2Address, initV2Data);
    const receipt = await upgradeTx.wait();
    console.log("Upgrade tx hash:", receipt?.hash ?? upgradeTx.hash);

    const tokenV2OnProxy = MyTokenV2.attach(proxyAddress);
    const labelAfter = await tokenV2OnProxy.myTokenLabel();
    const versionAfter = await tokenV2OnProxy.version();

    console.log("\n6) Read value after upgrade");
    console.log("version:", versionAfter);
    console.log("myTokenLabel:", labelAfter);

    if (labelBefore === labelAfter) {
        throw new Error(`Upgrade check failed: label did not change (${labelBefore})`);
    }

    console.log("\nCompleted.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
