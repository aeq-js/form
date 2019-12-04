export default interface FormErrorContract {
  code: number | null
  message: string

  clear (key?: string): this

  addError (key: string, value: string[]): this

  getErrors (key: string): string | string[]

  getError (key: string): string | string

  hasErrors: boolean
}
