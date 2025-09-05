const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractsPath = path.join(__dirname, '../contracts');
const outputPath = path.join(__dirname, '../contracts/compiled');

// Ensure output directory exists
if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath, { recursive: true });
}

function findImports(relativePath) {
  // Handle OpenZeppelin imports
  if (relativePath.startsWith('@openzeppelin/')) {
    const absolutePath = path.resolve(__dirname, '../node_modules', relativePath);
    try {
      const content = fs.readFileSync(absolutePath, 'utf8');
      return { contents: content };
    } catch (error) {
      return { error: `File not found: ${relativePath}` };
    }
  }
  
  // Handle local imports
  const absolutePath = path.resolve(contractsPath, relativePath);
  try {
    const content = fs.readFileSync(absolutePath, 'utf8');
    return { contents: content };
  } catch (error) {
    return { error: `File not found: ${relativePath}` };
  }
}

function compileContract(contractName) {
  const contractPath = path.join(contractsPath, `${contractName}.sol`);
  
  if (!fs.existsSync(contractPath)) {
    throw new Error(`Contract file not found: ${contractPath}`);
  }
  
  console.log(`Compiling ${contractName}...`);
  
  const source = fs.readFileSync(contractPath, 'utf8');
  
  const input = {
    language: 'Solidity',
    sources: {
      [`${contractName}.sol`]: {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode.object', 'evm.bytecode.sourceMap', 'evm.gasEstimates']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };
  
  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  
  if (output.errors) {
    const hasErrors = output.errors.some(error => error.severity === 'error');
    
    output.errors.forEach(error => {
      if (error.severity === 'error') {
        console.error(`❌ Error in ${contractName}:`, error.formattedMessage);
      } else {
        console.warn(`⚠️ Warning in ${contractName}:`, error.formattedMessage);
      }
    });
    
    if (hasErrors) {
      throw new Error(`Compilation failed for ${contractName}`);
    }
  }
  
  const contract = output.contracts[`${contractName}.sol`][contractName];
  
  if (!contract) {
    throw new Error(`Contract ${contractName} not found in compilation output`);
  }
  
  const compiledContract = {
    contractName,
    abi: contract.abi,
    bytecode: '0x' + contract.evm.bytecode.object,
    sourceMap: contract.evm.bytecode.sourceMap,
    gasEstimates: contract.evm.gasEstimates,
    compiledAt: new Date().toISOString(),
    compiler: {
      version: solc.version(),
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };
  
  // Save compiled contract
  const outputFile = path.join(outputPath, `${contractName}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(compiledContract, null, 2));
  
  console.log(`✅ ${contractName} compiled successfully`);
  console.log(`   ABI: ${contract.abi.length} methods`);
  console.log(`   Bytecode: ${contract.evm.bytecode.object.length / 2} bytes`);
  console.log(`   Output: ${outputFile}`);
  
  return compiledContract;
}

async function compileAllContracts() {
  console.log('🔨 Starting contract compilation...\n');
  
  const contracts = ['CarbonCredit', 'ComplaintRegistry', 'ProjectRegistry'];
  const compiled = {};
  
  try {
    for (const contractName of contracts) {
      try {
        compiled[contractName] = compileContract(contractName);
        console.log('');
      } catch (error) {
        console.error(`❌ Failed to compile ${contractName}:`, error.message);
        process.exit(1);
      }
    }
    
    // Generate deployment script
    generateDeploymentScript(compiled);
    
    // Generate TypeScript interfaces (optional)
    generateTypeScriptInterfaces(compiled);
    
    console.log('🎉 All contracts compiled successfully!');
    console.log(`📁 Output directory: ${outputPath}`);
    
    return compiled;
    
  } catch (error) {
    console.error('❌ Compilation failed:', error.message);
    process.exit(1);
  }
}

function generateDeploymentScript(compiled) {
  const deployScript = `// Auto-generated deployment script
const { ethers } = require('ethers');
require('dotenv').config();

${Object.keys(compiled).map(name => 
  `const ${name}Artifact = require('./compiled/${name}.json');`
).join('\n')}

async function deployContracts() {
  const provider = new ethers.JsonRpcProvider(\`https://\${process.env.ETHEREUM_NETWORK}.infura.io/v3/\${process.env.INFURA_PROJECT_ID}\`);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  console.log('Deploying contracts with wallet:', wallet.address);
  console.log('Network:', process.env.ETHEREUM_NETWORK);
  
  const deployedContracts = {};
  
${Object.keys(compiled).map(name => `
  // Deploy ${name}
  console.log('\\nDeploying ${name}...');
  const ${name}Factory = new ethers.ContractFactory(
    ${name}Artifact.abi,
    ${name}Artifact.bytecode,
    wallet
  );
  
  const ${name.toLowerCase()} = await ${name}Factory.deploy();
  await ${name.toLowerCase()}.deployed();
  
  console.log('${name} deployed to:', ${name.toLowerCase()}.address);
  deployedContracts.${name.toLowerCase()} = {
    address: ${name.toLowerCase()}.address,
    transactionHash: ${name.toLowerCase()}.deployTransaction.hash
  };`).join('\n')}
  
  // Save deployment addresses
  const fs = require('fs');
  const deploymentInfo = {
    network: process.env.ETHEREUM_NETWORK,
    deployedAt: new Date().toISOString(),
    contracts: deployedContracts
  };
  
  fs.writeFileSync('./deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('\\n🎉 All contracts deployed successfully!');
  console.log('📁 Deployment info saved to deployment.json');
  
  return deployedContracts;
}

if (require.main === module) {
  deployContracts().catch(console.error);
}

module.exports = { deployContracts };
`;
  
  const deployScriptPath = path.join(__dirname, '../scripts/deploy.js');
  fs.writeFileSync(deployScriptPath, deployScript);
  
  console.log(`📝 Generated deployment script: ${deployScriptPath}`);
}

function generateTypeScriptInterfaces(compiled) {
  let tsInterfaces = `// Auto-generated TypeScript interfaces for smart contracts
// Generated at: ${new Date().toISOString()}

export interface ContractMethod {
  name: string;
  type: 'function' | 'constructor' | 'receive' | 'fallback';
  stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
  inputs: Array<{
    name: string;
    type: string;
    indexed?: boolean;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
  }>;
}

export interface ContractEvent {
  name: string;
  type: 'event';
  anonymous: boolean;
  inputs: Array<{
    name: string;
    type: string;
    indexed: boolean;
  }>;
}

export interface CompiledContract {
  contractName: string;
  abi: Array<ContractMethod | ContractEvent>;
  bytecode: string;
  sourceMap: string;
  gasEstimates: any;
  compiledAt: string;
  compiler: {
    version: string;
    optimizer: {
      enabled: boolean;
      runs: number;
    };
  };
}

`;
  
  Object.entries(compiled).forEach(([name, contract]) => {
    tsInterfaces += `export const ${name}Contract: CompiledContract = ${JSON.stringify(contract, null, 2)} as const;\n\n`;
  });
  
  tsInterfaces += `export const CompiledContracts = {
${Object.keys(compiled).map(name => `  ${name}: ${name}Contract`).join(',\n')}
} as const;

export type ContractName = keyof typeof CompiledContracts;
`;
  
  const tsPath = path.join(outputPath, 'contracts.ts');
  fs.writeFileSync(tsPath, tsInterfaces);
  
  console.log(`📝 Generated TypeScript interfaces: ${tsPath}`);
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Compile all contracts
    compileAllContracts();
  } else {
    // Compile specific contract
    const contractName = args[0];
    try {
      compileContract(contractName);
    } catch (error) {
      console.error('❌ Compilation failed:', error.message);
      process.exit(1);
    }
  }
}

module.exports = {
  compileContract,
  compileAllContracts,
  findImports
};