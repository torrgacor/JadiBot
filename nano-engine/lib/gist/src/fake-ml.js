const generateCard = require('fake-ml')

async function main() {
  try {
    const result = await generateCard({
      avatar: 'https://raw.githubusercontent.com/Ditzzx-vibecoder/Assets/main/Image/artworks-gWLRE6HyPH3DgVMG-ZFFxtg-t500x500.jpg',
      username: 'Ditzzx',
      rank: 'imo',
      border: 11
    })
    console.log(result)
  } catch (e) {
    console.error('Failed:', e.message)
  }
}

main()
