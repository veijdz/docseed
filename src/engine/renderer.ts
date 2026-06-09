import Handlebars from 'handlebars'

Handlebars.registerHelper('eq', (a, b) => a === b)

export function render(template: string, vars: object): string {
  // Derived from UTC on purpose: keeps output deterministic across timezones.
  const date = new Date().toISOString().slice(0, 10)
  const compiled = Handlebars.compile(template, { noEscape: true })
  return compiled({ ...vars, date })
}
