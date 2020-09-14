import { dbName } from '@klonzo/common'
import * as dotenv from 'dotenv'
// import { v4 as uuidv4 } from 'uuid'
import { Request, Response } from 'express'
dotenv.config()

const log = []
let importing = false
let i

async function sleep(ms = 0) {
  return new Promise((r) => setTimeout(r, ms))
}

// HTTP GET /importpst
export async function importPST(req: Request, res: Response): Promise<void> {
  try {
    if (importing) {
      res.status(200).json(log)
      return
    }
    res.status(202).json('Importing PSTs...')
    i = 1
    log.length = 0
    importing = true
    while (i < 30) {
      await sleep(1000)
      log.push(new Date().toISOString() + ': ' + i)
      i++
    }
    importing = false
  } catch (err) {
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}

// HTTP GET /importstatus
export async function importStatus(req: Request, res: Response): Promise<void> {
  res.status(200).json(log)
}
