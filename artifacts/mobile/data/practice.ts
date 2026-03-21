export type Difficulty = "Beginner" | "Basic" | "Intermediate" | "Advanced" | "Expert";

export interface PracticeChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  description: string;
  task: string;
  hint: string;
  placeholder: string;
  solutionKeywords: string[];
  explanation: string;
  exampleSolution: string;
}

export const PRACTICE_CHALLENGES: PracticeChallenge[] = [
  {
    id: "p001",
    title: "Прыжок персонажа",
    category: "Ввод",
    difficulty: "Beginner",
    description: "Тебе нужно сделать так, чтобы персонаж прыгал при нажатии кнопки.",
    task: "Напиши последовательность нод для прыжка персонажа по событию InputAction Jump. Используй → для разделения нод.",
    hint: "Нужны ноды: InputAction Jump → Cast To Character → Jump",
    placeholder: "Пример: Event → Нода1 → Нода2 → ...",
    solutionKeywords: ["jump", "inputaction", "character"],
    explanation: "InputAction Jump → Cast To MyCharacter → Get Character Movement → Jump\n\nСобытие InputAction Jump срабатывает при нажатии кнопки прыжка. Затем получаем ссылку на персонажа и вызываем функцию Jump().",
    exampleSolution: "InputAction Jump → Cast To Character → Jump",
  },
  {
    id: "p002",
    title: "Проверка здоровья",
    category: "Переменные",
    difficulty: "Beginner",
    description: "Персонаж получает урон. Нужно проверить — если здоровье ≤ 0, вызвать смерть.",
    task: "Напиши логику проверки здоровья через ноду Branch. Что происходит при True и при False?",
    hint: "Branch нода проверяет условие. True → Die, False → ничего",
    placeholder: "Branch (Health <= 0) → True: ... / False: ...",
    solutionKeywords: ["branch", "health", "die", "0"],
    explanation: "Branch (Condition: Health <= 0)\n  True → Call Die Function\n  False → Continue Game\n\nBranch — это аналог if/else в Blueprint. При True выполняется ветка смерти, иначе игра продолжается.",
    exampleSolution: "Branch (Health <= 0) → True: Die → False: ничего",
  },
  {
    id: "p003",
    title: "Таймер с задержкой",
    category: "Поток выполнения",
    difficulty: "Beginner",
    description: "Нужно взорвать бомбу через 3 секунды после активации.",
    task: "Используй ноду Delay для создания задержки перед взрывом. Напиши последовательность нод.",
    hint: "Event → Delay (3.0) → Explode",
    placeholder: "Event Activate → ...",
    solutionKeywords: ["delay", "3", "explode"],
    explanation: "Event Activate → Delay (Duration: 3.0) → Explode\n\nНода Delay приостанавливает выполнение Blueprint на заданное время. После задержки выполнение продолжается дальше по цепочке.",
    exampleSolution: "Event Activate → Delay (3.0) → Explode",
  },
  {
    id: "p004",
    title: "Открытие двери при касании",
    category: "Коллизия",
    difficulty: "Basic",
    description: "Дверь должна открываться когда игрок заходит в триггер-зону.",
    task: "Напиши Blueprint для двери с использованием OnComponentBeginOverlap. Какие ноды нужны?",
    hint: "OnComponentBeginOverlap → Cast To PlayerCharacter → Play Animation",
    placeholder: "OnComponentBeginOverlap → ...",
    solutionKeywords: ["oncomponentbeginoverlap", "overlap", "player", "open"],
    explanation: "OnComponentBeginOverlap (Box) → Cast To BP_PlayerCharacter → Is Valid\n  → Set Is Open (True) → Play Animation 'DoorOpen'\n\nСначала проверяем что в триггер вошёл именно игрок через Cast. Затем меняем переменную и запускаем анимацию.",
    exampleSolution: "OnComponentBeginOverlap → Cast To PlayerCharacter → Set IsOpen True → Play Animation",
  },
  {
    id: "p005",
    title: "Функция получения урона",
    category: "Функции",
    difficulty: "Basic",
    description: "Создай функцию TakeDamage которая принимает параметр DamageAmount и уменьшает здоровье.",
    task: "Опиши тело функции TakeDamage: как получить параметр и обновить переменную Health.",
    hint: "Input: DamageAmount (Float) → Health = Health - DamageAmount → Set Health",
    placeholder: "Input DamageAmount → Health - DamageAmount → ...",
    solutionKeywords: ["damageamount", "health", "subtract", "-", "set"],
    explanation: "Function TakeDamage(DamageAmount: Float):\n  Get Health → Subtract DamageAmount → Set Health\n  → Branch (Health <= 0) → True: Die\n\nФункция получает параметр урона, вычитает его из здоровья и сохраняет результат в переменную.",
    exampleSolution: "Get Health → Subtract (DamageAmount) → Set Health → Branch (Health <= 0) → Die",
  },
  {
    id: "p006",
    title: "ForLoop — создание предметов",
    category: "Циклы",
    difficulty: "Intermediate",
    description: "Нужно заспавнить 5 монет в случайных позициях вокруг игрока.",
    task: "Используй ноду ForLoop для создания 5 объектов через SpawnActor. Напиши структуру цикла.",
    hint: "ForLoop (0..4) → Loop Body → Random Point → SpawnActor BP_Coin",
    placeholder: "ForLoop First: 0, Last: 4 → ...",
    solutionKeywords: ["forloop", "5", "spawn", "coin", "random"],
    explanation: "ForLoop (First Index: 0, Last Index: 4) → Loop Body\n  → Random Unit Vector → Multiply (200) → Add Player Location\n  → SpawnActor (Class: BP_Coin, Location: Result)\n\nForLoop выполняет ноды внутри 5 раз (0,1,2,3,4). Каждый раз спауним монету в случайной точке.",
    exampleSolution: "ForLoop (0, 4) → Loop Body → Random Location → SpawnActor BP_Coin",
  },
  {
    id: "p007",
    title: "Event Dispatcher для коммуникации",
    category: "Коммуникация",
    difficulty: "Intermediate",
    description: "Кнопка в одном акторе должна открыть дверь в другом акторе через Event Dispatcher.",
    task: "Опиши как создать и вызвать Event Dispatcher в кнопке, и как подписаться на него в двери.",
    hint: "Button: Создать Dispatcher → Call OnButtonPressed. Door: Bind Event OnButtonPressed → Open",
    placeholder: "Кнопка: Create Dispatcher → ... | Дверь: Bind Event → ...",
    solutionKeywords: ["dispatcher", "bind", "call", "event"],
    explanation: "В BP_Button:\n  Event Dispatcher: OnButtonPressed\n  Event ActorBeginOverlap → Call OnButtonPressed\n\nВ BP_Door (BeginPlay):\n  Get Reference to Button → Bind Event OnButtonPressed → Open Door\n\nDispatcher позволяет отправлять события без прямой ссылки на получателя.",
    exampleSolution: "Button: Create Dispatcher OnPressed → Call OnPressed | Door: Bind OnPressed → Open",
  },
  {
    id: "p008",
    title: "Interface для универсального взаимодействия",
    category: "Интерфейсы",
    difficulty: "Intermediate",
    description: "Игрок нажимает E и взаимодействует с любым объектом (ящик, NPC, кнопка) через один интерфейс.",
    task: "Опиши как использовать Blueprint Interface для вызова функции Interact на любом объекте.",
    hint: "Создать BPI_Interact → добавить Interact() → Implement в каждом акторе → Call Interface Message",
    placeholder: "Create Interface BPI → Add function → Implement → Call ...",
    solutionKeywords: ["interface", "interact", "implement", "call"],
    explanation: "1. Создать BPI_Interact с функцией Interact()\n2. Реализовать интерфейс в BP_Chest, BP_NPC, BP_Button\n3. При нажатии E: LineTrace → Hit Actor → Does Implement Interface?\n   → True: Call Interface Message Interact()\n\nИнтерфейс позволяет вызывать функции у любого актора не зная его тип.",
    exampleSolution: "LineTrace Hit → Does Implement BPI_Interact → Call Interact Interface Message",
  },
  {
    id: "p009",
    title: "Макрос повторного использования",
    category: "Макросы",
    difficulty: "Advanced",
    description: "Нужен макрос IsAlive который принимает Health и возвращает True если Health > 0.",
    task: "Опиши входы/выходы макроса IsAlive и его внутреннюю логику.",
    hint: "Input: Health (Float) → Branch (Health > 0) → True output: True / False output: False",
    placeholder: "Macro IsAlive | Input: Health → ... | Output: bool",
    solutionKeywords: ["input", "health", "branch", "output", "true", "false", ">"],
    explanation: "Macro IsAlive:\n  Inputs: Exec In, Health (Float)\n  Outputs: True (Exec), False (Exec)\n  \n  Body: Branch (Condition: Health > 0)\n    True → выход True\n    False → выход False\n\nМакросы как функции, но могут иметь несколько выходных пинов Exec.",
    exampleSolution: "Input Health → Branch (Health > 0) → True: exit True | False: exit False",
  },
  {
    id: "p010",
    title: "AI: Поиск и следование за игроком",
    category: "Искусственный интеллект",
    difficulty: "Advanced",
    description: "AI-персонаж должен искать игрока каждые 2 секунды и двигаться к нему.",
    task: "Напиши Blueprint AI-логику: таймер → получить игрока → переместить к нему через AIMoveTo.",
    hint: "BeginPlay → SetTimer (2.0, Looping) → Get Player Pawn → AIMoveTo",
    placeholder: "Event BeginPlay → SetTimer → ...",
    solutionKeywords: ["settimer", "timer", "getplayerpawn", "player", "aimoveto", "moveto"],
    explanation: "Event BeginPlay → Set Timer by Function Name (FunctionName: 'SeekPlayer', Time: 2.0, Looping: True)\n\nFunction SeekPlayer:\n  Get Player Pawn → AIMoveTo (Pawn: Self, Goal: Player, AcceptanceRadius: 50)\n\nSetTimer с Looping запускает функцию каждые N секунд автоматически.",
    exampleSolution: "BeginPlay → SetTimer 2.0 Looping → Function: Get Player Pawn → AIMoveTo",
  },
  {
    id: "p011",
    title: "Сохранение данных через SaveGame",
    category: "Оптимизация",
    difficulty: "Expert",
    description: "Сохрани прогресс игрока (очки, уровень) при завершении уровня и загрузи при старте.",
    task: "Опиши Blueprint для сохранения через CreateSaveGameObject и LoadGameFromSlot.",
    hint: "SaveGame: CreateSaveGameObject → Set Variables → SaveGameToSlot | Load: LoadGameFromSlot → Cast → Get Variables",
    placeholder: "Save: Create SaveGame → Set Score → SaveToSlot | Load: LoadFromSlot → ...",
    solutionKeywords: ["savegame", "savegametoslot", "loadgamefromslot", "slot"],
    explanation: "Сохранение:\n  Create Save Game Object (Class: BP_SaveGame) → Cast\n  → Set Score, Set Level → Save Game to Slot ('SaveSlot_1', 0)\n\nЗагрузка (BeginPlay):\n  Does Save Game Exist? → True: Load Game from Slot ('SaveSlot_1', 0)\n  → Cast to BP_SaveGame → Get Score, Get Level\n\nSlotName — уникальная строка-идентификатор файла сохранения.",
    exampleSolution: "Create SaveGameObject → Set Score/Level → SaveGameToSlot | BeginPlay: LoadGameFromSlot → Cast → Get Variables",
  },
  {
    id: "p012",
    title: "Widget Blueprint: обновление HP-бара",
    category: "UI",
    difficulty: "Intermediate",
    description: "HP-бар в интерфейсе должен обновляться когда персонаж получает урон.",
    task: "Опиши как связать переменную Health персонажа с Progress Bar в Widget Blueprint.",
    hint: "Widget: Bind функция для Percent → Get Player → Cast → Get Health / MaxHealth",
    placeholder: "Widget ProgressBar → Bind → Get Player Character → ...",
    solutionKeywords: ["bind", "widget", "progressbar", "health", "percent", "cast"],
    explanation: "В WBP_HUD → ProgressBar → Percent → Create Binding:\n  Get Player Character → Cast To BP_Character\n  → Get Health → Divide by MaxHealth → Return (Float)\n\nBinding автоматически обновляет значение каждый кадр. Для оптимизации лучше обновлять только при изменении через Event.",
    exampleSolution: "ProgressBar Percent Binding → Get Player → Cast → Health / MaxHealth → Return",
  },
];

export function getRandomChallenge(exclude?: string): PracticeChallenge {
  const available = exclude
    ? PRACTICE_CHALLENGES.filter((c) => c.id !== exclude)
    : PRACTICE_CHALLENGES;
  return available[Math.floor(Math.random() * available.length)];
}

export function checkAnswer(challenge: PracticeChallenge, answer: string): boolean {
  const lower = answer.toLowerCase();
  const matched = challenge.solutionKeywords.filter((kw) =>
    lower.includes(kw.toLowerCase())
  );
  return matched.length >= Math.ceil(challenge.solutionKeywords.length * 0.6);
}

export const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Beginner: "#39D353",
  Basic: "#00D4FF",
  Intermediate: "#FFB800",
  Advanced: "#FF6B35",
  Expert: "#FF4757",
};
