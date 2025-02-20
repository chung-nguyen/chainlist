import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'yaml';

import { env } from '@/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function readGeneralData() {
  const dataText = await fs.readFile(path.join(__dirname, '../data/general.yaml'), 'utf-8');
  const data = yaml.parse(dataText);
  return data;
}

async function readChainListData() {
  const dataText = await fs.readFile(path.join(__dirname, '../data/chainlist.yaml'), 'utf-8');
  const data = yaml.parse(dataText);
  return data;
}

async function readABIData() {
  const dataText = await fs.readFile(path.join(__dirname, '../data/abi.yaml'), 'utf-8');
  const data = yaml.parse(dataText);
  return data;
}

async function main() {
  const { JSON_BLOB_ID, JSON_BLOB_BASE_URL } = env;

  const [generalData, chainListData, abiData] = await Promise.all([
    readGeneralData(),
    readChainListData(),
    readABIData(),
  ]);

  const data = {
    general: generalData,
    abi: abiData,
    chainList: chainListData,
  };

  if (JSON_BLOB_ID) {
    await axios.put(`${JSON_BLOB_BASE_URL}/${JSON_BLOB_ID}`, data);
  }

  const result = await axios.get(`${JSON_BLOB_BASE_URL}/${JSON_BLOB_ID}`);
  console.info(result.data);

  // await fs.writeFile(path.join(__dirname, '../data/chainlist.json'), JSON.stringify(data), 'utf-8');
}

main();
