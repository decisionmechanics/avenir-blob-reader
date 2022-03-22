const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
require("dotenv").config();

async function streamToText(readable) {
  readable.setEncoding("utf8");

  let data = [];

  for await (const chunk of readable) {
    data.push(chunk);
  }

  return data.join("");
}

async function main() {
  console.log("Blob reading sample for Thomas...");

  const AZURE_STORAGE_CONNECTION_STRING =
    process.env.AZURE_STORAGE_CONNECTION_STRING;

  if (!AZURE_STORAGE_CONNECTION_STRING) {
    throw Error("Azure Storage connection string not found");
  }

  const CONTAINER_NAME = "quotes";

  const blobServiceClient = BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );

  const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

  const blobNames = [];

  for await (const blob of containerClient.listBlobsFlat()) {
    blobNames.push(blob.name);
  }

  console.log(blobNames);

  for (const blobName of blobNames) {
    const blobClient = containerClient.getBlockBlobClient(blobName);
    const downloadBlobResponse = await blobClient.download(0);
    const blobContent = await streamToText(
      downloadBlobResponse.readableStreamBody
    );

    console.log("==========");
    console.log(blobContent);
    console.log("----------");
  }
}

main()
  .then(() => console.log("Done"))
  .catch((ex) => console.log(ex.message));
