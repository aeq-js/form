import {ValidationErrorCollection} from './ValidationErrorCollection'

export class FormError {
  message: string = ''

  type: string = ''
  code: number | null = null

  data: ValidationErrorCollection = new ValidationErrorCollection({})

  constructor (data: Partial<FormError> = {}) {
    Object.assign(this, data)
  }

  toString () {
    return this.message
  }

  clear (key?: string): this {
    this.message = ''
    this.type = ''
    if (key) {
      this.data.clearFor(key)
    }
    if (!key) {
      this.data.clearCollection()
    }
    return this
  }

  addError (key: string, value: string | string[]): this {
    if (typeof value === 'string') value = [value]
    this.data.addError(key, value)
    return this
  }

  get hasErrors (): boolean {
    return this.data.hasError
  }

  getErrors (key: string, regexp = false): string | string[] {
    return this.data.getFor(key, regexp)
  }

  getError (key: string, regexp = false): string | string {
    const errors = this.getErrors(key, regexp)
    return errors ? errors[0] : ''
  }

  checkIsFirst (key: string): boolean {
    return this.data.checkIsFirst(key)
  }
}
