import { PropertyError } from './PropertyError'

type Dto = { [key: string]: any }

export class ValidationErrorCollection {
  errors: PropertyError[] = []

  constructor (data = {}) {
    Object.assign(this, data)
  }

  getFor (field: string): string | string[] {
    const validationError = this.errors.find(
      error => error.key === field || error.key === `${field}_id` || error.key.match(field))
    return validationError ? validationError.value : []
  }

  clearFor (field = '') {
    const validationError = this.errors.find(
      error => error.key === field || error.key === `${field}_id`)
    if (validationError) {
      validationError.value = []
    }
  }

  clear () {
    this.errors = []
  }

  static createFromLaravelError (data: Dto) {
    let errors = Object.keys(data).map(key => {
      const value = data[key]
      return new PropertyError({ key: key, value })
    })
    return new ValidationErrorCollection({ errors })
  }

  addError (key: string, value: string[]) {
    this.errors.push(new PropertyError({ key, value }))
  }

  clearCollection () {
    this.errors = []
  }

  get hasError () {
    return !!this.errors.length
  }

  checkIsFirst (key: string): boolean {
    return this.findIndex(key) === 0
  }

  findIndex (key: string): number {
    return this.errors.findIndex((error) => {
      return error.key === key
    })
  }
}
