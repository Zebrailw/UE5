export type NodeCategory =
  | "События"
  | "Поток выполнения"
  | "Переменные"
  | "Математика"
  | "Строки"
  | "Массивы и карты"
  | "Акторы"
  | "Компоненты"
  | "Ввод"
  | "Таймеры"
  | "AI"
  | "UI / Widget"
  | "Коммуникация"
  | "Функции и макросы";

export interface NodeExample {
  title: string;
  description: string;
  code: string;
}

export interface LibraryNode {
  id: string;
  name: string;
  nameEn: string;
  category: NodeCategory;
  icon: string;
  color: string;
  shortDesc: string;
  description: string;
  inputs: string[];
  outputs: string[];
  tips: string[];
  examples: NodeExample[];
  related: string[];
}

export const LIBRARY_NODES: LibraryNode[] = [
  // ─── СОБЫТИЯ ────────────────────────────────────────────────────────────────
  {
    id: "event_beginplay",
    name: "Event BeginPlay",
    nameEn: "Event BeginPlay",
    category: "События",
    icon: "play-circle",
    color: "#FF6B35",
    shortDesc: "Срабатывает один раз при старте игры или спауне актора",
    description:
      "Event BeginPlay — первая нода в большинстве Blueprint. Она выполняется ровно один раз: когда уровень загружается или когда актор появляется в мире через SpawnActor. Используй её для инициализации переменных, запуска таймеров и настройки начального состояния объекта.",
    inputs: [],
    outputs: ["Exec →"],
    tips: [
      "Не используй для логики, которая должна повторяться — только для инициализации",
      "В GameMode и PlayerController выполняется чуть позже чем в обычных акторах",
      "Используй совместно с SetTimer для запуска отложенной логики",
    ],
    examples: [
      {
        title: "Инициализация здоровья",
        description: "Задаём стартовые значения переменных при старте игры",
        code: "Event BeginPlay\n  → Set Health = 100\n  → Set MaxHealth = 100\n  → Set IsAlive = True",
      },
      {
        title: "Запуск таймера при спауне",
        description: "Через 5 секунд после появления актор исчезает",
        code: "Event BeginPlay\n  → Set Timer by Function Name\n     FunctionName: 'DestroyActor'\n     Time: 5.0\n     Looping: False",
      },
      {
        title: "Создание виджета HUD",
        description: "Создаём и добавляем HUD на экран при старте",
        code: "Event BeginPlay\n  → Create Widget (Class: WBP_HUD)\n  → Add to Viewport",
      },
    ],
    related: ["event_tick", "event_endplay", "set_timer"],
  },
  {
    id: "event_tick",
    name: "Event Tick",
    nameEn: "Event Tick",
    category: "События",
    icon: "refresh-cw",
    color: "#FF6B35",
    shortDesc: "Срабатывает каждый кадр. Delta Seconds — время между кадрами",
    description:
      "Event Tick вызывается каждый кадр рендера. Delta Seconds — это время в секундах прошедшее с прошлого кадра (обычно 0.016 при 60 FPS). Умножай скорости и перемещения на Delta Seconds чтобы движение было плавным на любом FPS.",
    inputs: ["Delta Seconds (Float)"],
    outputs: ["Exec →"],
    tips: [
      "Осторожно: тяжёлая логика в Tick снижает производительность",
      "Отключай Tick когда он не нужен: Actor Tick → Disabled",
      "Для простых таймеров лучше использовать Set Timer",
      "Умножай скорость на Delta Seconds: Speed * DeltaSeconds",
    ],
    examples: [
      {
        title: "Плавное вращение объекта",
        description: "Объект вращается на 90°/сек вне зависимости от FPS",
        code: "Event Tick (DeltaSeconds)\n  → Add Actor World Rotation\n     Delta Rotation: (Yaw: 90 * DeltaSeconds)",
      },
      {
        title: "Таймер обратного отсчёта",
        description: "Уменьшаем переменную TimeLeft каждый кадр",
        code: "Event Tick (DeltaSeconds)\n  → TimeLeft = TimeLeft - DeltaSeconds\n  → Branch (TimeLeft <= 0)\n     True → TimerEnd",
      },
    ],
    related: ["event_beginplay", "set_timer", "add_actor_world_rotation"],
  },
  {
    id: "event_overlap",
    name: "OnComponentBeginOverlap",
    nameEn: "OnComponentBeginOverlap",
    category: "События",
    icon: "layers",
    color: "#FF6B35",
    shortDesc: "Срабатывает когда другой объект входит в коллизию компонента",
    description:
      "Событие срабатывает когда OtherActor вошёл в зону коллизии данного компонента. Используется для триггеров, зон подбора предметов, урона от огня и т.д. Важно: коллизия должна быть настроена на Overlap, а не Block.",
    inputs: ["Overlapped Component", "Other Actor", "Other Component", "Other Body Index", "bFromSweep", "SweepResult"],
    outputs: ["Exec →"],
    tips: [
      "Проверяй тип актора через Cast To после получения OtherActor",
      "Для зон урона используй Timer + Overlap вместо Tick",
      "Включи Generate Overlap Events в настройках коллизии компонента",
    ],
    examples: [
      {
        title: "Подбор предмета",
        description: "Когда игрок входит в зону — предмет подбирается",
        code: "OnComponentBeginOverlap\n  → Cast To BP_PlayerCharacter (OtherActor)\n  → Is Valid?\n     → Add Item To Inventory\n     → DestroyActor",
      },
      {
        title: "Зона урона",
        description: "Лава наносит урон всем кто в неё заходит",
        code: "OnComponentBeginOverlap\n  → Cast To BP_Character (OtherActor)\n  → Call TakeDamage (DamageAmount: 25)",
      },
    ],
    related: ["event_endsoverlap", "cast_to", "destroy_actor"],
  },
  {
    id: "event_input",
    name: "InputAction",
    nameEn: "InputAction",
    category: "События",
    icon: "command",
    color: "#FF6B35",
    shortDesc: "Срабатывает при нажатии, удержании или отпускании кнопки",
    description:
      "InputAction — событие привязанное к конкретному действию из Project Settings → Input. Имеет три пина: Pressed (нажали), Released (отпустили), Repeat (удерживают). Actorу нужен компонент InputEnabled или Enable Input вызов.",
    inputs: [],
    outputs: ["Pressed →", "Released →", "Repeat →"],
    tips: [
      "Настрой действия в Project Settings → Engine → Input → Action Mappings",
      "Вызови Enable Input (PlayerController) в BeginPlay для обычных акторов",
      "Для Enhanced Input System используй IA_ ассеты вместо строк",
    ],
    examples: [
      {
        title: "Прыжок по кнопке",
        description: "Персонаж прыгает при нажатии Space",
        code: "InputAction Jump (Pressed)\n  → Cast To ACharacter (Self)\n  → Jump()",
      },
      {
        title: "Прицеливание",
        description: "Зажал — прицелился, отпустил — вышел",
        code: "InputAction Aim (Pressed) → Set IsAiming True\nInputAction Aim (Released) → Set IsAiming False",
      },
    ],
    related: ["event_beginplay", "enable_input", "input_axis"],
  },

  // ─── ПОТОК ВЫПОЛНЕНИЯ ────────────────────────────────────────────────────────
  {
    id: "branch",
    name: "Branch",
    nameEn: "Branch",
    category: "Поток выполнения",
    icon: "git-branch",
    color: "#00D4FF",
    shortDesc: "Разделяет поток на True и False — аналог if/else",
    description:
      "Branch — самая важная нода управления потоком. Принимает булево условие (Boolean) и направляет выполнение по пину True или False. Это полный аналог оператора if/else в обычном коде.",
    inputs: ["Exec →", "Condition (Boolean)"],
    outputs: ["True →", "False →"],
    tips: [
      "Можно цеплять несколько Branch подряд для if/else if/else",
      "Используй чистые (pure) функции сравнения прямо в Condition",
      "For more complex conditions: combine with AND/OR Boolean nodes",
    ],
    examples: [
      {
        title: "Проверка здоровья",
        description: "Если здоровье <= 0 — смерть, иначе — продолжаем",
        code: "Branch (Condition: Health <= 0)\n  True  → Call Die()\n  False → Continue",
      },
      {
        title: "Проверка инвентаря",
        description: "Можем ли подобрать предмет?",
        code: "Branch (Condition: InventoryCount < MaxInventory)\n  True  → Add Item\n  False → Show 'Инвентарь полон'",
      },
    ],
    related: ["sequence", "do_once", "gate", "for_loop"],
  },
  {
    id: "sequence",
    name: "Sequence",
    nameEn: "Sequence",
    category: "Поток выполнения",
    icon: "list",
    color: "#00D4FF",
    shortDesc: "Выполняет несколько цепочек нод последовательно, одну за другой",
    description:
      "Sequence запускает пины Then 0, Then 1, Then 2... строго по порядку. Полезна когда нужно выполнить несколько независимых веток от одного события без создания длинной цепочки.",
    inputs: ["Exec →"],
    outputs: ["Then 0 →", "Then 1 →", "Then 2 →", "..."],
    tips: [
      "Добавляй новые выходы кнопкой + Add pin",
      "Не для параллельного выполнения — всё идёт по очереди",
      "Отлично подходит для организации кода в BeginPlay",
    ],
    examples: [
      {
        title: "Инициализация нескольких систем",
        description: "При старте настраиваем здоровье, инвентарь и HUD",
        code: "Event BeginPlay → Sequence\n  Then 0 → Init Health System\n  Then 1 → Init Inventory\n  Then 2 → Create HUD Widget",
      },
    ],
    related: ["branch", "do_once", "event_beginplay"],
  },
  {
    id: "for_loop",
    name: "For Loop",
    nameEn: "For Loop",
    category: "Поток выполнения",
    icon: "repeat",
    color: "#00D4FF",
    shortDesc: "Выполняет Loop Body N раз. Индекс меняется от First до Last",
    description:
      "For Loop повторяет выполнение нод в Loop Body для каждого числа от First Index до Last Index включительно. Index — текущее значение счётчика. Completed срабатывает когда цикл завершён.",
    inputs: ["Exec →", "First Index (Int)", "Last Index (Int)"],
    outputs: ["Loop Body →", "Index (Int)", "Completed →"],
    tips: [
      "Last Index включён в цикл! Для 5 итераций: First=0, Last=4",
      "Не изменяй коллекцию внутри ForEachLoop — используй обычный For Loop",
      "Completed срабатывает ПОСЛЕ всех итераций",
    ],
    examples: [
      {
        title: "Заспаунить 10 врагов",
        description: "Создаём 10 акторов в случайных позициях",
        code: "For Loop (First: 0, Last: 9)\n  Loop Body\n    → Random Point In Box\n    → Spawn Actor BP_Enemy\n       Location: RandomPoint\nCompleted → Print 'Все враги заспаунены'",
      },
      {
        title: "Заполнить массив числами",
        description: "Добавляем числа 1-10 в массив",
        code: "For Loop (First: 1, Last: 10)\n  Loop Body\n    → Add (Index) to NumbersArray",
      },
    ],
    related: ["for_each_loop", "while_loop", "branch", "array_add"],
  },
  {
    id: "for_each_loop",
    name: "ForEach Loop",
    nameEn: "ForEachLoop",
    category: "Поток выполнения",
    icon: "repeat",
    color: "#00D4FF",
    shortDesc: "Перебирает все элементы массива по одному",
    description:
      "ForEachLoop итерирует по каждому элементу переданного массива. Array Element — текущий элемент, Array Index — его порядковый номер. Удобен для работы с коллекциями врагов, предметов и т.д.",
    inputs: ["Exec →", "Array (Array of Any)"],
    outputs: ["Loop Body →", "Array Element", "Array Index", "Completed →"],
    tips: [
      "Не удаляй элементы из массива внутри ForEach — это вызовет ошибку",
      "Для удаления — сначала собери список на удаление, потом удали после Completed",
      "Break не поддерживается — используй Gate для прерывания",
    ],
    examples: [
      {
        title: "Нанести урон всем врагам",
        description: "Перебираем массив врагов и наносим каждому урон",
        code: "ForEachLoop (Array: EnemiesArray)\n  Loop Body\n    → Array Element → Cast To BP_Enemy\n    → Call TakeDamage (10)",
      },
    ],
    related: ["for_loop", "array_get", "get_all_actors_of_class"],
  },
  {
    id: "delay",
    name: "Delay",
    nameEn: "Delay",
    category: "Поток выполнения",
    icon: "clock",
    color: "#00D4FF",
    shortDesc: "Задерживает выполнение на N секунд, затем продолжает",
    description:
      "Delay приостанавливает поток выполнения Blueprint на указанное количество секунд. После задержки выполнение продолжается с пина Completed. Не блокирует остальную логику Blueprint.",
    inputs: ["Exec →", "Duration (Float)"],
    outputs: ["Completed →"],
    tips: [
      "Delay не блокирует другие события — Blueprint продолжает реагировать",
      "Для повторяющихся задержек лучше используй Set Timer",
      "Delay(0) выполнится в следующем кадре, а не мгновенно",
    ],
    examples: [
      {
        title: "Взрыв с задержкой",
        description: "Бомба взрывается через 3 секунды после активации",
        code: "Event Activate\n  → Delay (Duration: 3.0)\n  → Spawn Emitter (Explosion)\n  → DestroyActor",
      },
      {
        title: "Respawn игрока",
        description: "После смерти ждём 2 секунды и возрождаем",
        code: "Event OnDeath\n  → Hide Actor\n  → Delay (2.0)\n  → Respawn Player\n  → Show Actor",
      },
    ],
    related: ["set_timer", "event_tick", "sequence"],
  },
  {
    id: "do_once",
    name: "DoOnce",
    nameEn: "DoOnce",
    category: "Поток выполнения",
    icon: "shield",
    color: "#00D4FF",
    shortDesc: "Пропускает выполнение через себя только один раз, затем блокирует",
    description:
      "DoOnce блокирует поток после первого прохождения. Повторные вызовы игнорируются. Можно сбросить через пин Reset — тогда DoOnce снова сработает один раз. Идеально для событий которые должны произойти только однажды.",
    inputs: ["Exec →", "Reset"],
    outputs: ["Completed →"],
    tips: [
      "Полезно для защиты от двойного подбора предмета",
      "Используй Reset для перезапуска условия",
      "Можно эмулировать через булеву переменную + Branch",
    ],
    examples: [
      {
        title: "Одноразовый диалог",
        description: "NPC говорит фразу только при первом приближении",
        code: "OnComponentBeginOverlap\n  → DoOnce\n  → Play Dialog 'Привет, герой!'",
      },
    ],
    related: ["branch", "gate", "flip_flop"],
  },
  {
    id: "gate",
    name: "Gate",
    nameEn: "Gate",
    category: "Поток выполнения",
    icon: "toggle-left",
    color: "#00D4FF",
    shortDesc: "Пропускает или блокирует поток. Открывается и закрывается вручную",
    description:
      "Gate — управляемый шлюз. Когда ворота открыты (Open), выполнение проходит. Когда закрыты (Close) — блокируется. Toggle переключает состояние. Start Closed задаёт начальное состояние.",
    inputs: ["Exec →", "Open", "Close", "Toggle", "Start Closed (Bool)"],
    outputs: ["Exit →"],
    tips: [
      "Используй для паузы/возобновления периодических событий",
      "Комбинируй с Tick для условного выполнения каждого кадра",
      "Toggle удобен для чередующегося поведения",
    ],
    examples: [
      {
        title: "Пауза движения",
        description: "Стоп/старт движения объекта по кнопке",
        code: "Event Tick → Gate (Start Closed: False)\n  Exit → Move Object\n\nInputAction Pause\n  Pressed → Gate Toggle",
      },
    ],
    related: ["do_once", "branch", "flip_flop"],
  },
  {
    id: "flip_flop",
    name: "FlipFlop",
    nameEn: "FlipFlop",
    category: "Поток выполнения",
    icon: "repeat",
    color: "#00D4FF",
    shortDesc: "Чередует выходы A и B при каждом вызове",
    description:
      "FlipFlop переключается между выходами A и B при каждом вызове: первый вызов → A, второй → B, третий → A и т.д. Is A — булева переменная которая показывает текущее состояние.",
    inputs: ["Exec →"],
    outputs: ["A →", "B →", "Is A (Bool)"],
    tips: [
      "Удобен для переключателей: вкл/выкл, открыть/закрыть",
      "Is A можно использовать как состояние",
    ],
    examples: [
      {
        title: "Переключатель света",
        description: "Нажми кнопку — включается/выключается свет",
        code: "InputAction ToggleLight\n  → FlipFlop\n     A → Light Component → Set Visibility (True)\n     B → Light Component → Set Visibility (False)",
      },
    ],
    related: ["gate", "do_once", "branch"],
  },

  // ─── ПЕРЕМЕННЫЕ ──────────────────────────────────────────────────────────────
  {
    id: "get_set_variable",
    name: "Get / Set переменная",
    nameEn: "Get / Set Variable",
    category: "Переменные",
    icon: "database",
    color: "#7B4FFF",
    shortDesc: "Get читает значение, Set записывает новое значение переменной",
    description:
      "Переменные хранят данные в Blueprint. Get (круглый пин) возвращает текущее значение. Set (квадратный пин) записывает новое значение. Типы: Boolean, Integer, Float, String, Vector, Object и др.",
    inputs: ["Set: Exec →", "Set: New Value"],
    outputs: ["Get: Value", "Set: Exec →"],
    tips: [
      "Переменная с галочкой Instance Editable видна в деталях актора",
      "Private переменные видны только внутри Blueprint",
      "Используй категории (Category) для организации переменных",
      "Rep (Replicated) нужно для мультиплеера",
    ],
    examples: [
      {
        title: "Счётчик очков",
        description: "Получаем Score, прибавляем очки, записываем обратно",
        code: "Get Score → Add (PointsEarned) → Set Score",
      },
      {
        title: "Переключение состояния",
        description: "Инвертируем булевую переменную",
        code: "Get IsRunning → NOT Boolean → Set IsRunning",
      },
    ],
    related: ["branch", "make_struct", "cast_to"],
  },
  {
    id: "make_break_struct",
    name: "Make / Break Struct",
    nameEn: "Make / Break Struct",
    category: "Переменные",
    icon: "package",
    color: "#7B4FFF",
    shortDesc: "Make создаёт структуру из компонентов, Break разбирает её на части",
    description:
      "Struct (структура) — тип данных который объединяет несколько переменных. Make создаёт структуру задавая все поля. Break разбирает её на отдельные значения. Пример структур: FVector, FHitResult, FTransform.",
    inputs: ["Make: все поля структуры"],
    outputs: ["Break: все поля структуры"],
    tips: [
      "FHitResult содержит Location, Normal, Actor, Component и др.",
      "FTransform содержит Location, Rotation, Scale",
      "Создавай свои структуры в Content Browser",
    ],
    examples: [
      {
        title: "Создание трансформа",
        description: "Собираем Transform для спауна актора",
        code: "Make Transform\n  Location: (X:100, Y:0, Z:50)\n  Rotation: (0, 0, 90)\n  Scale: (1, 1, 1)\n→ Spawn Actor At Transform",
      },
      {
        title: "Разбор результата трассировки",
        description: "Получаем что было поражено линейной трассировкой",
        code: "Line Trace → Out Hit\n→ Break Hit Result\n   → Hit Actor\n   → Hit Location\n   → Hit Normal",
      },
    ],
    related: ["get_set_variable", "line_trace", "spawn_actor"],
  },
  {
    id: "cast_to",
    name: "Cast To",
    nameEn: "Cast To",
    category: "Переменные",
    icon: "arrow-right-circle",
    color: "#7B4FFF",
    shortDesc: "Преобразует ссылку на объект к конкретному типу Blueprint",
    description:
      "Cast To проверяет является ли объект экземпляром конкретного класса Blueprint. Если да — Cast Succeeded и ты получаешь типизированную ссылку с доступом ко всем переменным и функциям этого класса. Если нет — Cast Failed.",
    inputs: ["Exec →", "Object (любой Actor/Object)"],
    outputs: ["Cast Succeeded →", "Cast Failed →", "As BP_ClassName"],
    tips: [
      "Cast — основной способ коммуникации между Blueprint",
      "Используй Is Valid после Cast для безопасности",
      "Если Cast часто используется — кешируй результат в переменную",
      "Interface быстрее Cast при работе с множеством разных типов",
    ],
    examples: [
      {
        title: "Получить здоровье игрока",
        description: "Из любого события получаем ссылку на персонажа",
        code: "Get Player Character\n→ Cast To BP_PlayerCharacter\n   Cast Succeeded:\n     → Get Health\n   Cast Failed:\n     → Print 'Не персонаж игрока'",
      },
    ],
    related: ["get_set_variable", "event_overlap", "interface_call"],
  },

  // ─── МАТЕМАТИКА ─────────────────────────────────────────────────────────────
  {
    id: "math_basic",
    name: "Арифметика (+, -, *, /)",
    nameEn: "Add, Subtract, Multiply, Divide",
    category: "Математика",
    icon: "plus-circle",
    color: "#39D353",
    shortDesc: "Базовые математические операции над числами и векторами",
    description:
      "Blueprint поддерживает арифметику для Integer, Float и Vector. Нода определяется автоматически по типу данных. Деление на 0 возвращает 0, а не ошибку. Векторные операции работают покомпонентно.",
    inputs: ["A", "B"],
    outputs: ["Result"],
    tips: [
      "Float делится точнее Integer — используй Float для позиций и скоростей",
      "Векторное умножение на Float масштабирует вектор",
      "Для сложной математики есть ноды Lerp, Clamp, Abs и т.д.",
    ],
    examples: [
      {
        title: "Урон с множителем",
        description: "Критический урон = базовый * 2.5",
        code: "BaseDamage → Multiply (2.5) → CriticalDamage",
      },
      {
        title: "Плавное движение (Delta Seconds)",
        description: "Перемещение не зависит от FPS",
        code: "Speed (500.0) → Multiply (DeltaSeconds)\n→ Add Actor World Offset",
      },
    ],
    related: ["math_lerp", "math_clamp", "event_tick"],
  },
  {
    id: "math_lerp",
    name: "Lerp",
    nameEn: "Linear Interpolate (Lerp)",
    category: "Математика",
    icon: "sliders",
    color: "#39D353",
    shortDesc: "Плавная интерполяция между двумя значениями по параметру Alpha (0..1)",
    description:
      "Lerp (Linear Interpolate) вычисляет промежуточное значение между A и B. При Alpha=0 результат = A, при Alpha=1 результат = B, при Alpha=0.5 — середина. Работает с Float, Vector, Color и Rotator.",
    inputs: ["A", "B", "Alpha (Float 0..1)"],
    outputs: ["Result"],
    tips: [
      "Для плавной анимации используй Lerp в Tick с Alpha = DeltaSeconds * Speed",
      "Lerp(A, B, 0.1) в Tick создаёт экспоненциальное замедление",
      "FInterpTo — улучшенная версия с контролем скорости",
    ],
    examples: [
      {
        title: "Плавное следование камеры",
        description: "Камера плавно догоняет цель",
        code: "Event Tick (DeltaSeconds)\n  CurrentPos → Lerp(TargetPos, 0.1 * DeltaSeconds)\n  → Set World Location",
      },
      {
        title: "Переход цвета",
        description: "Материал плавно меняет цвет",
        code: "Lerp Color (A: Red, B: Blue, Alpha: 0.5)\n→ Set Material Scalar Parameter",
      },
    ],
    related: ["math_basic", "math_clamp", "event_tick"],
  },
  {
    id: "math_clamp",
    name: "Clamp",
    nameEn: "Clamp",
    category: "Математика",
    icon: "minus-circle",
    color: "#39D353",
    shortDesc: "Ограничивает значение в диапазоне [Min, Max]",
    description:
      "Clamp не даёт значению выйти за рамки минимума и максимума. Если значение < Min — возвращает Min. Если > Max — возвращает Max. Иначе — само значение. Незаменим для ограничения здоровья, угла поворота камеры и т.д.",
    inputs: ["Value", "Min", "Max"],
    outputs: ["Result"],
    tips: [
      "Clamp(Health, 0, MaxHealth) — никогда не уйдёт в минус",
      "Используй для угла обзора камеры: Clamp(Pitch, -80, 80)",
      "Clamp01 — специальная версия для диапазона 0..1",
    ],
    examples: [
      {
        title: "Ограничение здоровья",
        description: "Здоровье не может быть меньше 0 или больше максимума",
        code: "New Health = Health - Damage\n→ Clamp (Min: 0, Max: MaxHealth)\n→ Set Health",
      },
    ],
    related: ["math_basic", "math_lerp", "get_set_variable"],
  },

  // ─── МАССИВЫ ─────────────────────────────────────────────────────────────────
  {
    id: "array_add",
    name: "Array: Add / Remove",
    nameEn: "Array Add / Remove",
    category: "Массивы и карты",
    icon: "plus-square",
    color: "#FFB800",
    shortDesc: "Добавляет или удаляет элемент из массива",
    description:
      "Массив (Array) — упорядоченный список элементов одного типа. Add добавляет в конец. Remove by Value удаляет по значению. Remove Index удаляет по позиции. Length возвращает количество элементов.",
    inputs: ["Target Array", "New Item / Index / Value"],
    outputs: ["Exec →", "Index (для Add)"],
    tips: [
      "Индексы начинаются с 0: первый элемент = индекс 0",
      "Remove Index не сдвигает индексы — осторожно при итерации",
      "Clear очищает весь массив",
      "Contains проверяет наличие элемента",
    ],
    examples: [
      {
        title: "Инвентарь предметов",
        description: "Добавляем и убираем предметы из инвентаря",
        code: "// Подбор предмета:\nAdd (Inventory Array, NewItem)\n\n// Использование предмета:\nRemove (Inventory Array, UsedItem)",
      },
      {
        title: "Список врагов в зоне",
        description: "Отслеживаем кто вошёл и вышел из триггер-зоны",
        code: "OnBeginOverlap → Add (EnemiesInZone, OtherActor)\nOnEndOverlap → Remove (EnemiesInZone, OtherActor)",
      },
    ],
    related: ["for_each_loop", "array_get", "get_all_actors_of_class"],
  },
  {
    id: "get_all_actors",
    name: "Get All Actors Of Class",
    nameEn: "GetAllActorsOfClass",
    category: "Акторы",
    icon: "users",
    color: "#FF6B35",
    shortDesc: "Возвращает массив всех акторов заданного класса на уровне",
    description:
      "Находит все акторы указанного Blueprint-класса размещённые на уровне. Возвращает массив. Дорогая операция — не вызывай в Tick! Используй в BeginPlay или по событию для кеширования результата.",
    inputs: ["Actor Class"],
    outputs: ["Out Actors (Array)"],
    tips: [
      "Вызывай только по событию, никогда не в Tick",
      "Сохраняй результат в переменную-массив",
      "Для одного актора: Get Actor Of Class быстрее",
      "Использует поиск по всему уровню — медленно для больших уровней",
    ],
    examples: [
      {
        title: "Взрыв поражает всех врагов",
        description: "Находим всех врагов и наносим урон при взрыве",
        code: "Event Explode\n→ Get All Actors Of Class (BP_Enemy)\n→ ForEach Loop\n   Loop Body\n     → Cast To BP_Enemy\n     → TakeDamage (ExplosionDamage)",
      },
    ],
    related: ["for_each_loop", "cast_to", "line_trace"],
  },
  {
    id: "spawn_actor",
    name: "Spawn Actor From Class",
    nameEn: "SpawnActor",
    category: "Акторы",
    icon: "zap",
    color: "#FF6B35",
    shortDesc: "Создаёт новый актор в мире из указанного Blueprint-класса",
    description:
      "SpawnActor создаёт экземпляр Blueprint в указанной позиции и ориентации. Возвращает ссылку на созданный актор. Transform задаёт место появления. Можно спаунить пули, врагов, эффекты и т.д.",
    inputs: ["Class", "Spawn Transform", "Collision Handling Override"],
    outputs: ["Return Value (Actor)"],
    tips: [
      "Сохраняй Return Value если нужно управлять актором после спауна",
      "Используй Deferred Spawn для настройки переменных до BeginPlay",
      "Проверяй Is Valid на Return Value — спаун может не сработать из-за коллизии",
    ],
    examples: [
      {
        title: "Выстрел пулей",
        description: "Спауним пулю в позиции дула оружия",
        code: "InputAction Fire (Pressed)\n→ Get Muzzle Transform\n→ Spawn Actor (Class: BP_Bullet)\n   Transform: MuzzleTransform",
      },
      {
        title: "Случайный лут при смерти",
        description: "Враг при смерти выбрасывает случайный предмет",
        code: "Event OnDeath\n→ Random Integer (Min: 0, Max: 2) → Select\n   0 → Class: BP_HealthPotion\n   1 → Class: BP_Ammo\n   2 → Class: BP_Coin\n→ Spawn Actor At Self Location",
      },
    ],
    related: ["destroy_actor", "make_break_struct", "event_beginplay"],
  },
  {
    id: "destroy_actor",
    name: "DestroyActor",
    nameEn: "DestroyActor",
    category: "Акторы",
    icon: "trash-2",
    color: "#FF6B35",
    shortDesc: "Уничтожает актор и удаляет его из мира",
    description:
      "DestroyActor немедленно удаляет актор из мира. После вызова все ссылки на него становятся невалидными. Event EndPlay вызывается перед уничтожением. Используй Is Valid для проверки перед доступом к уничтоженному актору.",
    inputs: ["Exec →", "Target (Actor)"],
    outputs: ["Exec →"],
    tips: [
      "После DestroyActor не обращайся к переменным этого актора",
      "Проверяй Is Valid перед любым вызовом на ссылку",
      "В мультиплеере уничтожение должно происходить на сервере",
    ],
    examples: [
      {
        title: "Подбор предмета",
        description: "Уничтожаем актор предмета после подбора",
        code: "OnComponentBeginOverlap\n→ Cast To BP_Player → Is Valid\n→ Add To Inventory\n→ DestroyActor",
      },
    ],
    related: ["spawn_actor", "is_valid", "event_endplay"],
  },

  // ─── ТАЙМЕРЫ ─────────────────────────────────────────────────────────────────
  {
    id: "set_timer",
    name: "Set Timer by Function Name",
    nameEn: "SetTimerByFunctionName",
    category: "Таймеры",
    icon: "clock",
    color: "#00D4FF",
    shortDesc: "Вызывает функцию через N секунд. Опционально — повторяет бесконечно",
    description:
      "Set Timer запускает функцию через заданное время. Если Looping = True — функция вызывается снова и снова с тем же интервалом. Вернёт Handle — ссылку на таймер для его остановки. Функция задаётся строкой имени.",
    inputs: ["Object (Self)", "Function Name (String)", "Time (Float)", "Looping (Bool)"],
    outputs: ["Return Value (Timer Handle)"],
    tips: [
      "Сохраняй Timer Handle для остановки таймера через Clear and Invalidate Timer",
      "Looping=True создаёт бесконечный цикл — не забудь его останавливать",
      "По функциональности Set Timer by Event гибче (принимает Delegate)",
      "Время 0.0 вызовет функцию в следующем кадре",
    ],
    examples: [
      {
        title: "Регенерация здоровья",
        description: "Каждую секунду восстанавливаем 5 HP",
        code: "Event BeginPlay\n→ Set Timer by Function Name\n   Object: Self\n   Function Name: 'RegenHealth'\n   Time: 1.0\n   Looping: True\n\nFunction RegenHealth:\n→ Health = Clamp(Health + 5, 0, MaxHealth)\n→ Set Health",
      },
      {
        title: "Самоуничтожение через 10 секунд",
        description: "Актор уничтожается по таймеру",
        code: "Event BeginPlay\n→ Set Timer by Function Name\n   Function Name: 'DestroySelf'\n   Time: 10.0\n   Looping: False",
      },
    ],
    related: ["event_beginplay", "delay", "event_tick"],
  },

  // ─── AI ───────────────────────────────────────────────────────────────────────
  {
    id: "ai_move_to",
    name: "AI Move To",
    nameEn: "AIMoveTo",
    category: "AI",
    icon: "navigation",
    color: "#7B4FFF",
    shortDesc: "Перемещает AI-персонажа к цели используя NavMesh",
    description:
      "AIMoveTo использует NavMesh (карту навигации) для автоматического нахождения пути к цели. Работает только при наличии NavMesh в сцене и контроллера AI (AIController). Pawn — перемещаемый AI, Goal Actor или Location — цель.",
    inputs: ["Pawn (AIController)", "Goal Actor или Goal Location", "Acceptance Radius (Float)"],
    outputs: ["Move Request ID"],
    tips: [
      "Добавь Nav Mesh Bounds Volume в уровень для навигации",
      "Acceptance Radius — расстояние от цели при котором движение считается завершённым",
      "Используй Behavior Tree для сложной логики AI",
      "Для остановки: Stop Movement",
    ],
    examples: [
      {
        title: "Враг следует за игроком",
        description: "AI ищет путь к игроку каждые 0.5 секунды",
        code: "Event BeginPlay\n→ Set Timer by Function Name\n   FunctionName: 'ChasePlayer'\n   Time: 0.5\n   Looping: True\n\nFunction ChasePlayer:\n→ Get Player Pawn\n→ AIMoveTo (Pawn: Self, Goal: PlayerPawn)\n   AcceptanceRadius: 100",
      },
    ],
    related: ["set_timer", "event_beginplay", "cast_to"],
  },

  // ─── КОММУНИКАЦИЯ ───────────────────────────────────────────────────────────
  {
    id: "event_dispatcher",
    name: "Event Dispatcher",
    nameEn: "Event Dispatcher",
    category: "Коммуникация",
    icon: "radio",
    color: "#FF4757",
    shortDesc: "Отправляет события подписчикам без прямой ссылки на них",
    description:
      "Event Dispatcher — система событий для коммуникации между Blueprint без жёстких зависимостей. Один Blueprint вызывает (Call) диспетчер, другие подписываются (Bind Event) и получают уведомление. Аналог событий/делегатов в других языках.",
    inputs: ["Call: Exec →", "Bind Event: Event (Delegate)", "Target Actor"],
    outputs: ["Call: Exec →"],
    tips: [
      "Создаётся в секции My Blueprint → Event Dispatchers",
      "Можно передавать параметры вместе с событием",
      "Unbind удаляет подписку, Unbind All — удаляет все",
      "Лучше чем прямые ссылки для слабо связанной архитектуры",
    ],
    examples: [
      {
        title: "Кнопка открывает дверь",
        description: "Кнопка не знает о двери — они связаны через диспетчер",
        code: "// BP_Button:\nEvent Dispatcher: OnButtonPressed\nOnComponentBeginOverlap → Call OnButtonPressed\n\n// BP_Door (BeginPlay):\nGet Reference to Button\n→ Bind Event (On Button Pressed)\n   → Event: Open Door",
      },
    ],
    related: ["interface_call", "cast_to", "event_beginplay"],
  },
  {
    id: "interface_call",
    name: "Blueprint Interface",
    nameEn: "Blueprint Interface",
    category: "Коммуникация",
    icon: "share-2",
    color: "#FF4757",
    shortDesc: "Универсальный вызов функции на любом акторе независимо от его типа",
    description:
      "Blueprint Interface определяет контракт — набор функций которые могут быть реализованы любым Blueprint. Вызов через Does Implement Interface + Call Interface Message работает на любом акторе без Cast. Идеально для систем взаимодействия.",
    inputs: ["Target (любой Actor)", "Interface Function Parameters"],
    outputs: ["Return Values (если есть)"],
    tips: [
      "Создай Interface: Content Browser → Blueprint Interface",
      "Добавь функции без реализации — только сигнатуры",
      "В каждом Blueprint: Class Settings → Implemented Interfaces → Add",
      "Реализуй функцию: в Event Graph появится Event с именем функции",
    ],
    examples: [
      {
        title: "Универсальное взаимодействие",
        description: "Игрок нажимает E — и ящик, и дверь, и NPC реагируют",
        code: "// При нажатии E:\nLine Trace → Hit Actor\n→ Does Implement Interface (BPI_Interactable)?\n   True:\n     → Call Interface Message: Interact()\n\n// В BP_Chest, BP_Door, BP_NPC:\nEvent Interact → своя логика",
      },
    ],
    related: ["event_dispatcher", "cast_to", "line_trace"],
  },

  // ─── КОМПОНЕНТЫ ─────────────────────────────────────────────────────────────
  {
    id: "line_trace",
    name: "Line Trace By Channel",
    nameEn: "LineTraceByChannel",
    category: "Компоненты",
    icon: "crosshair",
    color: "#00D4FF",
    shortDesc: "Кидает невидимый луч и возвращает первый объект с которым пересёкся",
    description:
      "Line Trace (Raycast) — виртуальный луч из точки Start до End. Если луч пересёк коллизию — bBlockingHit = True, Out Hit содержит информацию о пересечении. Используется для оружия, взаимодействия, ИИ.",
    inputs: ["Start (Vector)", "End (Vector)", "Trace Channel", "Actors to Ignore", "Draw Debug Type"],
    outputs: ["Return Value (Bool)", "Out Hit (HitResult)"],
    tips: [
      "Draw Debug Type: ForDuration — рисует луч для отладки",
      "Actors to Ignore: добавь Self чтобы луч не попадал в стреляющего",
      "Multi Line Trace возвращает все пересечения а не только первое",
      "Channel: Visibility — виден ли объект, Camera — столкновение камеры",
    ],
    examples: [
      {
        title: "Выстрел из оружия",
        description: "Луч от камеры — проверяем что попали",
        code: "InputAction Fire (Pressed)\n→ Get Player Camera\n→ Line Trace By Channel\n   Start: Camera Location\n   End: Camera Location + (Camera Forward * 5000)\n   Channel: Visibility\n→ If bBlockingHit\n   → Break HitResult → Hit Actor\n   → Cast To BP_Enemy → TakeDamage",
      },
      {
        title: "Взаимодействие с объектами",
        description: "Луч от игрока находит интерактивный объект",
        code: "Event Tick\n→ Line Trace (Start: Camera, End: Camera + Forward * 300)\n   → If Hit → Break Hit → Hit Actor\n   → Does Implement BPI_Interactable? → Show Interact Prompt",
      },
    ],
    related: ["interface_call", "make_break_struct", "cast_to"],
  },

  // ─── UI ──────────────────────────────────────────────────────────────────────
  {
    id: "widget_blueprint",
    name: "Widget Blueprint / HUD",
    nameEn: "Widget Blueprint",
    category: "UI / Widget",
    icon: "monitor",
    color: "#00D4FF",
    shortDesc: "Создание и управление интерфейсом: HP-бары, меню, иконки предметов",
    description:
      "Widget Blueprint — система создания UI в UE5. Включает Canvas Panel, ProgressBar, Text, Image и другие элементы. Данные передаются через Binding функций или прямым Set. Добавляется на экран через Add to Viewport.",
    inputs: ["Create Widget: Class, Owning Player"],
    outputs: ["Widget Object Reference"],
    tips: [
      "Binding обновляет каждый кадр — дорого! Лучше вызывать Update вручную",
      "Remove from Parent убирает виджет с экрана, не уничтожая его",
      "Z Order в Add to Viewport определяет порядок отрисовки",
      "Используй Set Visibility вместо Remove/Add для скрытия",
    ],
    examples: [
      {
        title: "Создать и показать HUD",
        description: "Создаём HUD при старте и сохраняем ссылку",
        code: "Event BeginPlay\n→ Create Widget (Class: WBP_HUD)\n→ Add to Viewport\n→ Set HUDRef (сохраняем)",
      },
      {
        title: "Обновить HP-бар",
        description: "При получении урона обновляем бар вручную",
        code: "// В BP_Character, Function TakeDamage:\nSet Health (New Value)\n→ Get HUDRef → Cast To WBP_HUD\n→ Update HP Bar (Health / MaxHealth)",
      },
    ],
    related: ["event_beginplay", "cast_to", "get_set_variable"],
  },

  // ─── ФУНКЦИИ И МАКРОСЫ ──────────────────────────────────────────────────────
  {
    id: "custom_function",
    name: "Функция (Function)",
    nameEn: "Custom Function",
    category: "Функции и макросы",
    icon: "code",
    color: "#7B4FFF",
    shortDesc: "Переиспользуемый блок логики с входами, выходами и возвращаемым значением",
    description:
      "Custom Function — именованный блок Blueprint-логики. Принимает параметры, выполняет действия, может возвращать значения. Вызывается из любого места данного Blueprint. Pure Function не имеет Exec-пинов и не имеет побочных эффектов.",
    inputs: ["Custom Inputs (любые типы)"],
    outputs: ["Custom Outputs / Return Value"],
    tips: [
      "Pure Function (без Exec) вычисляется автоматически когда нужно значение",
      "Функции не поддерживают Delay и другие латентные ноды — для этого нужны Macros",
      "Используй Local Variables внутри функции для временных данных",
      "Описывай функции через Tooltip для документации",
    ],
    examples: [
      {
        title: "Функция расчёта урона",
        description: "Централизованный расчёт финального урона",
        code: "Function CalculateDamage (BaseDamage: Float, ArmorValue: Float)\n→ Damage = BaseDamage - ArmorValue\n→ Clamp (Damage, 1, BaseDamage)\n→ Return Damage",
      },
      {
        title: "Pure функция IsAlive",
        description: "Проверяет жив ли актор (Pure — без Exec)",
        code: "Pure Function IsAlive () → Bool\n→ Get Health → Greater Than (0)\n→ Return Result",
      },
    ],
    related: ["macro", "event_dispatcher", "cast_to"],
  },
  {
    id: "macro",
    name: "Macro",
    nameEn: "Macro",
    category: "Функции и макросы",
    icon: "cpu",
    color: "#7B4FFF",
    shortDesc: "Как функция, но поддерживает несколько Exec-выходов и латентные ноды",
    description:
      "Macro — шаблон Blueprint-логики который разворачивается как inline-код при вызове. Может иметь несколько входных и выходных пинов Exec. Поддерживает Delay и другие латентные ноды в отличие от Function. Макробиблиотеки можно использовать в других Blueprint.",
    inputs: ["Exec In", "Custom Inputs"],
    outputs: ["Exec Out(s)", "Custom Outputs"],
    tips: [
      "Не используй Macro для логики которую можно вынести в Function",
      "Macro Library — отдельный ассет с общими макросами",
      "Макросы не переопределяются — используй функции для полиморфизма",
      "Хороши для сложных условных выходов: Success/Failure",
    ],
    examples: [
      {
        title: "Макрос IsAlive с ветками",
        description: "Два выхода: Alive и Dead",
        code: "Macro IsAlive (Input: Exec)\n→ Branch (Health > 0)\n   True  → Output: Alive\n   False → Output: Dead",
      },
    ],
    related: ["custom_function", "branch", "delay"],
  },
];

export const CATEGORIES: NodeCategory[] = [
  "События",
  "Поток выполнения",
  "Переменные",
  "Математика",
  "Массивы и карты",
  "Акторы",
  "Компоненты",
  "Таймеры",
  "AI",
  "UI / Widget",
  "Коммуникация",
  "Функции и макросы",
];

export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  "События": "#FF6B35",
  "Поток выполнения": "#00D4FF",
  "Переменные": "#7B4FFF",
  "Математика": "#39D353",
  "Массивы и карты": "#FFB800",
  "Акторы": "#FF6B35",
  "Компоненты": "#00D4FF",
  "Таймеры": "#00D4FF",
  "AI": "#7B4FFF",
  "UI / Widget": "#00D4FF",
  "Коммуникация": "#FF4757",
  "Функции и макросы": "#7B4FFF",
};

export const CATEGORY_ICONS: Record<NodeCategory, string> = {
  "События": "zap",
  "Поток выполнения": "git-branch",
  "Переменные": "database",
  "Математика": "hash",
  "Массивы и карты": "list",
  "Акторы": "box",
  "Компоненты": "cpu",
  "Таймеры": "clock",
  "AI": "navigation",
  "UI / Widget": "monitor",
  "Коммуникация": "radio",
  "Функции и макросы": "code",
};
