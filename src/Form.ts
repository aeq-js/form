import type { CommandContract } from './CommandContract'
import { HoldExecutor } from '@aeq/executors'
import { FormError } from './Validation/FormError'
import { ValidationErrorCollection } from './Validation/ValidationErrorCollection'
import clone from 'clone'

type MapErrorHandler = (e: any) => FormError
type Handler = (...args: any[]) => Promise<any>
type Config = { mapError: (e: Error) => FormError }

export class Form<T = any> {
  private command: CommandContract
  public data: T
  private snapshot: any = null
  public error: FormError = new FormError()
  private _resetOnSuccess: boolean = false
  private _dontFetch: boolean = false
  onError: (error: FormError) => void = () => {}

  constructor (handler: Handler, data: T, config?: Config) {
    this.command = new HoldExecutor(handler)
    this.data = data
    if (config && config.mapError) this.mapError = config.mapError
    this.saveSnapshot()
  }

  static createEmpty<T = any> (handler: Handler, data?: T, config?: Config) {
    const form = new Form(
      handler,
      data,
      config
    )
    return form
  }

  get hasChanges () {
    return this.checkHasChanges()
  }

  get hasError (): boolean {
    return this.error.hasErrors
  }

  get isRunning (): boolean {
    return this.command.isRunning
  }

  get wasLastRunFine (): boolean {
    return this.command.wasLastRunFine
  }

  get wasLastRunBad (): boolean {
    return !this.command.wasLastRunFine
  }

  get runCount (): number {
    return this.command.runCount
  }

  get wasRunCount (): number {
    return this.command.wasRunCount
  }

  checkHasChanges () {
    return JSON.stringify(this.snapshot) !== this.toSnapshotString()
  }

  mapError (e: any): FormError {
    if (!(e.previous && e.previous.response)) throw e

    const response = e.previous.response
    const error = response.data
    const status = response.status
    return new FormError({
      message: error.message,
      code: status,
      data: ValidationErrorCollection.createFromLaravelError(error.errors || {})
    })
  }

  addError (key: string, value: string | string[]): void {
    this.error.addError(key, value)
  }

  clearErrors (key?: string): void {
    this.error.clear(key)
  }

  getError (key: string, regexp = false): string {
    return this.getErrors(key, regexp)[0] || ''
  }

  getErrors (key: string, regexp = false): string[] {
    const error = this.error.getError(key, regexp)
    if (typeof error === 'string') return [error]
    if (!error) return []
    return error
  }

  checkIsFirstError (key: string): boolean {
    return this.error.checkIsFirst(key)
  }

  reset (): void {
    this.restoreFromSnapshot()
    this.clearErrors()
  }

  saveSnapshot (): void {
    this.snapshot = clone(this.data)
  }

  clearSnapshot () {
    this.snapshot = null
    return this
  }

  setOnError (cb: (error: FormError) => void): this {
    this.onError = cb
    return this
  }

  resetOnSuccess () {
    if (!this.snapshot) this.saveSnapshot()
    this._resetOnSuccess = true
    return this
  }

  noFetch () {
    this._dontFetch = true
    return this
  }

  async run (...args: any): Promise<any> {
    try {
      this.clearErrors()
      const result = await this.command.run(this.data, ...args)
      if (!this._dontFetch) {
        this.data = result
      }
      if (this._resetOnSuccess) {
        this.restoreFromSnapshot()
      }
      this.saveSnapshot()
      return result
    } catch (e) {
      this.error = this.mapError(e)
      this.onError(this.error) // Handle 504 status, when something with api
      throw e
    }
  }

  private toSnapshotString (): string {
    return JSON.stringify(this.data)
  }

  private restoreFromSnapshot () {
    if (this.snapshot) this.data = clone(this.snapshot)
  }
}
