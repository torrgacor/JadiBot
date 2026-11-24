import { createWebFolder, startUpload } from "@file-kiwi/node"

const INPUT = "/home/container/assets/img_1_1780925030569.jpg"
const TITLE = "Ditzzx Upload"

async function main() {
  const webfolder = await createWebFolder({
    title: TITLE,
    files: [
      {
        filepath: INPUT
      }
    ]
  })

  await startUpload(webfolder)

  console.log(JSON.stringify({
    Status: true,
    Code: 200,
    Input: INPUT,
    Direct_link: webfolder.webfolderUrl
  }, null, 2))
}

main().catch(err => {
  console.log(JSON.stringify({
    Status: false,
    Code: err.status || err.code || 500,
    Input: INPUT,
    Direct_link: null,
    Error: err.response?.data || err.message || String(err)
  }, null, 2))
})