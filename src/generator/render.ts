export type TemplateVars = Record<string, string>

export class UndefinedVariableError extends Error {
  constructor(variable: string, template: string) {
    super(`Undefined template variable "{{${variable}}}" in template: ${template.slice(0, 80)}...`)
    this.name = 'UndefinedVariableError'
  }
}

export function render(template: string, vars: TemplateVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    if (!(key in vars)) {
      throw new UndefinedVariableError(key, template)
    }
    return vars[key]
  })
}
