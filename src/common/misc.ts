import sql from 'mssql'
import { dbName } from './constants'

export async function sleep(ms = 0): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

export const getSQLConnection = async (bSpecifyName = true) => {
  const config: any = {
    server: getEnv('SQL_HOST'),
    user: getEnv('SQL_USER'),
    password: getEnv('SQL_PASSWORD'),
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

export function getEnv(item: string): string {
  const val = process.env[item]
  if (!val) {
    console.error(`${item} undefined`)
    throw `${item} undefined`
  }

  return val
}
