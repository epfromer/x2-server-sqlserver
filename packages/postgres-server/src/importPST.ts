import cp from 'child_process'
import * as dotenv from 'dotenv'
import { Request, Response } from 'express'
dotenv.config()

const log = []
let importing = false

// HTTP GET /importpst
export async function importPST(req: Request, res: Response): Promise<void> {
  try {
    if (importing) {
      res.status(200).json(log)
      return
    }
    res.status(202).json('Importing PSTs...')
    log.length = 0 // truncate log
    importing = true

    // fork long duration processing task
    const importer = cp.fork('./src/doImport.ts', [], {
      execArgv: ['-r', 'ts-node/register'],
    })
    importer.on('message', (msg) =>
      log.push(new Date().toISOString() + ' postgres: ' + msg)
    )
    importer.on('close', () => {
      importing = false
      console.log('close')
    })
    importer.on('exit', () => {
      importing = false
      console.log('exit')
    })
  } catch (err) {
    importing = false
    console.error(err.stack)
    res.status(500).send(err.msg)
  }
}

// HTTP GET /importstatus
export async function importStatus(req: Request, res: Response): Promise<void> {
  res.status(200).json(log)
}
