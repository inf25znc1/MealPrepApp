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
  generateWeekLoading: 'Підбираємо страви…',
  generateWeekFailed:
    'Не вдалося згенерувати план. Спробуйте ще раз.',
  generateWeekFailedNoKey:
    'Додайте GEMINI_API_KEY у файл .env.local у корені проєкту та перезапустіть npm run dev.',
  generateWeekFailedNetwork:
    'Немає з’єднання з API. Запустіть npm run dev і переконайтесь, що порт 5174 відкритий.',
  generateWeekFailedInvalid:
    'ШІ повернув неповний план. Натисніть ще раз.',
  generateWeekFailedQuota:
    'Ліміт Gemini API вичерпано. Зачекайте ~1 хв і спробуйте знову, або вкажіть іншу модель у .env.local: GEMINI_MODEL=gemini-2.0-flash-lite',
  generateWeekFailedOverload:
    'Модель Gemini перевантажена. Зачекайте 30–60 с і натисніть ще раз (додаток спробує іншу модель автоматично).',
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

  nutritionPerMeal: 'Харчування на день (частка партії)',
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

  settings: 'Налаштування',
  settingsTabPeople: 'Особи',
  settingsTabFoods: 'Продукти',
  settingsTabFavorites: 'Улюблені рецепти',
  packageProductsIntro:
    'Додайте продукти з фіксованою упаковкою — список покупок округлить кількість до повних пачок, щоб не залишалось зайвого.',
  addPackageProduct: 'Додати продукт',
  packageIngredient: 'Продукт',
  packageIngredientSearchPlaceholder: 'Пошук або нова назва…',
  createPackageProduct: (name: string) => `Створити «${name}»`,
  packageSizeLabel: 'Упаковка',
  savePackageProduct: 'Зберегти',
  cancel: 'Скасувати',
  packageProductsEmpty: 'Ще немає продуктів з упаковкою.',
  removePackageProduct: (name: string) => `Видалити «${name}»`,

  favoritesIntro:
    'Зберігайте страви з плану або додавайте власні — потім можна підставити їх у тижневий план.',
  favoritesEmpty: 'Ще немає улюблених рецептів.',
  addCustomRecipe: 'Додати власний рецепт',
  saveAsFavorite: 'Зберегти в улюблені',
  replaceWithFavorite: 'Замінити улюбленим',
  alreadyInFavorites: 'Уже в улюблених',
  savedToFavorites: 'Збережено в улюблені',
  selectFavoriteToReplace: 'Оберіть рецепт',
  noFavoritesForMeal: (meal: string) =>
    `Немає улюблених рецептів для «${meal}»`,
  removeFavoriteRecipe: (name: string) => `Видалити «${name}»`,
  customRecipeName: 'Назва страви',
  customRecipeMeal: 'Прийом їжі',
  customRecipeSteps: 'Кроки (кожен з нового рядка)',
  customRecipeStepsPlaceholder: '1. …\n2. …',
  addIngredient: 'Додати інгредієнт',
  ingredientNamePlaceholder: 'Назва інгредієнта',
  saveFavoriteRecipe: 'Зберегти рецепт',
  cancelReplace: 'Скасувати',
  shoppingPackageNote: (count: number, size: number, unit: string) =>
    `${count} × ${size} ${unit}`,

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
