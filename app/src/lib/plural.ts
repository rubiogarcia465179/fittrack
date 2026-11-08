/** Helper de plurales i18n: `plural(1, t, 'hist_exercise', 'hist_exercises')`
 *  -> "1 ejercicio" / `plural(3, ...)` -> "3 ejercicios".
 *  Necesita la función `t` de react-i18next porque los textos viven en los
 *  bundles por idioma. */
export function plural(
  n: number,
  t: (key: string) => string,
  singularKey: string,
  pluralKey: string,
) {
  return `${n} ${n === 1 ? t(singularKey) : t(pluralKey)}`;
}
