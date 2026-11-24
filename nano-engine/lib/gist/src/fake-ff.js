const generateFF = require('fake-ff')

async function main() {
  // Lobby random
  const random = await generateFF({
    username: 'Ditzzx'
  })
  console.log('Random lobby:', random)

  // Lobby custom
  const custom = await generateFF({
    username: 'Ditzzx',
    lobby: 5
  })
  console.log('Custom lobby:', custom)
}

main()