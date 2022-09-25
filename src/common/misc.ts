import sql from 'mssql'
import { dbName } from './constants'

export async function sleep(ms = 0): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export const getSQLConnection = async (bSpecifyName = true) => {
  const config: any = {
    server: process.env.SQL_HOST!,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    options: {
      trustServerCertificate: true,
    },
  }
  if (bSpecifyName) {
    config.database = dbName
  }
  // console.log(config)
  try {
    return await sql.connect(config)
  } catch (error) {
    console.log(error)
  }
}
