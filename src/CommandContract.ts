export interface CommandContract {
  isRunning: boolean
  wasLastRunFine: boolean
  runCount: number
  wasRunCount: number

  run (...args: any): any
}
