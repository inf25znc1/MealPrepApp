/** Ukrainian UI copy. */
export const ui = {
  appTitle: 'Готування на тиждень',
  appDescription: 'Плануйте тиждень страв у двох сесіях приготування',

  thisWeek: 'Цей тиждень',
  peopleOne: '1 особа',
  peopleMany: (n: number) => `${n} осіб`,
  openHousehold: 'Відкрити налаштування домогосподарства',
  close: 'Закрити',

  tabPlan: 'План',
  tabShopping: 'Покупки',

  generateWeek: 'Згенерувати тиждень',
  planEmpty: 'Натисніть «Згенерувати тиждень» нижче, щоб спланувати страви.',
  shoppingEmpty: 'Згенеруйте тиждень, щоб побачити список покупок.',
  shoppingIntro: (n: number) =>
    n === 1
      ? 'На 1 особу · 7 днів · об’єднано за інгредієнтом'
      : `На ${n} осіб · 7 днів · об’єднано за інгредієнтом`,
  markBought: (name: string) => `Позначити «${name}» як куплене`,

  unlockMeal: 'Розблокувати страву',
  lockMeal: 'Заблокувати страву',
  rerollMeal: 'Перегенерувати страву',

  nutritionPerMeal: 'Харчування на порцію (з сирих інгредієнтів)',
  ingredient: 'Інгредієнт',
  perDay: '/ день',
  total: 'Усього',
  fullPeriod: (days: number, daysWord: string) =>
    `Увесь період (${days} ${daysWord})`,
  day: 'день',
  days: 'дні',
  steps: 'Кроки',

  kcal: ' ккал',
  kcalPerDay: ' ккал/день',
  macroProtein: ' Б',
  macroCarbs: ' В',
  macroFat: ' Ж',

  household: 'Домогосподарство',
  kcalPerDayLabel: 'ккал/день',
  diet: 'Раціон',
  avoids: 'Уникає',
  addPerson: 'Додати особу',
  removePerson: (name: string) => `Видалити ${name}`,
  newPersonName: (n: number) => `Особа ${n}`,

  defaultYou: 'Ви',
  defaultPartner: 'Партнер',
} as const;
