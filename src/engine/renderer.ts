import Handlebars from 'handlebars'

Handlebars.registerHelper('eq', (a, b) => a === b)

export function render(template: string, vars: object): string {
  const date = new Date().toISOString().slice(0, 10)
  const year = date.slice(0, 4)
  const compiled = Handlebars.compile(template, { noEscape: true })
  return compiled({ ...vars, date, year })
}
