import bcrypt from 'bcrypt'

async function generateHash(password) {
  const saltRounds = 11
  const hash = await bcrypt.hash(password, saltRounds)
  console.log('Hash para la contraseña:', hash)
}

const passwordPlain = 'contraseña12'  // La contraseña que quieres hashear
generateHash(passwordPlain)