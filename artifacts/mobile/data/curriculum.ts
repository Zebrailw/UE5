export type Difficulty = "beginner" | "basic" | "intermediate" | "advanced" | "expert";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface BuildPin {
  id: string;
  label: string;
  type: "exec" | "bool" | "float" | "integer" | "string" | "object" | "vector";
}

export interface BuildNode {
  id: string;
  title: string;
  subtitle?: string;
  nodeType: "event" | "function" | "flow" | "value" | "variable";
  inputs: BuildPin[];
  outputs: BuildPin[];
  x: number;
  y: number;
}

export interface BuildConnection {
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;
}

export interface BuildChallenge {
  instruction: string;
  hint: string;
  hints?: string[];
  nodes: BuildNode[];
  solution: BuildConnection[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  content: string;
  xpReward: number;
  estimatedMinutes: number;
  quizQuestions: QuizQuestion[];
  practiceTask?: string;
  realWorldExample?: string;
  tags: string[];
  buildChallenge?: BuildChallenge;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: Difficulty;
  color: string;
  lessons: Lesson[];
  xpRequired: number;
}

export const getDifficultyLabel = (d: Difficulty): string => {
  const map: Record<Difficulty, string> = {
    beginner: "Начинающий",
    basic: "Базовый",
    intermediate: "Средний",
    advanced: "Продвинутый",
    expert: "Эксперт",
  };
  return map[d];
};

export const getDifficultyColor = (d: Difficulty): string => {
  const map: Record<Difficulty, string> = {
    beginner: "#00D4FF",
    basic: "#39D353",
    intermediate: "#FFB800",
    advanced: "#FF6B35",
    expert: "#FF4757",
  };
  return map[d];
};

export const MODULES: Module[] = [
  {
    id: "mod_intro",
    title: "Что такое Blueprint?",
    description: "Понимаем визуальную систему скриптинга Unreal Engine с нуля",
    icon: "grid",
    difficulty: "beginner",
    color: "#00D4FF",
    xpRequired: 0,
    lessons: [
      {
        id: "les_001",
        moduleId: "mod_intro",
        title: "Введение в Blueprint",
        description: "Узнайте, что такое Blueprint и почему это мощный инструмент",
        content:
          "Blueprint — визуальная система скриптинга Unreal Engine 5, позволяющая создавать игровую логику без написания кода на C++. Вместо текстового кода вы соединяете узлы (ноды) в граф — каждый узел выполняет определённое действие или возвращает значение.\n\nBlueprint использует событийно-ориентированную модель программирования. Код не выполняется сверху вниз — он запускается в ответ на события: «Begin Play», «On Hit», «Tick» и другие.\n\n**Ключевые концепции:**\n• Узлы (Nodes) — строительные блоки логики Blueprint\n• Пины (Pins) — точки соединения на узлах (вход/выход)\n• Провода (Wires) — линии, соединяющие пины между узлами\n• События (Events) — специальные узлы, запускающие выполнение\n• Переменные (Variables) — хранение и получение данных\n\nBlueprint компилируется в байткод во время выполнения, что делает его достаточно быстрым для большинства игровой логики.",
        xpReward: 100,
        estimatedMinutes: 8,
        tags: ["основы", "введение"],
        realWorldExample:
          "Каждая крупная AAA-игра на UE5 использует Blueprint для быстрого прототипирования — даже команды с программистами на C++ применяют Blueprint для геймплейного скриптинга.",
        practiceTask:
          "Откройте Unreal Engine, создайте новый Blueprint Actor и изучите Event Graph. Найдите события BeginPlay и Tick.",
        quizQuestions: [
          {
            id: "q001",
            question: "Какова основная цель Blueprint в Unreal Engine?",
            options: [
              "Полностью заменить движок C++",
              "Создавать игровую логику визуально без написания кода",
              "Только для создания меню интерфейса",
              "Оптимизировать производительность рендеринга",
            ],
            correctIndex: 1,
            explanation:
              "Blueprint — визуальная система скриптинга, позволяющая создавать игровую логику соединением узлов без написания кода на C++.",
          },
          {
            id: "q002",
            question: "Что соединяет узлы в Blueprint-графе?",
            options: ["Кабели", "Провода", "Мосты", "Каналы"],
            correctIndex: 1,
            explanation:
              "Провода — линии, соединяющие пины между узлами, создавая поток логики в Blueprint.",
          },
          {
            id: "q003",
            question: "Как Blueprint выполняет код?",
            options: [
              "Сверху вниз, как обычный скрипт",
              "Только при нажатии кнопки воспроизведения",
              "В ответ на события, такие как BeginPlay или OnHit",
              "Непрерывно в фоновом потоке",
            ],
            correctIndex: 2,
            explanation:
              "Blueprint использует событийно-ориентированное программирование — логика запускается событиями, а не выполняется последовательно.",
          },
        ],
        buildChallenge: {
          instruction:
            "Соедините событие BeginPlay с узлом Print String, чтобы при старте игры выводилось сообщение в лог.",
          hint:
            "Нажмите на выходной пин Exec события BeginPlay, затем на входной пин Exec узла Print String.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
              x: 20,
              y: 80,
            },
            {
              id: "n2",
              title: "Print String",
              nodeType: "function",
              inputs: [
                { id: "exec_in", label: "Exec", type: "exec" },
                { id: "str_in", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
              x: 220,
              y: 60,
            },
          ],
          solution: [
            {
              fromNodeId: "n1",
              fromPinId: "exec_out",
              toNodeId: "n2",
              toPinId: "exec_in",
            },
          ],
        },
      },
      {
        id: "les_002",
        moduleId: "mod_intro",
        title: "Типы Blueprint",
        description: "Изучите разные типы Blueprint и когда их использовать",
        content:
          "В Unreal Engine 5 существует несколько типов Blueprint, каждый для определённых задач:\n\n**Blueprint Actor:**\nСамый распространённый тип. Это объект, который можно разместить на уровне. Имеет компоненты (меш, коллизия), трансформацию (позиция, поворот, масштаб) и Event Graph.\n\n**Blueprint Actor Component:**\nПереиспользуемые модули поведения, которые добавляются к Actor-ам. Например, компонент здоровья, компонент инвентаря.\n\n**Blueprint Function Library:**\nСтатические функции без состояния — утилиты, доступные из любого Blueprint. Идеальны для математических функций, форматирования строк.\n\n**Blueprint Interface:**\nОпределяет набор функций без реализации. Actor-ы «реализуют» интерфейс — позволяет общаться между объектами разных типов.\n\n**Blueprint Macro Library:**\nМногократно используемые группы узлов. Как функции, но раскрываются inline при компиляции.\n\n**Анатомия Blueprint:**\n• Event Graph — основной граф логики\n• Functions — переиспользуемые функции\n• Variables — хранение данных\n• Components — иерархия компонентов",
        xpReward: 120,
        estimatedMinutes: 10,
        tags: ["типы", "actor", "компоненты"],
        realWorldExample:
          "В шутере оружие — Blueprint Actor, система здоровья — Actor Component, утилиты урона — Function Library, а враги и игрок общаются через Blueprint Interface.",
        practiceTask:
          "Создайте Blueprint Actor с StaticMesh-компонентом. Добавьте переменную float «Health» со значением 100. Изучите панель компонентов.",
        quizQuestions: [
          {
            id: "q004",
            question: "Какой тип Blueprint лучше всего подходит для создания объектов, размещаемых на уровне?",
            options: [
              "Blueprint Function Library",
              "Blueprint Interface",
              "Blueprint Actor",
              "Blueprint Macro Library",
            ],
            correctIndex: 2,
            explanation:
              "Blueprint Actor — это объект, который можно разместить на уровне. Он имеет трансформацию и компоненты.",
          },
          {
            id: "q005",
            question: "Что такое Blueprint Interface?",
            options: [
              "Визуальный редактор для создания UI",
              "Набор функций без реализации для коммуникации между объектами",
              "Тип переменной для хранения ссылок на объекты",
              "Оптимизированная версия Blueprint Actor",
            ],
            correctIndex: 1,
            explanation:
              "Blueprint Interface определяет функции без реализации. Actor-ы реализуют интерфейс для коммуникации между разными типами объектов.",
          },
          {
            id: "q006",
            question: "Где хранится основная игровая логика Blueprint Actor?",
            options: ["В панели деталей", "В Event Graph", "В менеджере контента", "В файле конфигурации"],
            correctIndex: 1,
            explanation: "Event Graph — основное рабочее пространство Blueprint Actor, где создаётся игровая логика через соединение узлов.",
          },
        ],
        buildChallenge: {
          instruction:
            "Создайте логику инициализации: соедините BeginPlay → Set Health (переменная) → Print String. Значение переменной должно быть передано в Print String.",
          hint:
            "Сначала соедините BeginPlay с Set Health, затем Set Health с Print String. Переменная Health передаёт своё значение в строку.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 40,
            },
            {
              id: "n2",
              title: "Set Health",
              subtitle: "Variable",
              nodeType: "variable",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "val", label: "Health", type: "float" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 190,
              y: 20,
            },
            {
              id: "n3",
              title: "Print String",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 370,
              y: 40,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_101",
        moduleId: "mod_intro",
        title: "Construction Script",
        description: "Используйте Construction Script для настройки Actor-а в редакторе",
        content:
          "Construction Script — специальный граф Blueprint, который выполняется при каждом изменении Actor-а в редакторе. Это мощный инструмент для процедурной генерации и визуальной настройки.\n\n**Когда срабатывает Construction Script:**\n• При размещении Actor-а на уровне\n• При изменении значений Instance Editable переменных\n• При перемещении/масштабировании/повороте в редакторе\n• НЕ срабатывает в runtime (только в редакторе)\n\n**Применения Construction Script:**\n• Процедурное расположение компонентов\n• Генерация меша по параметрам (столб из N сегментов)\n• Предварительный просмотр изменений без запуска игры\n• Задание материалов по переменной\n\n**Пример — забор из досок:**\n```\nConstruction Script:\n  For Loop (0 to NumPlanks-1)\n    Add Static Mesh Component\n    Set Relative Location (i * PlankWidth, 0, 0)\n```\n\n**Важно:**\nConstruction Script НЕ заменяет BeginPlay. Используйте его только для редакторной настройки. Не размещайте в нём игровую логику.",
        xpReward: 130,
        estimatedMinutes: 10,
        tags: ["construction script", "редактор", "процедурный"],
        realWorldExample:
          "Уличный фонарь: переменная NumLights (Integer, Instance Editable). Construction Script создаёт N точечных источников света по кругу. Меняете значение в редакторе — видите результат мгновенно.",
        practiceTask:
          "Создайте Blueprint со столбиком из кубов. Добавьте переменную Height (Integer, по умолчанию 3, Instance Editable). Construction Script: For Loop → добавляет Static Mesh Box на высоту i * 100 Units.",
        quizQuestions: [
          {
            id: "q043",
            question: "Когда выполняется Construction Script?",
            options: [
              "При старте игры (BeginPlay)",
              "Каждый кадр (как Tick)",
              "При изменении Actor-а в редакторе",
              "При уничтожении Actor-а",
            ],
            correctIndex: 2,
            explanation:
              "Construction Script выполняется в редакторе при размещении и изменении Actor-а. В runtime он не работает.",
          },
          {
            id: "q044",
            question: "Что НЕЛЬЗЯ делать в Construction Script?",
            options: [
              "Добавлять компоненты процедурно",
              "Задавать материал меша",
              "Размещать игровую логику, зависящую от runtime",
              "Использовать переменные Actor-а",
            ],
            correctIndex: 2,
            explanation:
              "Construction Script работает только в редакторе. Игровая логика (урон, движение) должна быть в BeginPlay/Tick.",
          },
          {
            id: "q045",
            question: "Что нужно сделать с переменной, чтобы Construction Script реагировал на её изменение в редакторе?",
            options: [
              "Объявить её как Private",
              "Включить Instance Editable",
              "Добавить её в массив",
              "Создать для неё Getter-функцию",
            ],
            correctIndex: 1,
            explanation:
              "Instance Editable позволяет изменять переменную в панели Details. При каждом изменении Construction Script пересчитывается.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте процедурную настройку: Construction Script → For Loop (0 to Count) → Add Static Mesh Component → Set Relative Location (смещение по X).",
          hint: "For Loop даёт индекс i. Умножьте i на шаг расстояния (например 150) и передайте в Set Relative Location.",
          nodes: [
            {
              id: "n1",
              title: "Construction Script",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "For Loop",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "last", label: "Last Index", type: "integer" },
              ],
              outputs: [
                { id: "body", label: "Loop Body", type: "exec" },
                { id: "index", label: "Index", type: "integer" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Add Static Mesh",
              nodeType: "function",
              inputs: [{ id: "exec", label: "Exec", type: "exec" }],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "comp", label: "Component", type: "object" },
              ],
              x: 360,
              y: 35,
            },
            {
              id: "n4",
              title: "Set Relative Location",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "target", label: "Target", type: "object" },
                { id: "loc", label: "New Location", type: "vector" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 540,
              y: 55,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "body", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "exec", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "comp", toNodeId: "n4", toPinId: "target" },
          ],
        },
      },
      {
        id: "les_102",
        moduleId: "mod_intro",
        title: "Class Defaults и настройки",
        description: "Управление настройками Blueprint Actor через Class Defaults",
        content:
          "Class Defaults — настройки, применяемые ко всем экземплярам Blueprint. Это «шаблон» вашего Actor-а.\n\n**Доступ к Class Defaults:**\nВ редакторе Blueprint → кнопка «Class Defaults» в тулбаре\n\n**Что настраивается:**\n• Значения переменных по умолчанию\n• Физика: Simulate Physics, Mass, Gravity Scale\n• Коллизия: Collision Profile, Generate Hit Events\n• Rendering: Visible, Hidden in Game, Cast Shadow\n• Replication: Replicates, Net Update Frequency\n• AI: Auto Possess AI, Run Constructor in Editor\n\n**Instance Editable vs Class Default:**\n• Class Default = значение для всех экземпляров\n• Instance Editable = можно переопределить для конкретного объекта на уровне\n\n**Категории (Categories):**\nПеременные можно группировать по категориям:\nВыберите переменную → в Details задайте Category.\nПомогает организовать панель Details при Instance Editable.\n\n**Хорошая практика:**\nВсегда задавайте разумные значения по умолчанию. Имена переменных в CamelCase. Добавляйте Tooltip для Instance Editable переменных — будет видно при наведении в редакторе.",
        xpReward: 110,
        estimatedMinutes: 8,
        tags: ["class defaults", "настройки", "экземпляр"],
        realWorldExample:
          "BP_Barrel: Class Default MaxHealth=50, Explosive=true. На уровне: один бочонок — MaxHealth=100 (Instance Override), другой — стандартный. Гибкая настройка без создания нового класса.",
        practiceTask:
          "Откройте Class Defaults своего Blueprint. Задайте значения по умолчанию для переменных Health=100, IsEnemy=false. Добавьте Tooltip 'Начальное здоровье'. Измените Collision Profile на BlockAll.",
        quizQuestions: [
          {
            id: "q046",
            question: "Что такое Class Defaults в Blueprint?",
            options: [
              "Значения, применяемые только к первому экземпляру",
              "Настройки-шаблоны для всех экземпляров этого Blueprint",
              "Настройки компилятора Blueprint",
              "Список всех используемых нод",
            ],
            correctIndex: 1,
            explanation:
              "Class Defaults задают начальные значения переменных и физических настроек для каждого нового экземпляра Blueprint.",
          },
          {
            id: "q047",
            question: "Как сгруппировать переменные в панели Details?",
            options: [
              "Создать отдельный Blueprint для каждой группы",
              "Задать Category в настройках переменной",
              "Переименовать переменную с префиксом группы",
              "Использовать массив переменных",
            ],
            correctIndex: 1,
            explanation:
              "Поле Category в настройках переменной группирует её в панели Details — удобно при большом числе Instance Editable параметров.",
          },
          {
            id: "q048",
            question: "Что происходит при изменении Class Default после размещения объектов на уровне?",
            options: [
              "Изменение применяется только к новым экземплярам",
              "Все экземпляры, у которых нет Instance Override, обновляются",
              "Все экземпляры немедленно обновляются без исключений",
              "Нужно пересобрать уровень вручную",
            ],
            correctIndex: 1,
            explanation:
              "Экземпляры с Instance Override сохраняют своё значение. Остальные унаследуют новое Class Default.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте чтение настроек: BeginPlay → Get MaxHealth (Class Default Float) → Get IsEnemy (Bool) → Branch → [True] Print 'Враг' / [False] Print 'Союзник'.",
          hint: "Get переменные-пины подключаются к Branch. MaxHealth выводится через отдельный Print String.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 100,
            },
            {
              id: "n2",
              title: "Get IsEnemy",
              subtitle: "Bool Variable",
              nodeType: "variable",
              inputs: [],
              outputs: [{ id: "val", label: "IsEnemy", type: "bool" }],
              x: 10,
              y: 190,
            },
            {
              id: "n3",
              title: "Branch",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 195,
              y: 70,
            },
            {
              id: "n4",
              title: "Print 'Враг'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 375,
              y: 40,
            },
            {
              id: "n5",
              title: "Print 'Союзник'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 375,
              y: 150,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "val", toNodeId: "n3", toPinId: "cond" },
            { fromNodeId: "n3", fromPinId: "true", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "false", toNodeId: "n5", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_103",
        moduleId: "mod_intro",
        title: "Компиляция и отладка Blueprint",
        description: "Как компилировать Blueprint и находить ошибки",
        content:
          "Компиляция Blueprint — обязательный шаг перед запуском. Редактор проверяет корректность графа и генерирует байткод.\n\n**Кнопка Compile:**\n• Зелёная галочка — Blueprint скомпилирован успешно\n• Жёлтый треугольник — есть предупреждения (работает, но есть проблемы)\n• Красный крест — ошибки компиляции (не запустится)\n\n**Частые ошибки:**\n• «Pin X is not connected» — не подключён обязательный пин\n• «Circular dependency» — Blueprint ссылается сам на себя\n• «Return node not connected» — функция с Output не возвращает значение\n\n**Инструменты отладки:**\n• Print String — быстрый вывод значений в runtime\n• Breakpoints (F9 на узле) — пауза выполнения на этом узле в редакторе PIE\n• Watch Values — правый клик на пин → Watch — видите значение в реальном времени\n• Blueprint Debugger (Window → Debug) — пошаговое выполнение\n\n**Отладочные режимы:**\n• PIE (Play In Editor) — запуск в редакторе, поддерживает breakpoints\n• Simulate — симуляция физики без игрока\n• Standalone — отдельное окно, ближе к реальной игре\n\n**Совет:**\nИспользуйте Comment Box (C) для группировки и документирования участков графа. Это особенно важно в больших Blueprint.",
        xpReward: 120,
        estimatedMinutes: 9,
        tags: ["компиляция", "отладка", "breakpoint"],
        realWorldExample:
          "При разработке паузы в игре: breakpoint на Set Game Paused → смотрите, что значение bPaused правильно устанавливается. Watch на переменной Health — видите изменения в реальном времени при получении урона.",
        practiceTask:
          "Намеренно сломайте Blueprint: уберите соединение с обязательного пина. Скомпилируйте и прочитайте ошибку. Исправьте. Добавьте Breakpoint и запустите PIE — остановитесь на точке останова.",
        quizQuestions: [
          {
            id: "q049",
            question: "Что означает жёлтый треугольник на кнопке Compile?",
            options: [
              "Blueprint не скомпилирован",
              "Есть предупреждения, но Blueprint запустится",
              "Критическая ошибка — Blueprint не работает",
              "Blueprint оптимально скомпилирован",
            ],
            correctIndex: 1,
            explanation:
              "Жёлтый треугольник — предупреждение. Blueprint работает, но есть потенциальные проблемы, требующие внимания.",
          },
          {
            id: "q050",
            question: "Как поставить точку останова (Breakpoint) на узел Blueprint?",
            options: [
              "Двойной клик на узел",
              "Нажать F9 на выбранном узле",
              "Правый клик → Add Breakpoint",
              "F9 или Правый клик → Add Breakpoint",
            ],
            correctIndex: 3,
            explanation:
              "Breakpoint можно поставить клавишей F9 или через контекстное меню → Add Breakpoint. Красная точка появится на узле.",
          },
          {
            id: "q051",
            question: "Что такое Watch Value в Blueprint?",
            options: [
              "Анимация просмотра значения переменной",
              "Отображение значения пина в реальном времени во время PIE",
              "Функция для наблюдения за Actor-ом",
              "Таймер, отображающий время выполнения узла",
            ],
            correctIndex: 1,
            explanation:
              "Watch (Правый клик на пин → Watch) отображает текущее значение пина во время PIE прямо в редакторе Blueprint.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте цепочку с выводом отладки: BeginPlay → Print String 'Старт' → Delay 1s → Print String 'После задержки'. Убедитесь, что компиляция без ошибок.",
          hint: "Все Exec-пины должны быть связаны. Print String принимает Exec и In String. Delay имеет Exec и Completed выходы.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Print String",
              subtitle: "'Старт'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 190,
              y: 55,
            },
            {
              id: "n3",
              title: "Delay",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "dur", label: "Duration", type: "float" },
              ],
              outputs: [{ id: "completed", label: "Completed", type: "exec" }],
              x: 360,
              y: 55,
            },
            {
              id: "n4",
              title: "Print String",
              subtitle: "'После задержки'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 530,
              y: 55,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "completed", toNodeId: "n4", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_104",
        moduleId: "mod_intro",
        title: "Blueprint и компоненты",
        description: "Добавление и настройка компонентов внутри Blueprint Actor",
        content:
          "Компоненты — строительные блоки Blueprint Actor. Каждый компонент отвечает за отдельный аспект поведения.\n\n**Панель Components:**\nОткрывается автоматически в редакторе Blueprint. Иерархия компонентов — дерево, где Root Component — базовый.\n\n**Основные компоненты:**\n• Scene Component — точка в 3D-пространстве, основа для других\n• Static Mesh — 3D-модель без анимации\n• Skeletal Mesh — 3D-модель с анимацией\n• Box/Sphere/Capsule Collision — области коллизии\n• Point/Spot/Directional Light — источники света\n• Audio Component — воспроизведение звука\n• Particle System — система частиц\n• Camera — камера, прикреплённая к Actor-у\n• Spring Arm — «пружинный рычаг» для камеры от третьего лица\n\n**Доступ к компонентам в графе:**\nПеретащите компонент из панели Components в граф — получите ссылку. Затем вызывайте его функции.\n\n**Динамическое добавление:**\nAdd [Component Type] Component — добавляет компонент в runtime. Полезно для спавна эффектов.",
        xpReward: 140,
        estimatedMinutes: 11,
        tags: ["компоненты", "mesh", "коллизия"],
        realWorldExample:
          "BP_Character: Capsule Collision (корень) → Skeletal Mesh (тело) → Spring Arm → Camera. Отдельно: Audio Component (шаги), Particle System (аура).",
        practiceTask:
          "Создайте Blueprint Actor с иерархией: Scene Component → Static Mesh → Point Light. В BeginPlay получите ссылку на Point Light и вызовите Set Intensity(5000). Проверьте в PIE.",
        quizQuestions: [
          {
            id: "q052",
            question: "Что является корневым компонентом в Blueprint Actor по умолчанию?",
            options: ["Static Mesh Component", "Scene Component (Default Scene Root)", "Capsule Collision", "Camera"],
            correctIndex: 1,
            explanation:
              "По умолчанию корневой компонент — Default Scene Root (Scene Component). Он задаёт трансформацию Actor-а.",
          },
          {
            id: "q053",
            question: "Как получить ссылку на компонент Blueprint в Event Graph?",
            options: [
              "Get Component By Class",
              "Перетащить компонент из панели Components в граф",
              "Создать переменную типа компонента",
              "Cast To Component",
            ],
            correctIndex: 1,
            explanation:
              "Перетаскивание компонента из панели Components в Event Graph создаёт узел Get, возвращающий ссылку на этот компонент.",
          },
          {
            id: "q054",
            question: "Какой компонент используется для плавного следования камеры за игроком?",
            options: ["Camera Component", "Scene Component", "Spring Arm Component", "Movement Component"],
            correctIndex: 2,
            explanation:
              "Spring Arm (Camera Boom) прикрепляет камеру на расстоянии и автоматически корректирует её позицию при столкновениях.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте включение света: BeginPlay → Get PointLight (компонент) → Set Intensity (5000) → Set Light Color (красный).",
          hint: "Перетащите PointLight из Components в граф → получите ссылку. Вызовите Set Intensity и Set Light Color поочерёдно.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Get Point Light",
              subtitle: "Component Ref",
              nodeType: "variable",
              inputs: [],
              outputs: [{ id: "comp", label: "Point Light", type: "object" }],
              x: 10,
              y: 185,
            },
            {
              id: "n3",
              title: "Set Intensity",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "target", label: "Target", type: "object" },
                { id: "val", label: "New Intensity", type: "float" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 195,
              y: 55,
            },
            {
              id: "n4",
              title: "Set Light Color",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "target", label: "Target", type: "object" },
                { id: "color", label: "New Light Color", type: "vector" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 375,
              y: 55,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "comp", toNodeId: "n3", toPinId: "target" },
            { fromNodeId: "n3", fromPinId: "exec", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "comp", toNodeId: "n4", toPinId: "target" },
          ],
        },
      },
      {
        id: "les_105",
        moduleId: "mod_intro",
        title: "Спавн и уничтожение Actor-ов",
        description: "Создание и удаление объектов в runtime через Blueprint",
        content:
          "Спавн и уничтожение Actor-ов — ключевые операции в любой игре. Пули, враги, эффекты — всё это спавнится и уничтожается динамически.\n\n**Spawn Actor from Class:**\n```\nSpawnActor:\n  • Class — тип Blueprint для спавна\n  • Transform — позиция/поворот/масштаб\n  • Collision Handling — что делать при коллизии в месте спавна\n  → Return Value — ссылка на созданный Actor\n```\n\n**Destroy Actor:**\nPrint String 'Умер' → Delay(2) → Destroy Actor\n\n**Spawn с задержкой через Timers:**\nSet Timer by Function Name → SpawnEnemy() каждые 5 секунд.\n\n**Defer Spawn (SpawnActorDeferred):**\nСоздаёт Actor, позволяет настроить переменные ДО BeginPlay:\n1. Spawn Actor Deferred → получаете ссылку\n2. Настраиваете переменные\n3. Finish Spawning Actor → запускается BeginPlay\n\n**Object Pooling:**\nВместо постоянного спавна/уничтожения — держите пул скрытых объектов. Activate/Deactivate вместо Spawn/Destroy. Критично для производительности.\n\n**Важно:**\n• Всегда проверяйте Is Valid перед работой со ссылкой на Actor — он мог быть уничтожен.\n• Используйте bDestroyWhenFinished у Particle System для авто-уничтожения.",
        xpReward: 150,
        estimatedMinutes: 12,
        tags: ["спавн", "destroy", "lifecycle"],
        realWorldExample:
          "Шутер: SpawnActor BP_Bullet из дула пушки с поворотом камеры. Пуля летит, при Hit → Spawn эффект попадания → Destroy Actor пули.",
        practiceTask:
          "Создайте BP_Spawner. В BeginPlay вызовите Spawn Actor (BP_Cube) в случайной позиции. Через 5 секунд (Delay) — Destroy Actor. Проверьте в PIE, что куб появляется и исчезает.",
        quizQuestions: [
          {
            id: "q055",
            question: "Зачем нужен Spawn Actor Deferred?",
            options: [
              "Для спавна Actor-а с задержкой по времени",
              "Чтобы задать переменные Actor-а до его BeginPlay",
              "Для оптимизации спавна нескольких Actor-ов",
              "Для спавна Actor-а в другом уровне",
            ],
            correctIndex: 1,
            explanation:
              "Deferred spawn позволяет настроить переменные нового Actor-а до того, как запустится его BeginPlay. Это важно, когда инициализация зависит от внешних данных.",
          },
          {
            id: "q056",
            question: "Почему перед использованием сохранённой ссылки на Actor нужно вызвать Is Valid?",
            options: [
              "Is Valid нужен только для UI-элементов",
              "Actor мог быть уничтожен, и ссылка стала невалидной",
              "Is Valid конвертирует тип ссылки",
              "Без Is Valid Actor не будет отображаться",
            ],
            correctIndex: 1,
            explanation:
              "Если Actor был уничтожен (Destroy Actor), ссылка на него стала невалидной. Обращение к ней вызовет крэш. Is Valid проверяет это.",
          },
          {
            id: "q057",
            question: "В чём преимущество Object Pooling перед постоянным Spawn/Destroy?",
            options: [
              "Объекты пула не требуют Blueprint",
              "Устраняет накладные расходы на создание/уничтожение объектов — важно для пуль, частиц",
              "Object Pool автоматически создаётся в UE5",
              "Pooling работает только для Static Mesh",
            ],
            correctIndex: 1,
            explanation:
              "Spawn/Destroy — дорогие операции. Пул переиспользует объекты: скрывает и снова показывает вместо создания и удаления.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте систему спавна: BeginPlay → Spawn Actor (BP_Enemy, Transform) → сохранить в переменную EnemyRef → Delay 5s → Destroy Actor (EnemyRef).",
          hint: "Spawn Actor возвращает ссылку. Сохраните её через Set EnemyRef. После Delay используйте Get EnemyRef → Destroy Actor.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Spawn Actor",
              subtitle: "from Class",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "transform", label: "Spawn Transform", type: "vector" },
              ],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "actor", label: "Return Value", type: "object" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Delay",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "dur", label: "Duration", type: "float" },
              ],
              outputs: [{ id: "completed", label: "Completed", type: "exec" }],
              x: 370,
              y: 55,
            },
            {
              id: "n4",
              title: "Destroy Actor",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "target", label: "Target", type: "object" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 545,
              y: 55,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "completed", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "actor", toNodeId: "n4", toPinId: "target" },
          ],
        },
      },
    ],
  },
  {
    id: "mod_nodes",
    title: "Узлы и Выполнение",
    description: "Как работают узлы, пины и поток выполнения в Blueprint",
    icon: "cpu",
    difficulty: "beginner",
    color: "#7B4FFF",
    xpRequired: 100,
    lessons: [
      {
        id: "les_003",
        moduleId: "mod_nodes",
        title: "Понимание узлов",
        description: "Анатомия узлов Blueprint и как они работают",
        content:
          "Каждый узел Blueprint имеет определённую структуру. Понимание этой структуры — ключ к построению эффективной логики.\n\n**Анатомия узла:**\n• Заголовок — название узла (что он делает)\n• Входные пины (слева) — данные или управление, поступающее в узел\n• Выходные пины (справа) — результаты или следующее действие\n• Пин Exec (белый треугольник) — управляет порядком выполнения\n\n**Типы пинов:**\n• Exec (белый) — поток выполнения, порядок операций\n• Boolean (красный) — true/false значения\n• Integer (голубой) — целые числа: 1, 42, -7\n• Float (зелёный) — числа с запятой: 3.14, -0.5\n• String (розовый) — текстовые строки\n• Object (бирюзовый) — ссылки на объекты\n• Vector (оранжевый) — координаты: X, Y, Z\n\n**Правила соединения:**\nПины совместимых типов можно соединять. UE5 автоматически конвертирует некоторые типы (int → float). Пины одного цвета обычно совместимы.",
        xpReward: 130,
        estimatedMinutes: 9,
        tags: ["узлы", "пины", "типы"],
        realWorldExample:
          "Система урона: пин Float принимает число урона, пин Object — ссылку на персонажа, Exec-пины управляют порядком: проверка брони → вычитание здоровья → проверка смерти.",
        practiceTask:
          "Создайте цепочку: BeginPlay → Delay (2 секунды) → Print String «Запуск завершён». Изучите, как Delay блокирует дальнейшее выполнение.",
        quizQuestions: [
          {
            id: "q007",
            question: "Какой цвет у пина потока выполнения (Exec) в Blueprint?",
            options: ["Красный", "Зелёный", "Белый", "Синий"],
            correctIndex: 2,
            explanation:
              "Пины Exec белого цвета — они управляют порядком выполнения узлов в Blueprint.",
          },
          {
            id: "q008",
            question: "Какой тип пина используется для значений true/false?",
            options: ["Float", "Integer", "String", "Boolean"],
            correctIndex: 3,
            explanation:
              "Пин Boolean (красный) хранит значения true или false — используется для условий и переключателей.",
          },
          {
            id: "q009",
            question: "Что произойдёт, если соединить Float-пин с Integer-пином?",
            options: [
              "Ошибка компиляции",
              "UE5 автоматически конвертирует типы",
              "Значение станет равным нулю",
              "Blueprint перестанет работать",
            ],
            correctIndex: 1,
            explanation: "UE5 автоматически вставляет узел конвертации при соединении совместимых типов.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте задержанный запуск: Event BeginPlay → Delay → Print String. Задержка должна получить значение Duration.",
          hint: "Соедините Exec BeginPlay → Exec Delay, затем Completed Delay → Exec Print String.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Delay",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "dur", label: "Duration", type: "float" },
              ],
              outputs: [{ id: "completed", label: "Completed", type: "exec" }],
              x: 190,
              y: 60,
            },
            {
              id: "n3",
              title: "Print String",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 370,
              y: 80,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "completed", toNodeId: "n3", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_004",
        moduleId: "mod_nodes",
        title: "События и Tick",
        description: "Ключевые события Blueprint и цикл обновления игры",
        content:
          "Событийно-ориентированное программирование — основа Blueprint. Вы реагируете на происходящее в игре, а не запускаете код постоянно.\n\n**Главные события:**\n• Event BeginPlay — срабатывает один раз при появлении Actor на уровне\n• Event Tick — каждый кадр (избегайте тяжёлых вычислений!)\n• Event EndPlay — при уничтожении Actor\n• Event Hit — при столкновении с объектом\n• Event Overlap Begin/End — при перекрытии с другим Actor\n\n**Событие Tick — осторожно!**\nTick срабатывает 60+ раз в секунду. Тяжёлая логика в Tick убьёт производительность.\n\n**Лучшие практики:**\n• Используйте Tick только для плавных анимаций/движений\n• Для периодических действий — Timers вместо Tick\n• Для условных реакций — Events вместо постоянной проверки в Tick\n• Отключайте Tick у Actor-ов, которым он не нужен (Start with Tick Enabled = false)\n\n**Пользовательские события:**\nВы можете создавать собственные события через ПКМ → Add Custom Event. Их можно вызывать из других Blueprint через «Call Event».",
        xpReward: 110,
        estimatedMinutes: 11,
        tags: ["события", "tick", "производительность"],
        realWorldExample:
          "Вращающаяся платформа использует Tick для плавного вращения. Дверь открывается по событию Overlap. Таймер перезарядки — через Set Timer by Function Name.",
        practiceTask:
          "Добавьте Event Tick и выведите сообщение. Затем замените его на Set Timer by Function Name с интервалом 2 секунды. Сравните частоту вызовов в Output Log.",
        quizQuestions: [
          {
            id: "q010",
            question: "Как часто срабатывает Event Tick?",
            options: ["Раз в секунду", "Каждый кадр", "Только при нажатии клавиши", "При столкновении с объектом"],
            correctIndex: 1,
            explanation: "Event Tick срабатывает каждый кадр — обычно 30-120 раз в секунду.",
          },
          {
            id: "q011",
            question: "Что лучше использовать для периодических действий вместо Tick?",
            options: ["Event BeginPlay", "Set Timer by Function Name", "Event Hit", "Event EndPlay"],
            correctIndex: 1,
            explanation:
              "Set Timer позволяет выполнять функции через заданные интервалы, не нагружая каждый кадр.",
          },
          {
            id: "q012",
            question: "Когда срабатывает Event BeginPlay?",
            options: [
              "Каждый кадр",
              "При столкновении",
              "Один раз при появлении Actor на уровне",
              "При нажатии кнопки воспроизведения",
            ],
            correctIndex: 2,
            explanation: "Event BeginPlay срабатывает один раз — когда Actor появляется на уровне (начало игры или спавн).",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте систему таймера: BeginPlay → Set Timer by Event → (через 3 сек) → Print String 'Время вышло!'",
          hint: "Соедините BeginPlay с Set Timer by Event. Выход Expired таймера соедините с Print String.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Set Timer",
              subtitle: "by Event",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "time", label: "Time", type: "float" },
              ],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "expired", label: "Expired", type: "exec" },
              ],
              x: 190,
              y: 50,
            },
            {
              id: "n3",
              title: "Print String",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 380,
              y: 80,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "expired", toNodeId: "n3", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_106",
        moduleId: "mod_nodes",
        title: "Математические узлы",
        description: "Арифметика, тригонометрия и математические операции в Blueprint",
        content:
          "Blueprint предоставляет полный набор математических узлов для вычислений любой сложности.\n\n**Базовая арифметика:**\n• Float + Float, - Float, * Float, / Float\n• Integer + Integer и т.д.\n• Modulo (%) — остаток от деления (полезен для циклических индексов)\n• Abs — абсолютное значение\n• Round, Floor, Ceil — округление\n\n**Сравнения (возвращают Boolean):**\n• == (Equal), != (Not Equal)\n• > (Greater), >= (Greater Equal)\n• < (Less), <= (Less Equal)\n\n**Математика вектора:**\n• Vector + Vector, * Float\n• Vector Length — длина вектора\n• Normalize — единичный вектор\n• Dot Product — скалярное произведение (угол между векторами)\n• Cross Product — векторное произведение (перпендикуляр)\n\n**Тригонометрия:**\n• Sin, Cos, Tan — принимают градусы\n• Atan2 — угол по компонентам (поворот к цели)\n\n**Интерполяция:**\n• Lerp (Linear Interpolate) — плавный переход между двумя значениями\n• FInterp To — плавное приближение с заданной скоростью\n• VInterp To — то же для векторов\n\n**Clamp:**\nОграничивает значение диапазоном [Min, Max]. Незаменим для здоровья, скорости, opacity.",
        xpReward: 140,
        estimatedMinutes: 12,
        tags: ["математика", "вектор", "lerp"],
        realWorldExample:
          "Вращение к игроку: Find Look at Rotation (от врага к игроку) использует Atan2 внутри. Lerp для плавного изменения opacity UI при появлении. FInterp To для камеры, следующей за игроком без рывков.",
        practiceTask:
          "Создайте функцию «NormalizeHealth» — принимает CurrentHP и MaxHP (Float), возвращает значение 0.0–1.0 через деление и Clamp. Выведите результат через Print String с форматированием.",
        quizQuestions: [
          {
            id: "q058",
            question: "Какой узел возвращает плавное значение между A и B по параметру Alpha (0-1)?",
            options: ["Clamp", "Lerp", "FInterp To", "Normalize"],
            correctIndex: 1,
            explanation:
              "Lerp (Linear Interpolate) возвращает A + (B-A)*Alpha. При Alpha=0 → A, при Alpha=1 → B, при Alpha=0.5 → середина.",
          },
          {
            id: "q059",
            question: "Что возвращает Dot Product двух нормализованных векторов?",
            options: [
              "Расстояние между точками",
              "Косинус угла между векторами",
              "Перпендикулярный вектор",
              "Длину суммы векторов",
            ],
            correctIndex: 1,
            explanation:
              "Dot Product нормализованных векторов = cos(угол). 1 = параллельны, 0 = перпендикулярны, -1 = противоположны.",
          },
          {
            id: "q060",
            question: "Зачем использовать Modulo (%) при работе с индексами массива?",
            options: [
              "Для ускорения цикла",
              "Для циклического перехода индекса (например, последний элемент → первый)",
              "Для проверки четности числа",
              "Только для целых чисел",
            ],
            correctIndex: 1,
            explanation:
              "i % Length гарантирует, что индекс всегда в диапазоне [0, Length-1]. При i=Length → 0. Идеально для бесконечного перебора массива.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте нормализатор здоровья: Get CurrentHealth / Get MaxHealth → Clamp (0.0, 1.0) → передайте в Print String как процент.",
          hint: "Узел Float / Float делит CurrentHealth на MaxHealth. Результат идёт в Clamp, затем в Print String через конвертацию.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Get CurrentHealth",
              nodeType: "variable",
              inputs: [],
              outputs: [{ id: "val", label: "CurrentHealth", type: "float" }],
              x: 10,
              y: 170,
            },
            {
              id: "n3",
              title: "Float / Float",
              nodeType: "value",
              inputs: [
                { id: "a", label: "A", type: "float" },
                { id: "b", label: "B", type: "float" },
              ],
              outputs: [{ id: "result", label: "Result", type: "float" }],
              x: 185,
              y: 140,
            },
            {
              id: "n4",
              title: "Clamp (Float)",
              nodeType: "function",
              inputs: [
                { id: "val", label: "Value", type: "float" },
                { id: "min", label: "Min", type: "float" },
                { id: "max", label: "Max", type: "float" },
              ],
              outputs: [{ id: "result", label: "Return", type: "float" }],
              x: 345,
              y: 130,
            },
            {
              id: "n5",
              title: "Print String",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 500,
              y: 60,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n5", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "val", toNodeId: "n3", toPinId: "a" },
            { fromNodeId: "n3", fromPinId: "result", toNodeId: "n4", toPinId: "val" },
            { fromNodeId: "n4", fromPinId: "result", toNodeId: "n5", toPinId: "str" },
          ],
        },
      },
      {
        id: "les_107",
        moduleId: "mod_nodes",
        title: "Узлы работы со строками",
        description: "Форматирование, разбор и манипуляция строками в Blueprint",
        content:
          "Строки в Blueprint используются для отладки, UI и сохранения данных. Освойте основные операции.\n\n**Создание строк:**\n• String Literal — жёстко заданная строка в узле\n• Make Literal String — в графе\n\n**Конкатенация:**\nAppend: соединяет строки. «Здоровье: » + ToString(HP) → «Здоровье: 95»\n\n**Конвертация:**\n• ToString (Integer/Float/Boolean/Vector) → String\n• String To Integer, String To Float — парсинг\n\n**Format Text:**\nМощный узел для шаблонов:\n«{Name} получил {Damage} урона!» → автоматически заменяет {поля}\n\n**Полезные строковые функции:**\n• String Length — количество символов\n• Contains — есть ли подстрока\n• Find Substring — позиция подстроки\n• Mid — извлечь подстроку\n• Left / Right — первые/последние N символов\n• To Upper / To Lower — регистр\n• Trim — удалить пробелы по краям\n• Replace — замена подстроки\n• Split — разбить по разделителю\n• Is Empty — пустая ли строка\n\n**Name vs String:**\nName — неизменяемый идентификатор, быстрое сравнение. String — изменяемый текст. Используйте Name для ID, String для отображения.",
        xpReward: 120,
        estimatedMinutes: 10,
        tags: ["строки", "текст", "форматирование"],
        realWorldExample:
          "HUD: Format Text «{Player} — Уровень {Level} — {XP} / {MaxXP} XP» с подстановкой переменных. Имена предметов хранятся как Name для быстрого поиска в Map.",
        practiceTask:
          "Создайте строку приветствия: Append «Привет, » + PlayerName + «! Ваше здоровье: » + ToString(Health). Выведите через Print String. Затем замените через Format Text.",
        quizQuestions: [
          {
            id: "q061",
            question: "В чём отличие Name от String в Blueprint?",
            options: [
              "Name хранит числа, String — текст",
              "Name — неизменяемый идентификатор с быстрым сравнением, String — изменяемый текст",
              "Name работает только в редакторе",
              "String не поддерживает Unicode",
            ],
            correctIndex: 1,
            explanation:
              "Name — interned идентификатор. Сравнение Name быстрее String. Используйте Name для ID, String для отображаемого текста.",
          },
          {
            id: "q062",
            question: "Какой узел позволяет использовать шаблоны вида «{Name} получил {Damage} урона»?",
            options: ["Append", "Format Text", "String Format", "Concatenate"],
            correctIndex: 1,
            explanation:
              "Format Text принимает шаблон с именованными полями {Поле} и автоматически генерирует входные пины для каждого поля.",
          },
          {
            id: "q063",
            question: "Что делает узел Append в Blueprint?",
            options: [
              "Добавляет элемент в массив",
              "Соединяет две или более строк в одну",
              "Добавляет компонент к Actor-у",
              "Прикрепляет Actor к другому Actor-у",
            ],
            correctIndex: 1,
            explanation:
              "Append конкатенирует строки. Можно добавить любое число входных строк через пин Add Pin.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте вывод статистики: BeginPlay → Format Text «Игрок: {Name} | HP: {Health}» → Print String с результатом.",
          hint: "Format Text создаёт входные пины для каждого {Поля}. Подключите переменную PlayerName к пину Name, Get Health к пину Health.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Get PlayerName",
              nodeType: "variable",
              inputs: [],
              outputs: [{ id: "val", label: "PlayerName", type: "string" }],
              x: 10,
              y: 180,
            },
            {
              id: "n3",
              title: "Format Text",
              subtitle: "'{Name} | HP: {Health}'",
              nodeType: "function",
              inputs: [
                { id: "name", label: "Name", type: "string" },
                { id: "health", label: "Health", type: "string" },
              ],
              outputs: [{ id: "result", label: "Result", type: "string" }],
              x: 190,
              y: 120,
            },
            {
              id: "n4",
              title: "Print String",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 370,
              y: 60,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "val", toNodeId: "n3", toPinId: "name" },
            { fromNodeId: "n3", fromPinId: "result", toNodeId: "n4", toPinId: "str" },
          ],
        },
      },
      {
        id: "les_108",
        moduleId: "mod_nodes",
        title: "Узлы трансформации и движения",
        description: "Set/Get Location, Rotation, Scale и перемещение Actor-ов",
        content:
          "Управление положением объектов в пространстве — одна из самых частых задач в Blueprint.\n\n**Трансформация Actor-а:**\n• Get Actor Location → возвращает Vector (X,Y,Z)\n• Set Actor Location → перемещает Actor\n• Get Actor Rotation → возвращает Rotator (Pitch, Yaw, Roll)\n• Set Actor Rotation → поворачивает\n• Get Actor Scale → возвращает Vector масштаба\n• Set Actor Scale3D → изменяет масштаб\n\n**World vs Relative:**\nWorld — абсолютная позиция в мире. Relative — относительно родительского компонента.\n\n**Методы перемещения:**\n• Set Actor Location — мгновенное телепортирование\n• Add Actor World Offset — добавляет смещение\n• Add Actor World Rotation — добавляет поворот\n• Set Actor Transform — устанавливает всё сразу (Position + Rotation + Scale)\n\n**Make/Break Transform:**\n• Make Transform — создаёт Transform из Location + Rotation + Scale\n• Break Transform — разбивает Transform на компоненты\n\n**Sweep (коллизия при перемещении):**\nSet Actor Location с bSweep=true — объект не проходит сквозь стены при перемещении.\n\n**Расстояние между объектами:**\nGet Distance To — расстояние от этого Actor-а до другого.",
        xpReward: 150,
        estimatedMinutes: 13,
        tags: ["трансформация", "движение", "позиция"],
        realWorldExample:
          "Лифт: в Tick → Add Actor World Offset (0, 0, Speed * DeltaTime). При достижении верхней точки (Get Z > MaxHeight) → разворот (Speed = -Speed). Sweep=true не позволяет проваливаться сквозь пол.",
        practiceTask:
          "Создайте Blueprint вращающейся платформы. В Tick: Add Actor World Rotation (Pitch=0, Yaw=RotSpeed*DeltaTime, Roll=0). Сделайте RotSpeed Instance Editable. Проверьте в PIE.",
        quizQuestions: [
          {
            id: "q064",
            question: "В чём разница между Set Actor Location и Add Actor World Offset?",
            options: [
              "Set Location работает только в редакторе",
              "Set Location телепортирует в точку, Add Offset добавляет смещение к текущей позиции",
              "Add Offset работает только с физическими объектами",
              "Они идентичны по результату",
            ],
            correctIndex: 1,
            explanation:
              "Set Actor Location устанавливает конкретную позицию. Add Actor World Offset прибавляет вектор к текущей позиции — удобно для движения.",
          },
          {
            id: "q065",
            question: "Что такое параметр bSweep в Set Actor Location?",
            options: [
              "Флаг для интерполяции позиции",
              "При true — объект проверяет коллизии при перемещении, не проходя сквозь стены",
              "Флаг для обновления физики",
              "Параметр для анимации перемещения",
            ],
            correctIndex: 1,
            explanation:
              "bSweep=true включает коллизию при перемещении — объект остановится при столкновении, как при физическом движении.",
          },
          {
            id: "q066",
            question: "Что возвращает Make Transform?",
            options: [
              "Только позицию объекта",
              "Структуру Transform (Position + Rotation + Scale) из отдельных компонентов",
              "Матрицу трансформации",
              "Ссылку на Actor",
            ],
            correctIndex: 1,
            explanation:
              "Make Transform принимает Location (Vector), Rotation (Rotator) и Scale (Vector) и возвращает структуру Transform для использования в Spawn Actor и других узлах.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте орбитальное движение: Event Tick → Get Actor Location → Add Offset (Sin(Time)*Radius, Cos(Time)*Radius, 0) → Set Actor Location.",
          hint: "Get World Delta Seconds для плавности. Умножайте Sin/Cos на Radius. Обновляйте накопленный Time через Add + Set каждый Tick.",
          nodes: [
            {
              id: "n1",
              title: "Event Tick",
              nodeType: "event",
              inputs: [],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "delta", label: "Delta Seconds", type: "float" },
              ],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Add Actor World Offset",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "delta", label: "Delta Location", type: "vector" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 390,
              y: 55,
            },
            {
              id: "n3",
              title: "Make Vector",
              nodeType: "function",
              inputs: [
                { id: "x", label: "X", type: "float" },
                { id: "y", label: "Y", type: "float" },
                { id: "z", label: "Z", type: "float" },
              ],
              outputs: [{ id: "vec", label: "Return Value", type: "vector" }],
              x: 210,
              y: 120,
            },
            {
              id: "n4",
              title: "Float * Float",
              subtitle: "Speed * Delta",
              nodeType: "value",
              inputs: [
                { id: "a", label: "A", type: "float" },
                { id: "b", label: "B", type: "float" },
              ],
              outputs: [{ id: "result", label: "Result", type: "float" }],
              x: 185,
              y: 210,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n1", fromPinId: "delta", toNodeId: "n4", toPinId: "b" },
            { fromNodeId: "n4", fromPinId: "result", toNodeId: "n3", toPinId: "x" },
            { fromNodeId: "n3", fromPinId: "vec", toNodeId: "n2", toPinId: "delta" },
          ],
        },
      },
      {
        id: "les_109",
        moduleId: "mod_nodes",
        title: "Timeline — анимации и кривые",
        description: "Создание плавных анимаций через Timeline в Blueprint",
        content:
          "Timeline — встроенный инструмент Blueprint для создания покадровых анимаций без AnimBlueprint.\n\n**Создание Timeline:**\nПКМ в граф → Add Timeline. Двойной клик → откроется редактор кривых.\n\n**Типы треков:**\n• Float Track — анимация числовых значений (position, opacity, scale)\n• Vector Track — анимация векторов (3D-позиция, цвет RGB)\n• Color Track — цвет (RGBA)\n• Event Track — запуск события в конкретный момент времени\n\n**Пины Timeline:**\n• Play — запустить с начала\n• Play from Start — принудительно с начала\n• Stop — остановить\n• Reverse — проиграть в обратном порядке\n• Reverse from End — задом наперёд с конца\n• Set New Time — прыгнуть к нужному моменту\n• Update — срабатывает каждый кадр во время воспроизведения\n• Finished — срабатывает по завершении\n• Direction — текущее направление (Forward/Backward)\n\n**Практика — открывающаяся дверь:**\n1. Timeline с Float Track: 0→1 за 0.5 сек\n2. Update → Lerp (Rotator): 0° → 90°\n3. Play при Overlap Begin, Reverse при End\n\n**Looping:**\nВключите Loop в Timeline — анимация повторяется бесконечно.",
        xpReward: 170,
        estimatedMinutes: 15,
        tags: ["timeline", "анимация", "кривые"],
        realWorldExample:
          "Плавно открывающийся сундук: Timeline Float 0→1 за 0.8 сек. Update → Lerp Rotator крышки (0→-110 градусов). Finished → спавн частиц блеска.",
        practiceTask:
          "Создайте дверь: Overlap Begin → Timeline Play. Update → Set Relative Rotation (Lerp от 0 до 90° по Float Track). Overlap End → Timeline Reverse. Проверьте плавность открытия.",
        quizQuestions: [
          {
            id: "q067",
            question: "Какой пин Timeline срабатывает каждый кадр во время воспроизведения?",
            options: ["Play", "Finished", "Update", "Loop"],
            correctIndex: 2,
            explanation:
              "Пин Update срабатывает каждый кадр, пока Timeline воспроизводится. Используйте его для обновления позиции/цвета/rotation.",
          },
          {
            id: "q068",
            question: "Как проиграть Timeline в обратном порядке (закрыть дверь)?",
            options: [
              "Play с обратным знаком",
              "Reverse или Reverse from End",
              "Set New Time до нуля",
              "Пересоздать Timeline с обратной кривой",
            ],
            correctIndex: 1,
            explanation:
              "Reverse проигрывает Timeline задом наперёд. Reverse from End — принудительно с конца. Идеально для открытия/закрытия объектов.",
          },
          {
            id: "q069",
            question: "Для чего используется Event Track в Timeline?",
            options: [
              "Для анимации Float значений",
              "Для запуска Blueprint событий в определённый момент времени Timeline",
              "Для задания скорости воспроизведения",
              "Для синхронизации с анимацией скелета",
            ],
            correctIndex: 1,
            explanation:
              "Event Track позволяет вызвать событие в конкретный тик Timeline — например, звук удара в момент 0.3 сек анимации атаки.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте анимацию двери: ActorBeginOverlap → Timeline Play → на Update: Lerp Rotator (0° до 90°) → Set Relative Rotation двери.",
          hint: "Timeline Update даёт Float (0-1). Этот Float — Alpha для Lerp Rotator. Результат Lerp идёт в Set Relative Rotation компонента двери.",
          nodes: [
            {
              id: "n1",
              title: "On Actor Begin Overlap",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Timeline",
              subtitle: "DoorOpen",
              nodeType: "function",
              inputs: [
                { id: "play", label: "Play", type: "exec" },
              ],
              outputs: [
                { id: "update", label: "Update", type: "exec" },
                { id: "alpha", label: "Alpha", type: "float" },
                { id: "finished", label: "Finished", type: "exec" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Lerp (Rotator)",
              nodeType: "function",
              inputs: [
                { id: "a", label: "A", type: "vector" },
                { id: "b", label: "B", type: "vector" },
                { id: "alpha", label: "Alpha", type: "float" },
              ],
              outputs: [{ id: "result", label: "Return", type: "vector" }],
              x: 370,
              y: 120,
            },
            {
              id: "n4",
              title: "Set Relative Rotation",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "rot", label: "New Rotation", type: "vector" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 545,
              y: 60,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "play" },
            { fromNodeId: "n2", fromPinId: "update", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "alpha", toNodeId: "n3", toPinId: "alpha" },
            { fromNodeId: "n3", fromPinId: "result", toNodeId: "n4", toPinId: "rot" },
          ],
        },
      },
      {
        id: "les_110",
        moduleId: "mod_nodes",
        title: "Пользовательские события и очередь",
        description: "Custom Events, вызов между Blueprint и асинхронные цепочки",
        content:
          "Пользовательские события (Custom Events) — мощный инструмент для организации кода и асинхронных цепочек.\n\n**Создание Custom Event:**\nПКМ в граф → Add Custom Event → задайте имя. В отличие от функций, Custom Events могут содержать Delay и Timeline.\n\n**Параметры Custom Event:**\nДобавьте параметры через + в деталях события. Они становятся входными пинами.\n\n**Вызов Custom Event:**\nАвтоматически создаётся узел Call [EventName] — вызывает событие.\n\n**Вызов с задержкой:**\nSet Timer by Event — вызовет Custom Event через N секунд.\n\n**Вызов из другого Blueprint:**\n1. Нужна ссылка на целевой Blueprint\n2. Из ссылки → вызовите Custom Event напрямую\nЭто способ запустить логику в другом BP без Cast.\n\n**Очередь событий (Event Queue Pattern):**\n```\nQueue: массив событий\nProcessQueue():\n  if Array IsEmpty → return\n  Pop первый элемент → выполнить\n  Call ProcessQueue через Delay\n```\n\n**Важное правило:**\nCustom Events — не функции. Они не могут возвращать значения. Для возврата данных используйте функции или диспатчеры.\n\n**Callable from C++:**\nCustom Event можно пометить как BlueprintCallable — тогда его можно вызвать из C++.",
        xpReward: 160,
        estimatedMinutes: 14,
        tags: ["custom event", "асинхронность", "таймер"],
        realWorldExample:
          "Волновой спавнер: OnWaveComplete → Set Timer by Event 5 сек → StartNextWave (Custom Event). StartNextWave спавнит врагов и запускает новый таймер.",
        practiceTask:
          "Создайте Custom Event «SpawnWave» с параметром WaveNumber (Integer). При BeginPlay вызовите его с WaveNumber=1. В событии: Print «Волна {WaveNumber}». Через 3 сек (Set Timer) вызовите снова с WaveNumber=2.",
        quizQuestions: [
          {
            id: "q070",
            question: "Чем Custom Event отличается от Function в Blueprint?",
            options: [
              "Custom Event не может иметь параметров",
              "Custom Event может содержать Delay/Timeline и не может возвращать значения",
              "Function выполняется асинхронно, Custom Event — синхронно",
              "Они идентичны по возможностям",
            ],
            correctIndex: 1,
            explanation:
              "Custom Event поддерживает Delay и Timeline (латентные узлы). Функции — нет. Но функции могут возвращать значения, Custom Events — нет.",
          },
          {
            id: "q071",
            question: "Как вызвать Custom Event через N секунд?",
            options: [
              "Delay → Call Event",
              "Set Timer by Event / Set Timer by Function Name",
              "Event Tick с счётчиком",
              "Только через Level Blueprint",
            ],
            correctIndex: 1,
            explanation:
              "Set Timer by Event принимает ссылку на Custom Event и через N секунд вызывает его. Может быть looping.",
          },
          {
            id: "q072",
            question: "Может ли Custom Event возвращать значение?",
            options: [
              "Да, через Output Parameters",
              "Нет — для возврата значений используйте функции",
              "Да, но только Boolean",
              "Да, через Event Dispatcher",
            ],
            correctIndex: 1,
            explanation:
              "Custom Events не возвращают значения. Используйте функции (с Output пинами) или Event Dispatcher для уведомлений.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте цикличный таймер: BeginPlay → Set Timer by Event (2 сек, Looping=true) → Custom Event 'OnTimer' → Print String 'Тик!'",
          hint: "Set Timer by Event принимает Event Reference — перетащите Custom Event в этот пин. Включите параметр Looping=true для бесконечного повтора.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Set Timer by Event",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "event", label: "Event", type: "exec" },
                { id: "time", label: "Time", type: "float" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Custom Event",
              subtitle: "OnTimer",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 200,
            },
            {
              id: "n4",
              title: "Print String",
              subtitle: "'Тик!'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 370,
              y: 185,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "exec", toNodeId: "n4", toPinId: "exec" },
          ],
        },
      },
    ],
  },
  {
    id: "mod_vars",
    title: "Переменные и Типы данных",
    description: "Хранение, получение и работа с данными в Blueprint",
    icon: "database",
    difficulty: "beginner",
    color: "#39D353",
    xpRequired: 200,
    lessons: [
      {
        id: "les_005",
        moduleId: "mod_vars",
        title: "Переменные Blueprint",
        description: "Создание и использование переменных для хранения данных",
        content:
          "Переменные — основа хранения данных в Blueprint. Без переменных каждое значение жёстко задано в коде и не может изменяться.\n\n**Создание переменной:**\n1. Откройте Blueprint\n2. В панели My Blueprint → Variables → нажмите +\n3. Выберите тип: Boolean, Integer, Float, String и др.\n4. Задайте имя и значение по умолчанию\n\n**Get vs Set:**\n• Узел Get (чистый, синий) — читает значение, не прерывая выполнение\n• Узел Set — записывает новое значение, имеет Exec-пины\n\n**Область видимости:**\n• Private (по умолчанию) — только внутри этого Blueprint\n• Public — другие Blueprint могут читать/записывать\n• Instance Editable (глаз) — редактируется в панели Details на уровне\n\n**Важные типы:**\n• Boolean — флаги: isAlive, isDead, isOpen\n• Integer — счётчики: ammoCount, score, level\n• Float — физика, анимация: speed, health, opacity\n• String — текст для отладки или UI\n• Vector — позиция, направление в 3D-пространстве\n• Object Reference — ссылка на другой Actor",
        xpReward: 140,
        estimatedMinutes: 12,
        tags: ["переменные", "данные", "типы"],
        realWorldExample:
          "Персонаж-игрок: CurrentHealth (Float), MaxHealth (Float), IsAlive (Boolean), AmmoCount (Integer), PlayerName (String) — всё это переменные Blueprint.",
        practiceTask:
          "Создайте переменные: Health (Float, 100.0), IsAlive (Boolean, true), PlayerName (String, «Игрок»). В BeginPlay выведите все три значения через Print String.",
        quizQuestions: [
          {
            id: "q013",
            question: "Какой узел используется для ЗАПИСИ значения переменной?",
            options: ["Get (синий)", "Set (с Exec-пинами)", "Variable (жёлтый)", "Print (розовый)"],
            correctIndex: 1,
            explanation: "Узел Set записывает новое значение в переменную. Он имеет входной и выходной Exec-пин.",
          },
          {
            id: "q014",
            question: "Что означает пометка «Instance Editable» у переменной?",
            options: [
              "Переменная не может быть изменена",
              "Переменная редактируется в Details для каждого экземпляра на уровне",
              "Переменная работает только в редакторе",
              "Переменная автоматически сохраняется",
            ],
            correctIndex: 1,
            explanation:
              "Instance Editable позволяет устанавливать разные значения для каждого объекта этого Blueprint на уровне через панель Details.",
          },
          {
            id: "q015",
            question: "Какой тип переменной лучше для хранения позиции в 3D-пространстве?",
            options: ["Float", "Integer", "Vector", "String"],
            correctIndex: 2,
            explanation: "Vector хранит координаты X, Y, Z — идеально для позиций, направлений и скоростей в 3D.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте систему здоровья: BeginPlay → Get Health → Branch (Health > 0) → [True] Print 'Живой' / [False] Print 'Мёртвый'",
          hint: "Соедините BeginPlay → Branch. К пину Condition Branch соедините Get Health (это сделает неявное сравнение). Из True/False выведите Print String.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 100,
            },
            {
              id: "n2",
              title: "Get Health",
              subtitle: "Float Variable",
              nodeType: "variable",
              inputs: [],
              outputs: [{ id: "val", label: "Health", type: "float" }],
              x: 10,
              y: 190,
            },
            {
              id: "n3",
              title: "Branch",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 195,
              y: 70,
            },
            {
              id: "n4",
              title: "Print String",
              subtitle: "'Живой'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 375,
              y: 50,
            },
            {
              id: "n5",
              title: "Print String",
              subtitle: "'Мёртвый'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 375,
              y: 155,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "true", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "false", toNodeId: "n5", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_006",
        moduleId: "mod_vars",
        title: "Массивы и Структуры",
        description: "Работа с коллекциями данных и пользовательскими структурами",
        content:
          "Когда простых переменных недостаточно, используйте массивы и структуры.\n\n**Массивы (Arrays):**\nМассив — упорядоченный список элементов одного типа.\n\n• Индексация с нуля: первый элемент — [0]\n• Add — добавить элемент\n• Remove — удалить по значению\n• Get (a copy) — получить по индексу\n• Length — количество элементов\n• For Each Loop — перебрать все элементы\n\n**Структуры (Structs):**\nСтруктура — пользовательский тип данных, объединяющий несколько переменных.\n\nПример структуры «Предмет инвентаря»:\n• Name (String)\n• Damage (Float)\n• Durability (Integer)\n• Icon (Texture2D)\n\n**Создание структуры:**\nContent Browser → ПКМ → Blueprint → Structure → добавьте поля.\n\n**Maps (Словари):**\nMap хранит пары ключ-значение. Мгновенный поиск по ключу.\nПример: Map<String, Integer> для счёта игроков по имени.",
        xpReward: 150,
        estimatedMinutes: 14,
        tags: ["массивы", "структуры", "коллекции"],
        realWorldExample:
          "Инвентарь: массив структур Item, каждая со свойствами Name/Damage/Durability. For Each Loop — перебор предметов. Map — быстрый поиск предмета по имени.",
        practiceTask:
          "Создайте массив строк с именами 3 врагов. В BeginPlay переберите массив через For Each Loop и выведите каждое имя через Print String.",
        quizQuestions: [
          {
            id: "q016",
            question: "С какого индекса начинаются массивы в Blueprint?",
            options: ["1", "0", "-1", "Зависит от типа"],
            correctIndex: 1,
            explanation: "Массивы в Blueprint начинаются с индекса 0 — первый элемент всегда [0].",
          },
          {
            id: "q017",
            question: "Что такое Struct (Структура) в Blueprint?",
            options: [
              "Массив объектов",
              "Пользовательский тип данных, объединяющий несколько переменных",
              "Специальный тип Actor",
              "Граф функций",
            ],
            correctIndex: 1,
            explanation:
              "Struct — пользовательский тип данных, объединяющий несколько переменных в один контейнер.",
          },
          {
            id: "q018",
            question: "Какой контейнер обеспечивает мгновенный поиск по ключу?",
            options: ["Array", "Set", "Map", "Struct"],
            correctIndex: 2,
            explanation:
              "Map (словарь) хранит пары ключ-значение и обеспечивает O(1) поиск по ключу.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте перебор массива: BeginPlay → For Each Loop (массив строк) → на каждой итерации Print Array Element.",
          hint: "Соедините Exec BeginPlay → Exec For Each Loop. Выход Loop Body соедините с Exec Print String. Пин Array Element передайте в строку.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 100,
            },
            {
              id: "n2",
              title: "For Each Loop",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "arr", label: "Array", type: "string" },
              ],
              outputs: [
                { id: "body", label: "Loop Body", type: "exec" },
                { id: "elem", label: "Array Element", type: "string" },
                { id: "completed", label: "Completed", type: "exec" },
              ],
              x: 185,
              y: 60,
            },
            {
              id: "n3",
              title: "Print String",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 375,
              y: 60,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "body", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "elem", toNodeId: "n3", toPinId: "str" },
          ],
        },
      },
      {
        id: "les_111",
        moduleId: "mod_vars",
        title: "Enum — перечисления",
        description: "Создание и использование пользовательских перечислений в Blueprint",
        content:
          "Enum (перечисление) — тип данных с фиксированным набором именованных значений. Идеален для состояний, режимов, типов.\n\n**Создание Enum:**\nContent Browser → ПКМ → Blueprints → Enumeration → добавьте значения.\n\n**Пример — состояние ИИ:**\n```\nE_EnemyState:\n  Idle\n  Patrol\n  Chase\n  Attack\n  Dead\n```\n\n**Использование в Blueprint:**\n• Создайте переменную типа E_EnemyState\n• Switch on E_EnemyState — ветвление по каждому значению\n• Сравнение: == E_EnemyState::Chase\n\n**Преимущества перед строками и числами:**\n• Читабельность: Chase лучше, чем «2» или «chase»\n• Безопасность типов — нельзя случайно передать неверное значение\n• Автодополнение — редактор подсказывает значения\n• Switch on Enum — автоматически создаёт все ветви\n\n**Display Name:**\nКаждому значению можно задать Display Name — отображаемое имя в UI.\n\n**Enum как аргумент функции:**\nФункции принимают Enum-параметры — чётко документирует допустимые значения.\n\n**BlueprintType пометка:**\nПометка BlueprintType в C++ делает Enum доступным в Blueprint.",
        xpReward: 130,
        estimatedMinutes: 10,
        tags: ["enum", "состояния", "типы"],
        realWorldExample:
          "RPG: E_CharacterClass (Warrior, Mage, Rogue). Switch on E_CharacterClass → каждый класс получает разные базовые характеристики в BeginPlay.",
        practiceTask:
          "Создайте E_GameState (MainMenu, Playing, Paused, GameOver). Объявите переменную CurrentState. Switch on E_GameState: для каждого состояния выведите разное сообщение через Print String.",
        quizQuestions: [
          {
            id: "q073",
            question: "Почему Enum предпочтительнее целых чисел для хранения состояний?",
            options: [
              "Enum работает быстрее Integer",
              "Enum читаем, безопасен по типу и поддерживает Switch с автоветвями",
              "Enum может хранить больше значений",
              "Integer не поддерживается в Blueprint",
            ],
            correctIndex: 1,
            explanation:
              "Enum улучшает читаемость (Chase вместо 2), предотвращает ошибки и позволяет Switch on Enum с автоматическими ветвями.",
          },
          {
            id: "q074",
            question: "Что делает Switch on Enum в Blueprint?",
            options: [
              "Меняет тип переменной",
              "Создаёт отдельный выходной Exec-пин для каждого значения Enum",
              "Выбирает случайное значение из Enum",
              "Конвертирует Enum в Integer",
            ],
            correctIndex: 1,
            explanation:
              "Switch on Enum создаёт по одному выходному Exec-пину на каждое значение перечисления — аналог switch/case в C++.",
          },
          {
            id: "q075",
            question: "Где создаются пользовательские Enum в Unreal Engine?",
            options: [
              "Только в C++",
              "В Content Browser → Blueprint → Enumeration",
              "В панели My Blueprint → Variables",
              "Через ПКМ в Event Graph",
            ],
            correctIndex: 1,
            explanation:
              "Пользовательские Enum создаются в Content Browser как отдельные ассеты через Blueprint → Enumeration.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте машину состояний: Get CurrentState → Switch on Enum → Idle: Print 'Ожидание' / Chase: Print 'Преследование' / Attack: Print 'Атака'.",
          hint: "Switch on Enum создаёт пины для каждого значения Enum. Каждый пин ведёт к своему Print String.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Get CurrentState",
              subtitle: "E_EnemyState",
              nodeType: "variable",
              inputs: [],
              outputs: [{ id: "val", label: "CurrentState", type: "string" }],
              x: 10,
              y: 175,
            },
            {
              id: "n3",
              title: "Switch on E_EnemyState",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "sel", label: "Selection", type: "string" },
              ],
              outputs: [
                { id: "idle", label: "Idle", type: "exec" },
                { id: "chase", label: "Chase", type: "exec" },
                { id: "attack", label: "Attack", type: "exec" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n4",
              title: "Print 'Ожидание'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 390,
              y: 20,
            },
            {
              id: "n5",
              title: "Print 'Атака'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 390,
              y: 155,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "val", toNodeId: "n3", toPinId: "sel" },
            { fromNodeId: "n3", fromPinId: "idle", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "attack", toNodeId: "n5", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_112",
        moduleId: "mod_vars",
        title: "Data Table — таблицы данных",
        description: "Хранение и загрузка больших объёмов данных через Data Table",
        content:
          "Data Table — ассет UE5, хранящий таблицу данных на основе Struct. Незаменим для балансировки игры без перекомпиляции Blueprint.\n\n**Создание Data Table:**\n1. Создайте Struct с нужными полями (Name, Damage, Speed, Icon)\n2. Content Browser → ПКМ → Miscellaneous → Data Table → выберите Struct\n3. Заполните строки в редакторе таблицы\n\n**Пример — таблица оружий:**\n```\nStruct S_WeaponData:\n  WeaponName (Name)\n  BaseDamage (Float)\n  FireRate (Float)\n  MaxAmmo (Integer)\n  MeshAsset (Static Mesh Reference)\n```\n\n**Чтение из Blueprint:**\n• Get Data Table Row — по RowName → возвращает Struct\n• Break S_WeaponData → получаете все поля\n• Get Data Table Row Names → массив всех ключей\n\n**Преимущества Data Table:**\n• Дизайнеры меняют данные в редакторе без открытия Blueprint\n• Можно импортировать из CSV/JSON\n• Все данные в одном месте — легко балансировать\n\n**Soft Reference vs Hard Reference:**\nAsset-поля в Struct лучше задавать как Soft Reference — загружаются только при необходимости.",
        xpReward: 160,
        estimatedMinutes: 14,
        tags: ["data table", "struct", "данные"],
        realWorldExample:
          "RPG-игра: DT_EnemyStats — таблица с характеристиками 50 типов врагов. При спавне врага → Get Data Table Row по EnemyType → инициализация всех статов из строки таблицы.",
        practiceTask:
          "Создайте Struct S_ItemData (Name, Value, Weight). Создайте Data Table с 3 предметами. В Blueprint: Get Row 'Sword' → Break S_ItemData → Print Name и Value.",
        quizQuestions: [
          {
            id: "q076",
            question: "На основе чего создаётся Data Table в UE5?",
            options: ["Blueprint Actor", "Struct (пользовательская структура данных)", "Enum", "Array"],
            correctIndex: 1,
            explanation:
              "Data Table создаётся на основе Struct — каждая строка таблицы содержит все поля этой структуры.",
          },
          {
            id: "q077",
            question: "Какой узел Blueprint используется для получения строки из Data Table?",
            options: ["Get Array Element", "Get Data Table Row", "Find in Data Table", "Read Table Row"],
            correctIndex: 1,
            explanation:
              "Get Data Table Row принимает ссылку на таблицу и RowName, возвращает структуру с данными строки.",
          },
          {
            id: "q078",
            question: "Каковы главные преимущества Data Table перед хранением данных в Blueprint?",
            options: [
              "Data Table быстрее Blueprint при чтении",
              "Дизайнеры могут менять данные без Blueprint, можно импортировать CSV",
              "Data Table поддерживает сетевую репликацию",
              "Data Table автоматически синхронизируется с базой данных",
            ],
            correctIndex: 1,
            explanation:
              "Data Table отделяет данные от логики: дизайнер меняет баланс в таблице, программист не трогает Blueprint. Поддерживает импорт CSV/JSON.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте загрузку данных: BeginPlay → Get Data Table Row (DT_Items, 'Sword') → Break S_ItemData → Print Name + Print Value.",
          hint: "Get Data Table Row требует ссылку на Data Table ассет и RowName (Name). Выход Out Row — структура. Break разбивает на поля.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Get Data Table Row",
              subtitle: "DT_Items",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "row", label: "Row Name", type: "string" },
              ],
              outputs: [
                { id: "found", label: "Row Found", type: "exec" },
                { id: "notfound", label: "Row Not Found", type: "exec" },
                { id: "out", label: "Out Row", type: "object" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Break S_ItemData",
              nodeType: "function",
              inputs: [{ id: "struct", label: "S_ItemData", type: "object" }],
              outputs: [
                { id: "name", label: "Name", type: "string" },
                { id: "value", label: "Value", type: "float" },
              ],
              x: 380,
              y: 130,
            },
            {
              id: "n4",
              title: "Print String",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 550,
              y: 50,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "out", toNodeId: "n3", toPinId: "struct" },
            { fromNodeId: "n2", fromPinId: "found", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "name", toNodeId: "n4", toPinId: "str" },
          ],
        },
      },
      {
        id: "les_113",
        moduleId: "mod_vars",
        title: "Map — словари ключ-значение",
        description: "Работа с Map для быстрого поиска и хранения пар данных",
        content:
          "Map (TMap в C++) — контейнер, хранящий пары Ключ→Значение. Мгновенный поиск по ключу делает его незаменимым для больших наборов данных.\n\n**Создание Map:**\nVariable → тип: Map → выберите Key Type и Value Type.\nПример: Map<String, Integer> = {\"Sword\": 50, \"Shield\": 30}\n\n**Операции с Map:**\n• Add — добавить пару (если ключ есть — обновит значение)\n• Remove — удалить по ключу\n• Find — получить значение по ключу (возвращает указатель)\n• Contains — проверить наличие ключа (Boolean)\n• Length — количество пар\n• Keys — массив всех ключей\n• Values — массив всех значений\n• For Each (Map) — перебор всех пар\n\n**Map vs Array:**\n• Array: поиск O(N) (перебираете все элементы)\n• Map: поиск O(1) (мгновенно по ключу)\nИспользуйте Map, когда часто ищете по идентификатору.\n\n**Практический пример — инвентарь:**\n```\nMap<Name, Integer> Inventory\nKey = имя предмета\nValue = количество\n\nПодбор: Add('Стрела', Find('Стрела')+1)\nРасход: если Contains('Стрела') и Value>0 → Value-1\n```\n\n**Ограничения Map:**\nКлюч должен быть уникальным. Порядок не гарантирован.",
        xpReward: 150,
        estimatedMinutes: 13,
        tags: ["map", "словарь", "поиск"],
        realWorldExample:
          "Система локализации: Map<Name, String> где ключ = ID строки, значение = перевод. Get 'btn_start' → «Начать игру». Мгновенный поиск среди тысяч строк.",
        practiceTask:
          "Создайте Map<String, Integer> для инвентаря. Добавьте предметы ('Меч': 1, 'Щит': 1, 'Стрела': 30). В BeginPlay проверьте Contains 'Меч' → если да: вывести его количество.",
        quizQuestions: [
          {
            id: "q079",
            question: "В чём главное преимущество Map над Array для поиска?",
            options: [
              "Map занимает меньше памяти",
              "Map обеспечивает поиск O(1) по ключу, Array требует O(N) перебора",
              "Map автоматически сортируется",
              "Map работает быстрее только при малом числе элементов",
            ],
            correctIndex: 1,
            explanation:
              "Map использует хэш-таблицу для мгновенного O(1) поиска. Array требует перебора всех элементов O(N).",
          },
          {
            id: "q080",
            question: "Что произойдёт при Add в Map с уже существующим ключом?",
            options: [
              "Будет создана вторая запись с тем же ключом",
              "Операция завершится ошибкой",
              "Значение существующего ключа обновится новым",
              "Новая запись добавится в конец",
            ],
            correctIndex: 2,
            explanation:
              "Map не допускает дублирующихся ключей. При Add с существующим ключом — значение перезаписывается.",
          },
          {
            id: "q081",
            question: "Какой узел проверяет наличие ключа в Map?",
            options: ["Find", "Get", "Contains", "Has Key"],
            correctIndex: 2,
            explanation:
              "Contains возвращает Boolean — есть ли данный ключ в Map. Используйте перед Find, чтобы избежать доступа к несуществующему ключу.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте инвентарь: BeginPlay → Contains 'Меч' в Map → [True] Find 'Меч' → Print 'Мечей: X' / [False] Print 'Нет меча'.",
          hint: "Contains возвращает Boolean → Branch. В True-ветке: Find вернёт количество. Используйте Append для форматирования строки вывода.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Contains",
              subtitle: "Map<String,Integer>",
              nodeType: "function",
              inputs: [
                { id: "map", label: "Target Map", type: "object" },
                { id: "key", label: "Key", type: "string" },
              ],
              outputs: [{ id: "result", label: "Return Value", type: "bool" }],
              x: 185,
              y: 140,
            },
            {
              id: "n3",
              title: "Branch",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 360,
              y: 60,
            },
            {
              id: "n4",
              title: "Print 'Есть Меч'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 540,
              y: 30,
            },
            {
              id: "n5",
              title: "Print 'Нет меча'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 540,
              y: 145,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "result", toNodeId: "n3", toPinId: "cond" },
            { fromNodeId: "n3", fromPinId: "true", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "false", toNodeId: "n5", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_114",
        moduleId: "mod_vars",
        title: "Soft References и асинхронная загрузка",
        description: "Soft vs Hard References и правильная загрузка ассетов",
        content:
          "Правильное управление ссылками на ассеты критично для производительности и времени загрузки.\n\n**Hard Reference (Жёсткая ссылка):**\n• Стандартная ссылка: `StaticMesh' /Game/Meshes/Sword.Sword'`\n• Ассет загружается ВМЕСТЕ с Blueprint при его загрузке\n• Все зависимости тянутся в память\n• Опасно: Blueprint с Hard Reference на 100 мегабайтный ассет = +100 MB в память\n\n**Soft Reference (Мягкая ссылка):**\n• Тип: TSoftObjectPtr / Soft Object Reference\n• Хранит только путь к ассету, не загружает его\n• Ассет загружается только по запросу\n\n**Загрузка Soft Reference:**\n• Async Load Asset — асинхронная загрузка (не блокирует игру)\n• Load Asset — синхронная (блокирует, использовать осторожно)\n\n**Workflow с Soft Reference:**\n```\nSoft Object Reference (Mesh) → \nAsync Load Asset → \nOnLoaded (Completed) → \nSet Static Mesh (загруженный ассет)\n```\n\n**Primary Asset Type:**\nДля больших коллекций используйте Asset Manager + Primary Asset — загружает группы ассетов асинхронно.\n\n**Правило:**\nВсе ассеты, которые не нужны при старте Blueprint — Soft Reference. Загружайте их только тогда, когда нужны.",
        xpReward: 170,
        estimatedMinutes: 15,
        tags: ["soft reference", "загрузка", "память"],
        realWorldExample:
          "Open World игра: окружающие предметы (деревья, камни) — Soft Reference. Асинхронная загрузка при приближении игрока. Не нужно держать весь мир в памяти одновременно.",
        practiceTask:
          "Создайте Blueprint с Soft Object Reference на StaticMesh. В BeginPlay: Async Load Asset → при Completed → Get Loaded Asset → Set Static Mesh на компонент. Сравните время загрузки с Hard Reference.",
        quizQuestions: [
          {
            id: "q082",
            question: "Когда загружается ассет, на который есть Hard Reference в Blueprint?",
            options: [
              "Только при первом использовании",
              "При загрузке самого Blueprint — всегда",
              "При вызове Load Asset",
              "При запуске PIE",
            ],
            correctIndex: 1,
            explanation:
              "Hard Reference загружает ассет вместе с Blueprint. Если Blueprint используется на уровне — все Hard Reference ассеты в памяти.",
          },
          {
            id: "q083",
            question: "В чём преимущество Async Load Asset над Load Asset?",
            options: [
              "Async Load загружает быстрее",
              "Async Load не блокирует игровой поток — нет заморозки экрана",
              "Async Load поддерживает больший размер файла",
              "Sync Load не поддерживает Soft Reference",
            ],
            correctIndex: 1,
            explanation:
              "Async Load Asset загружает ассет в фоновом потоке. Игра продолжает работать. Завершение приходит через Completed-пин.",
          },
          {
            id: "q084",
            question: "Что хранит переменная Soft Object Reference?",
            options: [
              "Полностью загруженный ассет в памяти",
              "Только путь к ассету без его загрузки",
              "Хэш файла для проверки целостности",
              "Временную ссылку, действительную один кадр",
            ],
            correctIndex: 1,
            explanation:
              "Soft Object Reference хранит FSoftObjectPath — строку пути. Ассет не загружается пока не вызовете Load/Async Load.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте асинхронную загрузку: BeginPlay → Async Load Asset (SoftRef) → на Completed → Get Loaded Asset → Set Static Mesh → Print 'Загружено'.",
          hint: "Async Load Asset принимает Soft Object Reference и возвращает загруженный объект в Completed. Cast к Static Mesh для использования.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Async Load Asset",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "asset", label: "Asset", type: "object" },
              ],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "completed", label: "Completed", type: "exec" },
                { id: "loaded", label: "Loaded Asset", type: "object" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Set Static Mesh",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "mesh", label: "New Mesh", type: "object" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 380,
              y: 130,
            },
            {
              id: "n4",
              title: "Print 'Загружено'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 560,
              y: 115,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "completed", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "loaded", toNodeId: "n3", toPinId: "mesh" },
            { fromNodeId: "n3", fromPinId: "exec", toNodeId: "n4", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_115",
        moduleId: "mod_vars",
        title: "Save Game — сохранение данных",
        description: "Создание системы сохранения и загрузки игровых данных",
        content:
          "Save Game — специальный Blueprint-класс UE5 для сохранения данных между сессиями.\n\n**Создание Save Game:**\n1. Content Browser → ПКМ → Blueprint → Blueprint Class → выберите родительский класс SaveGame\n2. Добавьте переменные для сохранения (PlayerName, Level, XP, Inventory...)\n\n**Сохранение данных:**\n```\nCreate Save Game Object (class: BP_SaveGame)\n→ Set Name / Set Level / Set XP\n→ Save Game to Slot ('SaveSlot1', UserIndex 0)\n→ Print 'Сохранено!'\n```\n\n**Загрузка данных:**\n```\nDoes Save Game Exist ('SaveSlot1', 0) → Branch\n[True] Load Game from Slot ('SaveSlot1', 0)\n       Cast To BP_SaveGame\n       Get Level / Get XP → Apply\n[False] → Новая игра (значения по умолчанию)\n```\n\n**Удаление сохранения:**\nDelete Game in Slot ('SaveSlot1', 0)\n\n**Слоты сохранений:**\nСтрока SlotName + UserIndex = уникальный слот. Можно иметь несколько слотов (автосохранение + 3 ручных).\n\n**Async Save/Load:**\nAsync Save Game to Slot — не блокирует игру при сохранении.\n\n**Что НЕ сохранять:**\nСсылки на Actor-ы (невалидны после перезагрузки). Сохраняйте только данные (ID, числа, строки), а не объекты.",
        xpReward: 180,
        estimatedMinutes: 16,
        tags: ["save game", "сохранение", "persistence"],
        realWorldExample:
          "RPG: при выходе → Save Game (Level=15, XP=2400, InventoryData). При следующем запуске → Load → восстановление. Автосохранение каждые 5 минут через Timer.",
        practiceTask:
          "Создайте BP_SaveGame с переменной Score (Integer). В Blueprint: BeginPlay → Load (если есть) → Apply Score. При нажатии клавиши → Increment Score → Save Game to Slot 'MainSave'.",
        quizQuestions: [
          {
            id: "q085",
            question: "Какой класс нужно выбрать как родительский для Blueprint сохранения?",
            options: ["Actor", "Pawn", "SaveGame", "GameInstance"],
            correctIndex: 2,
            explanation:
              "SaveGame — базовый класс UE5 для хранения сохраняемых данных. Blueprint наследует от него и добавляет нужные переменные.",
          },
          {
            id: "q086",
            question: "Почему нельзя сохранять ссылки на Actor-ы в SaveGame?",
            options: [
              "Actor-ы занимают слишком много места",
              "После перезагрузки уровня старые ссылки становятся невалидными",
              "Система сохранений не поддерживает тип Object",
              "Actor-ы сохраняются автоматически",
            ],
            correctIndex: 1,
            explanation:
              "Ссылка на Actor — указатель на объект в памяти. После перезагрузки этот объект не существует. Сохраняйте ID/данные, а не ссылки.",
          },
          {
            id: "q087",
            question: "Как проверить наличие сохранения перед загрузкой?",
            options: ["Try Load → проверить результат на null", "Does Save Game Exist", "File Exists", "Is Valid Slot"],
            correctIndex: 1,
            explanation:
              "Does Save Game Exist принимает SlotName и UserIndex, возвращает Boolean. Используйте перед Load чтобы обработать первый запуск.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте сохранение: BeginPlay → Does Save Game Exist → [True] Load Game from Slot → Cast → Get Score → Print / [False] Print 'Новая игра'.",
          hint: "Does Save Game Exist → Branch. В True: Load Game from Slot → Cast To BP_SaveGame → Get Score. В False: Print 'Новая игра'.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Does Save Game Exist",
              nodeType: "function",
              inputs: [{ id: "slot", label: "Slot Name", type: "string" }],
              outputs: [{ id: "result", label: "Return Value", type: "bool" }],
              x: 10,
              y: 185,
            },
            {
              id: "n3",
              title: "Branch",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 195,
              y: 55,
            },
            {
              id: "n4",
              title: "Load Game from Slot",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "slot", label: "Slot Name", type: "string" },
              ],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "save", label: "Save Game Object", type: "object" },
              ],
              x: 370,
              y: 30,
            },
            {
              id: "n5",
              title: "Print 'Новая игра'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 370,
              y: 160,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "result", toNodeId: "n3", toPinId: "cond" },
            { fromNodeId: "n3", fromPinId: "true", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "false", toNodeId: "n5", toPinId: "exec" },
          ],
        },
      },
    ],
  },
  {
    id: "mod_functions",
    title: "Функции и Макросы",
    description: "Создание переиспользуемой логики через функции и макросы",
    icon: "code",
    difficulty: "basic",
    color: "#FFB800",
    xpRequired: 400,
    lessons: [
      {
        id: "les_007",
        moduleId: "mod_functions",
        title: "Создание функций",
        description: "Как создавать и вызывать собственные функции в Blueprint",
        content:
          "Функции — основа организации кода. Вместо повторения одной логики в разных местах — вынесите её в функцию.\n\n**Создание функции:**\n1. В панели My Blueprint → Functions → нажмите +\n2. Задайте имя функции\n3. В деталях добавьте Inputs и Outputs\n4. Реализуйте логику в открывшемся графе\n\n**Параметры функции:**\n• Inputs — аргументы, которые получает функция\n• Outputs — возвращаемые значения\n• Функция может иметь несколько входов и выходов\n\n**Чистые функции (Pure Functions):**\nФункции без Exec-пинов. Они не имеют побочных эффектов и вызываются автоматически при необходимости. Идеальны для математики и вычислений.\n\n**Правила функций:**\n• Функция не может вызывать событийные узлы\n• Функция не может содержать Delay (используйте Custom Events)\n• Функция Local Variables — временные переменные только внутри функции\n• Функции компилируются эффективнее макросов\n\n**Когда использовать функции vs Макросы:**\n• Функции: переиспользуемая логика с параметрами, можно вызывать из других BP\n• Макросы: локальные сокращения, могут содержать Delay и Timeline",
        xpReward: 160,
        estimatedMinutes: 13,
        tags: ["функции", "рефакторинг", "организация"],
        realWorldExample:
          "Функция TakeDamage(Amount: Float) — принимает количество урона, вычитает из здоровья, проверяет смерть. Вызывается из коллизий, ловушек, врагов — один код, много мест.",
        practiceTask:
          "Создайте функцию «CalculateDamage» с параметрами BaseDamage (Float) и ArmorMultiplier (Float). Возвращает FinalDamage = BaseDamage * (1 - ArmorMultiplier). Вызовите её из BeginPlay.",
        quizQuestions: [
          {
            id: "q019",
            question: "Что такое Pure Function в Blueprint?",
            options: [
              "Функция без входных параметров",
              "Функция без Exec-пинов, без побочных эффектов",
              "Функция, доступная только внутри Blueprint",
              "Функция для работы с UI",
            ],
            correctIndex: 1,
            explanation:
              "Pure Function не имеет Exec-пинов и не изменяет состояние. Вызывается автоматически при нужде в значении.",
          },
          {
            id: "q020",
            question: "Что НЕ может содержать обычная функция Blueprint?",
            options: ["Математические вычисления", "Узел Delay", "Условия Branch", "Циклы"],
            correctIndex: 1,
            explanation:
              "Функции не могут содержать Delay. Для асинхронных задержек используйте Custom Events или Macros.",
          },
          {
            id: "q021",
            question: "Где хранятся локальные переменные функции?",
            options: [
              "В панели My Blueprint → Variables",
              "В Content Browser",
              "Только внутри функции — уничтожаются при её завершении",
              "В глобальном Game State",
            ],
            correctIndex: 2,
            explanation:
              "Local Variables существуют только во время выполнения функции и недоступны снаружи.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте вызов функции: BeginPlay → Calculate Damage (BaseDamage=100, Armor=0.3) → результат передайте в Print String.",
          hint: "Соедините Exec BeginPlay → Exec Calculate Damage. Выход FinalDamage соедините с пином String Print String (через конвертацию).",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Calculate Damage",
              subtitle: "Custom Function",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "base", label: "BaseDamage", type: "float" },
                { id: "armor", label: "Armor", type: "float" },
              ],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "result", label: "FinalDamage", type: "float" },
              ],
              x: 185,
              y: 50,
            },
            {
              id: "n3",
              title: "Print String",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 370,
              y: 80,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_008",
        moduleId: "mod_functions",
        title: "Управление потоком",
        description: "Branch, Switch, Loops и другие инструменты управления логикой",
        content:
          "Управление потоком определяет, какой путь выполнения выбирается в зависимости от условий.\n\n**Branch (Ветвление):**\nОсновной условный оператор. Принимает Boolean → два пути: True и False.\n\n**Switch on Enum/Int/String:**\nКак switch в C++ — выбирает путь по значению переменной. Эффективнее цепочки Branch.\n\n**Циклы:**\n• For Loop — от Start до End с индексом\n• For Each Loop — перебор элементов массива\n• While Loop — пока условие true (осторожно: бесконечный цикл!)\n• Do N Times — повторить N раз\n• Do Once — выполнить только один раз, затем заблокировать\n\n**Sequence:**\nВыполняет несколько ветвей последовательно из одного Exec-пина. Удобно для упорядочивания шагов.\n\n**Gate:**\nОткрывает или закрывает поток выполнения. Open → пропускает Exec, Close → блокирует.\n\n**FlipFlop:**\nПереключается между двумя путями при каждом вызове: A → B → A → B...",
        xpReward: 170,
        estimatedMinutes: 15,
        tags: ["ветвление", "циклы", "логика"],
        realWorldExample:
          "Switch on Enum для выбора состояния ИИ (Idle/Chase/Attack). Do Once для одноразового события открытия двери. FlipFlop для переключения фонаря вкл/выкл.",
        practiceTask:
          "Создайте переменную GameState (Enum: Lobby, Playing, GameOver). Добавьте Switch on Enum и для каждого состояния выведите разное сообщение.",
        quizQuestions: [
          {
            id: "q022",
            question: "Что делает узел Do Once в Blueprint?",
            options: [
              "Выполняет действие один раз в секунду",
              "Выполняет следующий узел только при первом вызове, затем блокирует",
              "Создаёт одну копию объекта",
              "Вызывает функцию без параметров",
            ],
            correctIndex: 1,
            explanation: "Do Once пропускает первый вызов Exec, затем блокирует — идеально для одноразовых событий.",
          },
          {
            id: "q023",
            question: "Какой узел переключается между двумя путями при каждом вызове?",
            options: ["Switch", "Branch", "FlipFlop", "Gate"],
            correctIndex: 2,
            explanation: "FlipFlop при первом вызове идёт по пути A, при втором — B, при третьем — A и т.д.",
          },
          {
            id: "q024",
            question: "Чем опасен While Loop в Blueprint?",
            options: [
              "Он работает медленнее For Loop",
              "Может создать бесконечный цикл, заморозив игру",
              "Не работает с массивами",
              "Требует установки плагина",
            ],
            correctIndex: 1,
            explanation:
              "While Loop продолжается, пока условие true. Если условие никогда не станет false — бесконечный цикл зависнет движок.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте ветвление здоровья: Get Health → Branch (> 50) → [True] 'Здоров' / [False] Sequence → 'Ранен' + 'Применить лечение'",
          hint: "Branch соединяется с Sequence на пути False. Sequence имеет два выхода — Then 0 и Then 1 — каждый ведёт к своему Print String.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 110,
            },
            {
              id: "n2",
              title: "Branch",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 185,
              y: 70,
            },
            {
              id: "n3",
              title: "Print 'Здоров'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 370,
              y: 40,
            },
            {
              id: "n4",
              title: "Sequence",
              nodeType: "flow",
              inputs: [{ id: "exec", label: "Exec", type: "exec" }],
              outputs: [
                { id: "t0", label: "Then 0", type: "exec" },
                { id: "t1", label: "Then 1", type: "exec" },
              ],
              x: 370,
              y: 140,
            },
            {
              id: "n5",
              title: "Print 'Ранен'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 540,
              y: 120,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "true", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "false", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n4", fromPinId: "t0", toNodeId: "n5", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_116",
        moduleId: "mod_functions",
        title: "Override — переопределение функций",
        description: "Как расширять поведение родительских классов через Override",
        content:
          "Наследование в Blueprint позволяет переопределять функции родительского класса, добавляя или заменяя логику.\n\n**Наследование Blueprint:**\nПри создании Blueprint вы указываете родительский класс. Дочерний Blueprint наследует все переменные, функции и компоненты.\n\n**Override функции:**\nВ My Blueprint → Functions → список функций родителя → кнопка Override или ПКМ → Override.\n\n**Call Parent Node:**\nВ переопределённой функции вы можете вызвать Add Call to Parent Function — это выполнит оригинальную реализацию родителя.\n\n**Когда вызывать Parent:**\n• В начале — если дочерний расширяет поведение\n• В конце — если дочерний настраивает результат Parent\n• Не вызывать — если дочерний полностью заменяет логику\n\n**Пример — TakeDamage Override:**\n```\nBP_Enemy:\n  TakeDamage → уменьшить HP\n\nBP_BossEnemy:\n  Override TakeDamage:\n    → Call Parent TakeDamage\n    → Branch (HP < 50%) → Enrage()\n```\n\n**ReceiveBeginPlay, ReceiveHit:**\nМногие встроенные события имеют Blueprint-версии (Receive prefix) для override без C++.",
        xpReward: 170,
        estimatedMinutes: 14,
        tags: ["override", "наследование", "полиморфизм"],
        realWorldExample:
          "BP_Vehicle → BP_Car → BP_RaceCar. Каждый override GetMaxSpeed() добавляет бонус. RaceCar вызывает Parent → получает базу → добавляет +50. Иерархия без дублирования кода.",
        practiceTask:
          "Создайте BP_BaseEnemy с функцией Attack (Print 'Атака'). Создайте BP_RangedEnemy : BP_BaseEnemy. Override Attack: Call Parent → затем Print 'Выстрел'. Протестируйте оба вызова.",
        quizQuestions: [
          {
            id: "q088",
            question: "Что делает Add Call to Parent Function в переопределённой функции?",
            options: [
              "Вызывает функцию из другого Blueprint",
              "Выполняет оригинальную реализацию родительского класса",
              "Копирует логику родителя в дочерний",
              "Удаляет переопределение",
            ],
            correctIndex: 1,
            explanation: "Call to Parent выполняет оригинальный код родительского класса. Аналог super() в Java/C#.",
          },
          {
            id: "q089",
            question: "Когда НЕ нужно вызывать Parent в переопределённой функции?",
            options: [
              "Когда дочерний класс полностью заменяет логику родителя",
              "Всегда нужно вызывать Parent",
              "Когда Parent возвращает значение",
              "При переопределении Event-функций",
            ],
            correctIndex: 0,
            explanation:
              "Если дочерний полностью заменяет логику — Parent не нужен. Но это редкий случай; обычно расширяют поведение.",
          },
          {
            id: "q090",
            question: "Где в Blueprint Editor находится список функций для переопределения?",
            options: [
              "В Event Graph → ПКМ",
              "My Blueprint → Functions → раздел Override",
              "Content Browser → Functions",
              "В панели Details",
            ],
            correctIndex: 1,
            explanation:
              "В панели My Blueprint раздел Functions содержит кнопку Override — она показывает функции родителя доступные для переопределения.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте Override цепочку: Override TakeDamage → Call Parent → Branch (HP < 30%) → [True] Print 'Ярость!'.",
          hint: "Call to Parent должен быть первым — он уменьшает HP. Затем Branch проверяет оставшееся здоровье.",
          nodes: [
            {
              id: "n1",
              title: "Override TakeDamage",
              nodeType: "event",
              inputs: [],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "dmg", label: "Damage", type: "float" },
              ],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Call Parent TakeDamage",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "dmg", label: "Damage", type: "float" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Branch",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 360,
              y: 55,
            },
            {
              id: "n4",
              title: "Print 'Ярость!'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 540,
              y: 30,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n1", fromPinId: "dmg", toNodeId: "n2", toPinId: "dmg" },
            { fromNodeId: "n2", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "true", toNodeId: "n4", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_117",
        moduleId: "mod_functions",
        title: "Рекурсия в Blueprint",
        description: "Реализация рекурсивных алгоритмов через Blueprint функции",
        content:
          "Рекурсия — функция вызывает саму себя. В Blueprint это возможно, но требует осторожности.\n\n**Включение рекурсии:**\nФункция → Details → отметьте Allow Recursion. Без этого компилятор запретит рекурсивный вызов.\n\n**Базовый случай (Base Case):**\nВсегда нужен базовый случай — условие выхода из рекурсии, иначе Stack Overflow.\n\n**Пример — факториал:**\n```\nFactorial(N: Integer) → Integer:\n  Branch (N <= 1):\n    [True] → Return 1\n    [False] → Return N * Factorial(N - 1)\n```\n\n**Пример — обход дерева:**\n```\nTraverseNode(Node):\n  Process(Node)\n  ForEach Node.Children:\n    TraverseNode(Child)\n```\n\n**Ограничения Blueprint рекурсии:**\n• Blueprint стек ограничен — избегайте глубокой рекурсии (>100 уровней)\n• Нет оптимизации хвостовой рекурсии\n• При глубокой рекурсии — используйте итеративный подход с явным стеком (Array)\n\n**Когда использовать рекурсию:**\n• Обход иерархии компонентов\n• Алгоритмы на деревьях\n• Генерация фракталов",
        xpReward: 180,
        estimatedMinutes: 15,
        tags: ["рекурсия", "алгоритмы", "функции"],
        realWorldExample:
          "Поиск компонента в иерархии: FindComponentByTag(Actor, Tag) — обходит все дочерние компоненты рекурсивно. Возвращает найденный или null.",
        practiceTask:
          "Создайте рекурсивную функцию Countdown(N: Integer). Включите Allow Recursion. Branch (N<=0): [True] Print 'Пуск!' / [False] Print N → Countdown(N-1). Вызовите с N=5.",
        quizQuestions: [
          {
            id: "q091",
            question: "Что нужно включить в настройках функции для разрешения рекурсии?",
            options: ["Enable Looping", "Allow Recursion", "Self Reference", "Recursive Call"],
            correctIndex: 1,
            explanation:
              "Allow Recursion в деталях функции разрешает ей вызывать саму себя. По умолчанию Blueprint запрещает это.",
          },
          {
            id: "q092",
            question: "Что произойдёт при рекурсии без базового случая?",
            options: [
              "Функция выполнится один раз",
              "Blueprint автоматически остановит выполнение",
              "Stack Overflow — движок зависнет или крэшнется",
              "Компилятор выдаст предупреждение",
            ],
            correctIndex: 2,
            explanation:
              "Без условия выхода рекурсия бесконечна. Стек вызовов переполнится — игра крэшнется.",
          },
          {
            id: "q093",
            question: "Когда лучше заменить рекурсию итерацией в Blueprint?",
            options: [
              "Всегда — рекурсия в Blueprint запрещена",
              "При очень глубокой рекурсии (>50-100 уровней) — из-за ограничений стека",
              "Только для математических вычислений",
              "Рекурсия всегда предпочтительнее",
            ],
            correctIndex: 1,
            explanation:
              "Blueprint стек ограничен. Глубокая рекурсия вызовет Stack Overflow. Используйте массив как явный стек.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте обратный отсчёт: Countdown(N) → Branch (N<=0) → [True] Print 'Пуск!' / [False] Print N → Countdown(N-1).",
          hint: "Функция должна иметь Allow Recursion. Базовый случай завершает рекурсию. В False-ветке вызов Countdown с N-1.",
          nodes: [
            {
              id: "n1",
              title: "Countdown",
              subtitle: "Function Entry",
              nodeType: "event",
              inputs: [{ id: "n", label: "N", type: "integer" }],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Branch",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 190,
              y: 55,
            },
            {
              id: "n3",
              title: "Print 'Пуск!'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 375,
              y: 20,
            },
            {
              id: "n4",
              title: "Countdown (Recursive)",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "n", label: "N", type: "integer" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 375,
              y: 140,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "true", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "false", toNodeId: "n4", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_118",
        moduleId: "mod_functions",
        title: "Blueprint Function Library",
        description: "Создание глобальных утилит через Blueprint Function Library",
        content:
          "Blueprint Function Library — специальный Blueprint, содержащий статические утилитарные функции, доступные из любого другого Blueprint.\n\n**Создание Function Library:**\nContent Browser → ПКМ → Blueprint → Blueprint Function Library.\n\n**Особенности:**\n• Нет Instance — не создаётся объект\n• Только статические функции\n• Не может хранить переменные\n• Доступна из ЛЮБОГО Blueprint в проекте\n\n**Когда использовать Function Library:**\n• Математические утилиты\n• Конвертации типов\n• Строковые утилиты\n• Игровые расчёты, не привязанные к объекту\n\n**Пример — BPL_MathUtils:**\n```\nGetAngleBetweenVectors(A, B: Vector) → Float\nLerpColor(A, B: Color, Alpha: Float) → Color\nFormatHealthString(Current, Max: Float) → String\n```\n\n**Вызов из Blueprint:**\nПКМ в граф → найдите функцию по имени — без ссылки на объект.\n\n**Vs Blueprint Interface:**\nFunction Library = глобальные утилиты без состояния. Interface = контракт для полиморфных вызовов.",
        xpReward: 160,
        estimatedMinutes: 13,
        tags: ["function library", "утилиты", "статические функции"],
        realWorldExample:
          "BPL_GameUtils: GetDamageWithCrit(BaseDamage, CritChance, CritMultiplier) → FinalDamage. Используется во всех видах оружия и заклинаний без дублирования кода.",
        practiceTask:
          "Создайте BPL_UIUtils с функцией FormatHealthText(Current, Max: Float) → String. Возвращает '75/100 HP'. Вызовите из WBP_HUD для отображения здоровья.",
        quizQuestions: [
          {
            id: "q094",
            question: "В чём главное отличие Function Library от обычного Blueprint?",
            options: [
              "Function Library быстрее выполняется",
              "Function Library — статические функции без состояния, доступные глобально",
              "Function Library может иметь только один метод",
              "Function Library требует наследования",
            ],
            correctIndex: 1,
            explanation:
              "Function Library — глобальный набор функций без создания объекта. Доступен из любого Blueprint без ссылок.",
          },
          {
            id: "q095",
            question: "Может ли Blueprint Function Library хранить переменные (состояние)?",
            options: [
              "Да, как и любой Blueprint",
              "Нет — функции Library не имеют состояния",
              "Да, но только статические",
              "Только константы",
            ],
            correctIndex: 1,
            explanation:
              "Function Library не создаёт экземпляра — нет объекта, нет состояния. Только чистые функции-утилиты.",
          },
          {
            id: "q096",
            question: "Как вызвать функцию из Blueprint Function Library?",
            options: [
              "Нужна ссылка на экземпляр Library",
              "Через Cast to Library",
              "ПКМ в граф → найти функцию по имени (без ссылки на объект)",
              "Через Get Game Instance",
            ],
            correctIndex: 2,
            explanation:
              "Функции Library доступны через контекстное меню — без необходимости иметь ссылку на объект.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте вызов утилиты: BeginPlay → Format Health Text (Current=75, Max=100) из Function Library → Print String результата.",
          hint: "Format Health Text вызывается как обычный узел без ссылки. Передайте числа и получите отформатированную строку.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Format Health Text",
              subtitle: "BPL_UIUtils",
              nodeType: "function",
              inputs: [
                { id: "current", label: "Current", type: "float" },
                { id: "max", label: "Max", type: "float" },
              ],
              outputs: [{ id: "result", label: "Return Value", type: "string" }],
              x: 185,
              y: 100,
            },
            {
              id: "n3",
              title: "Print String",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 370,
              y: 60,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "result", toNodeId: "n3", toPinId: "str" },
          ],
        },
      },
      {
        id: "les_119",
        moduleId: "mod_functions",
        title: "Collapse и организация графа",
        description: "Collapse Nodes, Comments и организация сложных Blueprint-графов",
        content:
          "Сложные Blueprint-графы быстро становятся нечитаемыми. Вот инструменты для организации.\n\n**Collapse to Function:**\nВыделите группу узлов → ПКМ → Collapse to Function. Создаёт функцию из выделенных узлов.\n\n**Collapse to Macro:**\nСоздаёт макрос. Раскрывается inline на месте вызова.\n\n**Comment Box (C):**\nВыделите узлы → нажмите C → создаётся рамка с комментарием.\n\n**Reroute Node:**\nДважды кликните на провод → точка маршрутизации. Убирает пересечения проводов.\n\n**Правила чистого Blueprint-графа:**\n• Один граф = одна ответственность\n• Большие графы → выносить в функции\n• Комментарии для каждой группы\n• Потоки слева направо\n• Именование в CamelCase\n\n**Alignment Tools:**\nВыделите узлы → ПКМ → Align → выравнивание по краям.\n\n**Bookmarks:**\nWindow → Bookmarks → закладки для больших графов.",
        xpReward: 140,
        estimatedMinutes: 11,
        tags: ["организация", "collapse", "комментарии"],
        realWorldExample:
          "Event Tick с 30+ узлами разбит через Collapse: 'Update Movement', 'Check Visibility', 'Animate Weapon'. Каждый блок — именованная функция с комментарием.",
        practiceTask:
          "Возьмите Blueprint с 10+ узлами. Разбейте на 2-3 функции через Collapse to Function. Добавьте Comment Box для каждой группы. Оцените читаемость.",
        quizQuestions: [
          {
            id: "q097",
            question: "В чём разница между Collapse to Function и Collapse to Macro?",
            options: [
              "Они идентичны",
              "Function компилируется отдельно, Macro раскрывается inline на месте вызова",
              "Macro быстрее Function",
              "Function не может иметь параметров",
            ],
            correctIndex: 1,
            explanation:
              "Function — отдельная скомпилированная единица. Macro раскрывается inline — нельзя вызвать из другого Blueprint.",
          },
          {
            id: "q098",
            question: "Как создать Comment Box вокруг группы узлов?",
            options: [
              "ПКМ → Add Comment",
              "Выделите узлы → нажмите C",
              "Window → Comments → New",
              "Drag & drop Comment из панели",
            ],
            correctIndex: 1,
            explanation:
              "Выделите узлы → нажмите C → создаётся цветная рамка-комментарий вокруг выделения.",
          },
          {
            id: "q099",
            question: "Что такое Reroute Node в Blueprint?",
            options: [
              "Узел для изменения маршрута Actor-а по NavMesh",
              "Точка маршрутизации провода для устранения пересечений",
              "Узел перенаправления события в другой Blueprint",
              "Оптимизационный узел",
            ],
            correctIndex: 1,
            explanation:
              "Reroute Node — декоративная точка на проводе. Позволяет изогнуть провод, убрать пересечения.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте чистый инициализирующий граф: BeginPlay → Sequence → [Then 0] Set Health → [Then 1] Set Score → [Then 2] Print 'Готово'.",
          hint: "Sequence разделяет один Exec на несколько ветвей. Каждая ветвь инициализирует отдельную часть.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Sequence",
              nodeType: "flow",
              inputs: [{ id: "exec", label: "Exec", type: "exec" }],
              outputs: [
                { id: "t0", label: "Then 0", type: "exec" },
                { id: "t1", label: "Then 1", type: "exec" },
                { id: "t2", label: "Then 2", type: "exec" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Set Health",
              nodeType: "variable",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "val", label: "Health", type: "float" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 360,
              y: 20,
            },
            {
              id: "n4",
              title: "Set Score",
              nodeType: "variable",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "val", label: "Score", type: "integer" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 360,
              y: 90,
            },
            {
              id: "n5",
              title: "Print 'Готово'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 360,
              y: 170,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "t0", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "t1", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "t2", toNodeId: "n5", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_120",
        moduleId: "mod_functions",
        title: "Latent Actions — асинхронность",
        description: "Работа с латентными узлами, Delay и асинхронными операциями",
        content:
          "Латентные (Latent) узлы — функции, занимающие несколько кадров. Они не блокируют выполнение.\n\n**Распознать Latent-узел:**\nКнопка с часами ⏱ в правом верхнем углу узла.\n\n**Основные Latent-узлы:**\n• Delay — пауза на N секунд\n• Move To Location — перемещение Actor-а\n• Load Stream Level — загрузка уровня\n• Async Load Asset — загрузка ассета\n\n**Правила Latent-узлов:**\n• Только в Custom Events, Event Graph (не в Function!)\n• Функции не поддерживают многокадровые операции\n\n**Параллельные Latent-операции:**\n```\nBeginPlay:\n  → Async Load Asset A\n  → Async Load Asset B  (параллельно!)\n```\n\n**Альтернатива Delay — Promise-паттерн:**\nCustom Event → Latent → Completed → Call Next Event\n\n**Осторожно:**\nНе используйте Destroy Actor во время активного Delay — может вызвать проблемы. Используйте флаги для проверки.",
        xpReward: 175,
        estimatedMinutes: 14,
        tags: ["latent", "асинхронность", "delay"],
        realWorldExample:
          "Загрузка уровня: кнопка Start → Fade Out (Timeline 1 сек) → Async Load Level → Completed → Fade In. Пока уровень грузится — плавный переход.",
        practiceTask:
          "Создайте асинхронную цепочку: BeginPlay → Print 'Загружаем...' → Delay 2s → Print 'Загружено!' → Set Static Mesh. Проверьте порядок сообщений в PIE.",
        quizQuestions: [
          {
            id: "q100",
            question: "Как отличить Latent-узел от обычного?",
            options: [
              "Latent-узлы имеют красный цвет",
              "Иконка часов в правом верхнем углу узла",
              "Latent-узлы не имеют Exec-пинов",
              "Название содержит слово Async",
            ],
            correctIndex: 1,
            explanation:
              "Иконка часов ⏱ — стандартный маркер Latent Action в Blueprint редакторе.",
          },
          {
            id: "q101",
            question: "Почему нельзя использовать Delay внутри обычной Blueprint Function?",
            options: [
              "Delay работает только в Level Blueprint",
              "Функции выполняются синхронно и не поддерживают многокадровые операции",
              "Delay несовместим с компилятором",
              "Функции не имеют доступа к таймерам",
            ],
            correctIndex: 1,
            explanation:
              "Функции выполняются за один кадр. Latent-узлы требуют нескольких кадров. Используйте Custom Events.",
          },
          {
            id: "q102",
            question: "Что произойдёт при запуске двух Async Load Asset одновременно?",
            options: [
              "Второй не запустится до первого",
              "Они загружаются параллельно — оба Completed сработают по готовности",
              "Первый будет отменён",
              "Движок выберет один случайно",
            ],
            correctIndex: 1,
            explanation:
              "Latent-операции выполняются параллельно. Оба Async Load запустятся одновременно и независимо завершатся.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте асинхронную последовательность: BeginPlay → Print 'Начало' → Delay 2s → Print 'Через 2 сек' → Delay 1s → Print 'Через 3 сек'.",
          hint: "Delay через Completed ведёт к следующему Print. Каждый Delay → Completed → следующий шаг.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Print 'Начало'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Delay 2s",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "dur", label: "Duration", type: "float" },
              ],
              outputs: [{ id: "completed", label: "Completed", type: "exec" }],
              x: 355,
              y: 55,
            },
            {
              id: "n4",
              title: "Print 'Через 2 сек'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 530,
              y: 55,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "completed", toNodeId: "n4", toPinId: "exec" },
          ],
        },
      },
    ],
  },
  {
    id: "mod_comm",
    title: "Коммуникация между Actor-ами",
    description: "Передача данных и вызов функций между разными Blueprint",
    icon: "share-2",
    difficulty: "intermediate",
    color: "#FF6B35",
    xpRequired: 700,
    lessons: [
      {
        id: "les_009",
        moduleId: "mod_comm",
        title: "Cast и Object References",
        description: "Получение ссылок на объекты и приведение типов",
        content:
          "Для взаимодействия между Blueprint вам нужно иметь ссылку на объект и знать его тип.\n\n**Получение ссылок:**\n• Get Player Character — получить персонажа игрока\n• Get All Actors Of Class — все Actor-ы определённого класса\n• Get Actor Of Class — первый найденный Actor класса\n• Overlap события — возвращают ссылку на Other Actor\n\n**Cast (Приведение типа):**\nCast проверяет, является ли объект определённым классом и даёт доступ к его переменным/функциям.\n\n```\nGet Player Pawn\n  → Cast To BP_Character\n    → [Success] → Set Health → ...\n    → [Failure] → (объект не нужного типа)\n```\n\n**Когда использовать Cast:**\n• Нужен доступ к переменным конкретного BP-класса\n• Actor пришёл через общий тип (Actor, Pawn)\n\n**Оптимизация:**\nCast дорогой при частом вызове. Кэшируйте результат в переменную типа BP_Character.",
        xpReward: 180,
        estimatedMinutes: 14,
        tags: ["cast", "ссылки", "коммуникация"],
        realWorldExample:
          "Дверь получает Overlap → Cast To BP_Player → если успешно → Open Door. Без Cast дверь не знает, что перед ней именно игрок.",
        practiceTask:
          "В Blueprint двери на Overlap Begin: Cast To BP_ThirdPersonCharacter. При успешном Cast — вывести 'Игрок вошёл' и переместить дверь вверх через Set Actor Location.",
        quizQuestions: [
          {
            id: "q025",
            question: "Что делает узел Cast To в Blueprint?",
            options: [
              "Конвертирует тип переменной (Float в Integer)",
              "Проверяет тип объекта и даёт доступ к его специфическим переменным",
              "Перемещает объект в другое место",
              "Копирует объект",
            ],
            correctIndex: 1,
            explanation:
              "Cast To проверяет, является ли объект нужным классом. При успехе — доступ к переменным этого класса.",
          },
          {
            id: "q026",
            question: "Почему нужно кэшировать результат Cast?",
            options: [
              "Cast не возвращает объект",
              "Cast дорогая операция — повторный вызов тратит ресурсы",
              "Результат Cast меняется каждый кадр",
              "Кэширование необязательно",
            ],
            correctIndex: 1,
            explanation:
              "Cast — относительно дорогая операция. Сохраните результат в переменную и используйте повторно вместо нового Cast.",
          },
          {
            id: "q027",
            question: "Какой узел вернёт всех Actor-ов определённого класса на уровне?",
            options: ["Get Player Character", "Get Actor Of Class", "Get All Actors Of Class", "Find Actor By Name"],
            correctIndex: 2,
            explanation:
              "Get All Actors Of Class возвращает массив всех Actor-ов указанного класса, присутствующих на уровне.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте систему Cast: Overlap Begin → Cast To BP_Character → [Success] Get Health → Print 'Здоровье: X' / [Failure] Print 'Не игрок'",
          hint: "Пин Other Actor события Overlap подключите к Cast. Из Cast As BP_Character вы получаете доступ к переменным персонажа.",
          nodes: [
            {
              id: "n1",
              title: "On Actor Begin Overlap",
              nodeType: "event",
              inputs: [],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "other", label: "Other Actor", type: "object" },
              ],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Cast To BP_Character",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "obj", label: "Object", type: "object" },
              ],
              outputs: [
                { id: "success", label: "Cast Succeeded", type: "exec" },
                { id: "fail", label: "Cast Failed", type: "exec" },
                { id: "as", label: "As BP_Character", type: "object" },
              ],
              x: 210,
              y: 55,
            },
            {
              id: "n3",
              title: "Print 'Игрок!'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 410,
              y: 30,
            },
            {
              id: "n4",
              title: "Print 'Не игрок'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 410,
              y: 150,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n1", fromPinId: "other", toNodeId: "n2", toPinId: "obj" },
            { fromNodeId: "n2", fromPinId: "success", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "fail", toNodeId: "n4", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_010",
        moduleId: "mod_comm",
        title: "Event Dispatcher и делегаты",
        description: "Паттерн Observer через Event Dispatcher в Blueprint",
        content:
          "Event Dispatcher — способ уведомить другие Blueprint о событии без прямой связи между ними.\n\n**Проблема прямой связи:**\nЕсли дверь знает о плеере, а плеер знает о двери — это жёсткая зависимость. При изменении одного — ломается другое.\n\n**Event Dispatcher решает это:**\n1. BP_Door создаёт Event Dispatcher «OnDoorOpened»\n2. BP_Player подписывается на этот диспатчер\n3. Когда дверь открывается — она вызывает (Call) диспатчер\n4. Все подписанные объекты получают уведомление\n\n**Создание:**\nMy Blueprint → Event Dispatchers → +\n\n**Вызов (Call):**\nВызовите диспатчер — все подписчики получат событие\n\n**Привязка (Bind):**\nBind Event to [DispatcherName] — подписать функцию на диспатчер\n\n**Отвязка (Unbind):**\nUnbind — отписаться. Всегда отписывайтесь в EndPlay!\n\n**Преимущества:**\n• Слабая связь — объекты не знают друг о друге\n• Один диспатчер — много подписчиков\n• Легко добавлять новых слушателей",
        xpReward: 200,
        estimatedMinutes: 16,
        tags: ["событие", "dispatcher", "observer"],
        realWorldExample:
          "Chest (сундук) → OnChestOpened (Dispatcher). UI подписывается → обновляет инвентарь. Звуковой менеджер подписывается → играет звук открытия. Они не знают друг о друге.",
        practiceTask:
          "Создайте в BP_Button Event Dispatcher «OnButtonPressed». В Level Blueprint привяжите к нему Custom Event и выводите сообщение при нажатии кнопки.",
        quizQuestions: [
          {
            id: "q028",
            question: "Какую проблему решает Event Dispatcher?",
            options: [
              "Медленная скорость Blueprint",
              "Жёсткая зависимость между объектами (tight coupling)",
              "Отсутствие типов переменных",
              "Ограничение на количество узлов",
            ],
            correctIndex: 1,
            explanation:
              "Event Dispatcher позволяет объектам общаться без прямых ссылок друг на друга — паттерн Observer.",
          },
          {
            id: "q029",
            question: "Что нужно сделать в EndPlay при использовании Bind Event?",
            options: [
              "Ничего — привязки очищаются автоматически",
              "Вызвать Call Dispatcher",
              "Отвязать (Unbind) подписку",
              "Удалить переменную диспатчера",
            ],
            correctIndex: 2,
            explanation:
              "Всегда отвязывайте (Unbind) в EndPlay, иначе уничтоженные объекты могут получать вызовы и вызывать краши.",
          },
          {
            id: "q030",
            question: "Сколько подписчиков может иметь один Event Dispatcher?",
            options: ["Только один", "Максимум 4", "Не ограничено", "Зависит от типа платформы"],
            correctIndex: 2,
            explanation:
              "К одному Event Dispatcher может привязаться любое количество объектов — все получат уведомление при вызове.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте систему диспатчера: BeginPlay → Bind OnDoorOpened → кнопка Call OnDoorOpened → Bind срабатывает → Print 'Дверь открыта!'",
          hint: "Bind Event создаёт подписку. Когда Call вызывается позже — все подписанные события срабатывают автоматически.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Bind Event",
              subtitle: "to OnDoorOpened",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "event", label: "Event", type: "exec" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 190,
              y: 60,
            },
            {
              id: "n3",
              title: "Custom Event",
              subtitle: "OnDoorHandler",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 180,
            },
            {
              id: "n4",
              title: "Print 'Дверь открыта!'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 370,
              y: 160,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "exec", toNodeId: "n4", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_121",
        moduleId: "mod_comm",
        title: "Blueprint Interface",
        description: "Коммуникация через интерфейсы без жёсткой зависимости между Blueprint",
        content:
          "Blueprint Interface — контракт (набор функций), который может реализовать любой Blueprint. Позволяет вызывать функции на объекте, не зная его конкретного типа.\n\n**Создание Interface:**\nContent Browser → ПКМ → Blueprint → Blueprint Interface → добавьте функции (только сигнатуры, без реализации).\n\n**Реализация Interface:**\nBlueprint → Class Settings → добавьте Interface → в My Blueprint появятся функции для Override.\n\n**Вызов через Interface:**\nПКМ → Message [InterfaceFunctionName] — вызывает функцию если объект реализует Interface, иначе молча пропускает.\n\n**Преимущества над Cast:**\n• Не нужно знать конкретный тип объекта\n• Один вызов → работает для Door, Button, Lever\n• Нет жёсткой зависимости\n\n**Пример — Interactable Interface:**\n```\nBPI_Interactable:\n  Interact(Actor: Actor)\n\nBP_Door : BPI_Interactable\n  Interact → Open Door\n\nBP_Button : BPI_Interactable\n  Interact → Toggle Light\n\nИгрок при E:\n  Message Interact(Self) → работает для обоих!\n```\n\n**Does Implement Interface:**\nПроверить, реализует ли объект Interface → Boolean.",
        xpReward: 200,
        estimatedMinutes: 16,
        tags: ["interface", "полиморфизм", "коммуникация"],
        realWorldExample:
          "Система взаимодействия: игрок нажимает E → Message BPI_Interactable::Interact на объект перед ним. Дверь открывается, компьютер включается, NPC говорит — без единого Cast.",
        practiceTask:
          "Создайте BPI_Damageable с функцией ApplyDamage(Amount: Float). Реализуйте в BP_Enemy и BP_Barrel. Из BP_Bullet вызовите Message ApplyDamage — работает для обоих объектов.",
        quizQuestions: [
          {
            id: "q103",
            question: "Чем Blueprint Interface отличается от обычной функции Blueprint?",
            options: [
              "Interface работает быстрее",
              "Interface определяет только сигнатуру — реализацию задаёт каждый Blueprint по-своему",
              "Interface может содержать переменные",
              "Interface доступен только в C++",
            ],
            correctIndex: 1,
            explanation:
              "Interface — контракт: только сигнатуры без реализации. Каждый Blueprint реализует логику по-своему.",
          },
          {
            id: "q104",
            question: "Что произойдёт при вызове Message Interface на объект, который не реализует этот Interface?",
            options: [
              "Крэш игры",
              "Компилятор выдаст ошибку",
              "Вызов молча пропускается — ничего не происходит",
              "Вызывается родительская реализация",
            ],
            correctIndex: 2,
            explanation:
              "Message-вызов безопасен: если объект не реализует Interface — вызов игнорируется без ошибки.",
          },
          {
            id: "q105",
            question: "Когда Interface предпочтительнее Cast?",
            options: [
              "Всегда — Cast устарел",
              "Когда нужно вызвать логику на разных типах объектов без знания их конкретного класса",
              "Когда нужен доступ к переменным объекта",
              "Только в многопользовательских играх",
            ],
            correctIndex: 1,
            explanation:
              "Interface для полиморфных вызовов ('всё взаимодействуемое'). Cast для получения доступа к конкретным переменным класса.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте вызов интерфейса: Overlap Begin → Does Implement Interface (BPI_Interactable) → [True] Message Interact / [False] Print 'Не интерактивно'.",
          hint: "Does Implement Interface возвращает Boolean → Branch. В True: Message вызывает функцию Interface на объекте overlap.",
          nodes: [
            {
              id: "n1",
              title: "On Actor Begin Overlap",
              nodeType: "event",
              inputs: [],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "other", label: "Other Actor", type: "object" },
              ],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Does Implement Interface",
              nodeType: "function",
              inputs: [
                { id: "obj", label: "Object", type: "object" },
                { id: "iface", label: "Interface", type: "object" },
              ],
              outputs: [{ id: "result", label: "Return Value", type: "bool" }],
              x: 185,
              y: 145,
            },
            {
              id: "n3",
              title: "Branch",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 370,
              y: 55,
            },
            {
              id: "n4",
              title: "Message Interact",
              subtitle: "BPI_Interactable",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "target", label: "Target", type: "object" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 555,
              y: 25,
            },
            {
              id: "n5",
              title: "Print 'Не интерактивно'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 555,
              y: 145,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n1", fromPinId: "other", toNodeId: "n2", toPinId: "obj" },
            { fromNodeId: "n2", fromPinId: "result", toNodeId: "n3", toPinId: "cond" },
            { fromNodeId: "n3", fromPinId: "true", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "false", toNodeId: "n5", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_122",
        moduleId: "mod_comm",
        title: "Game Instance — глобальные данные",
        description: "Хранение данных между уровнями через Game Instance",
        content:
          "Game Instance — объект, живущий всё время работы приложения, не уничтожаемый при смене уровня. Идеален для глобального состояния.\n\n**Создание Game Instance:**\n1. ПКМ → Blueprint → выберите родительский класс GameInstance\n2. Добавьте переменные (PlayerScore, PlayerLevel, UnlockedLevels)\n3. Project Settings → Maps & Modes → Game Instance → укажите ваш класс\n\n**Доступ из любого Blueprint:**\n```\nGet Game Instance\n→ Cast To BP_GameInstance\n→ Get/Set нужные переменные\n```\n\n**Что хранить в Game Instance:**\n• Общий счёт между уровнями\n• Разблокированные уровни/контент\n• Настройки игрока (volume, language)\n• Загруженные данные профиля\n\n**Что НЕ хранить в Game Instance:**\n• Ссылки на Actor-ы (они уничтожаются при смене уровня)\n• Данные, специфичные для одного уровня\n\n**Game Instance vs Game State:**\n• Game Instance — персистентный (живёт всегда)\n• Game State — только для текущей игры, реплицируется по сети\n\n**Инициализация при первом запуске:**\nOverride Init — вызывается при старте приложения. Загружайте сохранения здесь.",
        xpReward: 190,
        estimatedMinutes: 15,
        tags: ["game instance", "глобальные данные", "между уровнями"],
        realWorldExample:
          "Мобильная игра: Game Instance хранит TotalCoins, UnlockedLevels[], SoundVolume. При переходе между уровнями данные не теряются. Загружаются из SaveGame в Init.",
        practiceTask:
          "Создайте BP_GameInstance с переменной TotalScore (Integer). В Level 1: Get Game Instance → Cast → Set TotalScore=500. Open Level 'Level2'. В Level 2: Get TotalScore → Print. Убедитесь, что значение сохранилось.",
        quizQuestions: [
          {
            id: "q106",
            question: "Что особенного у Game Instance по сравнению с другими объектами?",
            options: [
              "Он быстрее обычных Blueprint",
              "Он существует всё время работы приложения и не уничтожается при смене уровня",
              "Он автоматически реплицируется по сети",
              "Он может иметь только одну переменную",
            ],
            correctIndex: 1,
            explanation:
              "Game Instance — синглтон. Существует от старта до закрытия приложения. Смена уровня не уничтожает его.",
          },
          {
            id: "q107",
            question: "Почему нельзя хранить ссылки на Actor-ы в Game Instance?",
            options: [
              "Game Instance не поддерживает тип Object",
              "При смене уровня Actor-ы уничтожаются, ссылки становятся невалидными",
              "Это вызывает утечки памяти",
              "Game Instance не имеет доступа к Actor-ам",
            ],
            correctIndex: 1,
            explanation:
              "При Open Level все Actor-ы текущего уровня уничтожаются. Ссылки в Game Instance станут невалидными — крэш при обращении.",
          },
          {
            id: "q108",
            question: "Где указать ваш пользовательский Game Instance для проекта?",
            options: [
              "В Blueprint каждого уровня",
              "Project Settings → Maps & Modes → Game Instance Class",
              "В Level Blueprint → BeginPlay",
              "В World Settings → Game Instance",
            ],
            correctIndex: 1,
            explanation:
              "Project Settings → Maps & Modes → Game Instance Class — здесь указывается класс вашего Game Instance для всего проекта.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте доступ к глобальным данным: BeginPlay → Get Game Instance → Cast To BP_GameInstance → Get TotalScore → Print Score.",
          hint: "Get Game Instance возвращает базовый GameInstance. Cast To BP_GameInstance даёт доступ к вашим переменным. Затем Get TotalScore.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Get Game Instance",
              nodeType: "function",
              inputs: [],
              outputs: [{ id: "gi", label: "Game Instance", type: "object" }],
              x: 10,
              y: 185,
            },
            {
              id: "n3",
              title: "Cast To BP_GameInstance",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "obj", label: "Object", type: "object" },
              ],
              outputs: [
                { id: "success", label: "Cast Succeeded", type: "exec" },
                { id: "as", label: "As BP_GameInstance", type: "object" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n4",
              title: "Get TotalScore",
              nodeType: "variable",
              inputs: [{ id: "target", label: "Target", type: "object" }],
              outputs: [{ id: "val", label: "TotalScore", type: "integer" }],
              x: 375,
              y: 140,
            },
            {
              id: "n5",
              title: "Print String",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 540,
              y: 50,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "gi", toNodeId: "n3", toPinId: "obj" },
            { fromNodeId: "n3", fromPinId: "as", toNodeId: "n4", toPinId: "target" },
            { fromNodeId: "n3", fromPinId: "success", toNodeId: "n5", toPinId: "exec" },
            { fromNodeId: "n4", fromPinId: "val", toNodeId: "n5", toPinId: "str" },
          ],
        },
      },
      {
        id: "les_123",
        moduleId: "mod_comm",
        title: "Level Blueprint и связь с уровнем",
        description: "Использование Level Blueprint для управления элементами уровня",
        content:
          "Level Blueprint — специальный Blueprint, привязанный к конкретному уровню. Идеален для скриптования событий уровня.\n\n**Открытие Level Blueprint:**\nToolbar → Blueprints → Open Level Blueprint\n\n**Возможности Level Blueprint:**\n• Ссылки на Actor-ы, размещённые на уровне (без поиска!)\n• Matinee/Sequencer события\n• Переходы между уровнями\n• Триггеры, специфичные для уровня\n\n**Прямые ссылки на Actor-ы:**\nВыберите Actor на уровне → в Level Blueprint ПКМ → Create a Reference to [Actor]. Прямая ссылка без поиска!\n\n**Когда использовать Level Blueprint vs Actor BP:**\n• Level Blueprint: одноразовая логика уровня (вступительный ролик, открытие главной двери в финале)\n• Actor Blueprint: повторно используемая логика (враг, оружие, платформа)\n\n**Ограничения Level Blueprint:**\n• Не переиспользуется между уровнями\n• Нельзя создать экземпляр\n• Плохо масштабируется — держите минимальную логику\n\n**Begin Play Level:**\nСобытие BeginPlay Level Blueprint срабатывает после загрузки всех Actor-ов уровня.",
        xpReward: 170,
        estimatedMinutes: 13,
        tags: ["level blueprint", "уровень", "скриптинг"],
        realWorldExample:
          "Финальная комната: Level Blueprint — при уничтожении последнего врага (Event Dispatcher от BP_Enemy) → открыть финальную дверь (прямая ссылка на Door Actor) → запустить Sequencer.",
        practiceTask:
          "В Level Blueprint создайте прямые ссылки на 3 Actor-а (Light_1, Light_2, Light_3). В BeginPlay последовательно включите их через Sequence + Delay 1 сек между каждым.",
        quizQuestions: [
          {
            id: "q109",
            question: "Как получить прямую ссылку на Actor в Level Blueprint?",
            options: [
              "Get All Actors Of Class",
              "Выбрать Actor на уровне → ПКМ в Level Blueprint → Create Reference",
              "Cast To Actor",
              "Find Actor By Tag",
            ],
            correctIndex: 1,
            explanation:
              "Выбрав Actor на уровне и создав Reference в Level Blueprint, вы получаете прямую ссылку без дорогостоящего поиска.",
          },
          {
            id: "q110",
            question: "Какой главный недостаток Level Blueprint?",
            options: [
              "Нельзя использовать переменные",
              "Не переиспользуется — логика привязана к конкретному уровню",
              "Работает только в редакторе",
              "Не поддерживает Event Dispatcher",
            ],
            correctIndex: 1,
            explanation:
              "Level Blueprint жёстко привязан к уровню. Нельзя переиспользовать на других уровнях. Держите в нём минимум логики.",
          },
          {
            id: "q111",
            question: "Когда лучше использовать Level Blueprint вместо Actor Blueprint?",
            options: [
              "Всегда — Level Blueprint проще",
              "Для одноразовых событий конкретного уровня (кат-сцены, уникальные триггеры финала)",
              "Для создания врагов",
              "Для UI элементов",
            ],
            correctIndex: 1,
            explanation:
              "Level Blueprint для специфичных событий уровня. Actor Blueprint для переиспользуемой логики (враги, платформы, двери).",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте последовательное включение: BeginPlay Level → Sequence → [0] Set Light1 Visible → [1] Delay 1s → Set Light2 Visible → [2] Delay 2s → Set Light3 Visible.",
          hint: "Прямые ссылки на Light Actor-ы уже доступны в Level Blueprint. Sequence + Delay создают эффект поочерёдного включения.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Sequence",
              nodeType: "flow",
              inputs: [{ id: "exec", label: "Exec", type: "exec" }],
              outputs: [
                { id: "t0", label: "Then 0", type: "exec" },
                { id: "t1", label: "Then 1", type: "exec" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Set Light1 Visible",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "target", label: "Target", type: "object" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 365,
              y: 20,
            },
            {
              id: "n4",
              title: "Delay 1s",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "dur", label: "Duration", type: "float" },
              ],
              outputs: [{ id: "completed", label: "Completed", type: "exec" }],
              x: 365,
              y: 110,
            },
            {
              id: "n5",
              title: "Set Light2 Visible",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "target", label: "Target", type: "object" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 540,
              y: 110,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "t0", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "t1", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n4", fromPinId: "completed", toNodeId: "n5", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_124",
        moduleId: "mod_comm",
        title: "Game Mode и Game State",
        description: "Архитектура игровых классов: GameMode, GameState, PlayerState",
        content:
          "UE5 имеет чёткую иерархию классов для управления игровой логикой. Понимание этой структуры критично.\n\n**Game Mode:**\n• Существует только на сервере (или в одиночной игре)\n• Управляет правилами игры: кто может войти, когда заканчивается игра\n• Хранит: спавн точки, условия победы/поражения, счёт матча\n• Управляет: SpawnDefaultPawnFor, RestartPlayer, EndMatch\n\n**Game State:**\n• Реплицируется на всех клиентах\n• Публичные данные текущей игры\n• Хранит: ElapsedTime, PlayerArray, бъекты матча\n\n**Player State:**\n• Реплицируется на всех клиентах\n• Данные одного игрока: PlayerName, Score, Ping\n• Хранится даже при смерти персонажа (Pawn может быть уничтожен)\n\n**Player Controller:**\n• Посредник между игроком и Pawn\n• Получает ввод → передаёт Pawn\n• Не уничтожается при смерти Pawn\n\n**Доступ из Blueprint:**\n• Get Game Mode (только сервер)\n• Get Game State\n• Get Player State\n• Get Player Controller (индекс)\n\n**Правило:**\nGameMode = правила (скрытые). GameState = факты матча (публичные). PlayerState = факты игрока.",
        xpReward: 210,
        estimatedMinutes: 17,
        tags: ["game mode", "game state", "player state"],
        realWorldExample:
          "Battle Royale: GameMode отслеживает число живых → при 1 игроке → EndMatch. GameState хранит список выживших (реплика на всех). PlayerState хранит KDA каждого.",
        practiceTask:
          "Создайте BP_GameMode. Override HandleMatchHasStarted: Print 'Матч начался!'. Override HandleMatchHasEnded: Print 'Матч окончен!'. Укажите как GameMode в World Settings и проверьте в PIE.",
        quizQuestions: [
          {
            id: "q112",
            question: "В чём разница между GameMode и GameState?",
            options: [
              "Они идентичны",
              "GameMode = правила (только сервер), GameState = публичные данные (реплицируется на клиентов)",
              "GameMode хранит данные игроков, GameState — правила",
              "GameState существует только в редакторе",
            ],
            correctIndex: 1,
            explanation:
              "GameMode — авторитарная логика только на сервере. GameState — публичное состояние матча, видимое всем клиентам.",
          },
          {
            id: "q113",
            question: "Почему данные об очках игрока хранят в Player State, а не в Pawn?",
            options: [
              "Player State работает быстрее Pawn",
              "Pawn уничтожается при смерти, Player State сохраняется",
              "Pawn не поддерживает Integer переменные",
              "Player State автоматически сохраняется на диск",
            ],
            correctIndex: 1,
            explanation:
              "Pawn (тело игрока) уничтожается при смерти. Player State существует всё время матча — данные не теряются при respawn.",
          },
          {
            id: "q114",
            question: "На каких клиентах доступен объект Game Mode?",
            options: [
              "На всех клиентах и сервере",
              "Только на Listen Server",
              "Только на сервере (в одиночной игре — локально)",
              "Только у хост-игрока",
            ],
            correctIndex: 2,
            explanation:
              "Game Mode существует только на сервере. В одиночной игре сервер и клиент — одно и то же. В мультиплеере клиенты не имеют Game Mode.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте чтение Player State: BeginPlay → Get Player State → Cast To BP_PlayerState → Get Score → Print 'Счёт: X'.",
          hint: "Get Player State возвращает базовый PlayerState. Cast к вашему BP_PlayerState даёт доступ к переменной Score.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Get Player State",
              nodeType: "function",
              inputs: [],
              outputs: [{ id: "ps", label: "Player State", type: "object" }],
              x: 10,
              y: 185,
            },
            {
              id: "n3",
              title: "Cast To BP_PlayerState",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "obj", label: "Object", type: "object" },
              ],
              outputs: [
                { id: "success", label: "Cast Succeeded", type: "exec" },
                { id: "as", label: "As BP_PlayerState", type: "object" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n4",
              title: "Get Score",
              nodeType: "variable",
              inputs: [{ id: "target", label: "Target", type: "object" }],
              outputs: [{ id: "val", label: "Score", type: "integer" }],
              x: 375,
              y: 140,
            },
            {
              id: "n5",
              title: "Print String",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "In String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 555,
              y: 50,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "ps", toNodeId: "n3", toPinId: "obj" },
            { fromNodeId: "n3", fromPinId: "success", toNodeId: "n5", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "as", toNodeId: "n4", toPinId: "target" },
            { fromNodeId: "n4", fromPinId: "val", toNodeId: "n5", toPinId: "str" },
          ],
        },
      },
      {
        id: "les_125",
        moduleId: "mod_comm",
        title: "Компонентная коммуникация",
        description: "Взаимодействие между компонентами одного Actor-а и между разными Actor-ами",
        content:
          "Компоненты одного Actor-а взаимодействуют по-разному в зависимости от архитектуры.\n\n**Компоненты одного Actor-а:**\nПрямой доступ: в Event Graph перетащите компонент → вызывайте функции напрямую. Никакого Cast не нужно.\n\n**Доступ к компоненту другого Actor-а:**\n1. Получить ссылку на Actor\n2. Get Component by Class → возвращает компонент нужного типа\n\n```\nOverlapRef → Get Component By Class (BP_HealthComponent)\n→ Cast To BP_HealthComponent\n→ TakeDamage(50)\n```\n\n**Компонент → Владелец:**\nGet Owner — возвращает Actor, владеющий компонентом.\nCast To нужный тип → доступ к переменным Actor-а.\n\n**Event Dispatcher из компонента:**\nКомпонент создаёт Event Dispatcher «OnHealthDepleted». Actor подписывается в BeginPlay. Компонент не знает об Actor-е.\n\n**Паттерн «Notify Owner»:**\n```\nBP_HealthComponent:\n  OnDeath Dispatcher\n\nBP_Enemy (владелец):\n  BeginPlay → Bind HealthComp.OnDeath → PlayDeathAnim\n```\n\n**Get Components by Class (массив):**\nВозвращает все компоненты указанного типа на Actor-е — полезно для Actor-ов с множеством однотипных компонентов.",
        xpReward: 195,
        estimatedMinutes: 16,
        tags: ["компоненты", "коммуникация", "архитектура"],
        realWorldExample:
          "BP_Tank: WeaponComponent, ArmorComponent, HealthComponent. ArmorComponent при получении урона вызывает TakeDamage на HealthComponent. HealthComponent диспатчит OnDestroyed → TankActor проигрывает анимацию взрыва.",
        practiceTask:
          "Создайте Actor с двумя компонентами: BP_HealthComp (с Event Dispatcher OnHealthZero) и BP_AnimComp. В BeginPlay Actor-а: привяжите HealthComp.OnHealthZero → AnimComp.PlayDeath().",
        quizQuestions: [
          {
            id: "q115",
            question: "Как получить компонент определённого типа у другого Actor-а?",
            options: [
              "Cast To Actor → Get Variable",
              "Get Component By Class → Cast To нужный тип",
              "Find Component",
              "Только через Event Dispatcher",
            ],
            correctIndex: 1,
            explanation:
              "Get Component By Class возвращает первый компонент указанного класса на Actor-е. Затем Cast для доступа к специфике.",
          },
          {
            id: "q116",
            question: "Как компонент Blueprint может узнать, какой Actor им владеет?",
            options: [
              "Через переменную Owner, которую нужно задать вручную",
              "Через узел Get Owner — возвращает Actor-владелец",
              "Компонент не может знать о владельце",
              "Через Get Parent",
            ],
            correctIndex: 1,
            explanation:
              "Get Owner — встроенный узел компонента. Возвращает Actor, которому принадлежит компонент. Затем Cast для доступа.",
          },
          {
            id: "q117",
            question: "Почему Event Dispatcher лучше прямого вызова функции для связи Компонент → Actor?",
            options: [
              "Dispatcher работает быстрее прямого вызова",
              "Компонент остаётся независимым — не знает о конкретном Actor-е",
              "Прямой вызов не поддерживается из компонентов",
              "Dispatcher автоматически реплицируется",
            ],
            correctIndex: 1,
            explanation:
              "Dispatcher сохраняет слабую связь. Компонент не знает о конкретном Actor-е — он просто объявляет событие. Actor сам подписывается.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте компонентную коммуникацию: Get Damage Component → Get Owner → Cast To BP_Enemy → Call TakeDamage(50).",
          hint: "Get Owner возвращает Actor. Cast к BP_Enemy даёт доступ к функции TakeDamage. Передайте 50 как Amount.",
          nodes: [
            {
              id: "n1",
              title: "Event SomethingHit",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Get Owner",
              nodeType: "function",
              inputs: [],
              outputs: [{ id: "owner", label: "Return Value", type: "object" }],
              x: 10,
              y: 185,
            },
            {
              id: "n3",
              title: "Cast To BP_Enemy",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "obj", label: "Object", type: "object" },
              ],
              outputs: [
                { id: "success", label: "Cast Succeeded", type: "exec" },
                { id: "as", label: "As BP_Enemy", type: "object" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n4",
              title: "TakeDamage",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "target", label: "Target", type: "object" },
                { id: "amount", label: "Amount", type: "float" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 375,
              y: 50,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "owner", toNodeId: "n3", toPinId: "obj" },
            { fromNodeId: "n3", fromPinId: "success", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "as", toNodeId: "n4", toPinId: "target" },
          ],
        },
      },
    ],
  },
  {
    id: "mod_gameplay",
    title: "Механики геймплея",
    description: "Реализация реальных игровых механик через Blueprint",
    icon: "activity",
    difficulty: "intermediate",
    color: "#FF4757",
    xpRequired: 1100,
    lessons: [
      {
        id: "les_011",
        moduleId: "mod_gameplay",
        title: "Система здоровья и урона",
        description: "Создание полноценной системы здоровья с уроном и восстановлением",
        content:
          "Система здоровья — одна из самых базовых механик в играх. Реализуем её правильно.\n\n**Компонент здоровья:**\nЛучшая практика — вынести здоровье в Actor Component, а не хранить в персонаже напрямую. Так любой Actor может иметь здоровье.\n\n**Переменные:**\n• CurrentHealth (Float)\n• MaxHealth (Float)\n• bIsDead (Boolean)\n• DamageMultiplier (Float, default 1.0)\n\n**Функция TakeDamage:**\n```\nTakeDamage(Amount: Float):\n  if bIsDead → return\n  FinalDamage = Amount * DamageMultiplier\n  CurrentHealth = Clamp(CurrentHealth - FinalDamage, 0, MaxHealth)\n  if CurrentHealth <= 0 → Die()\n  Call OnHealthChanged Dispatcher\n```\n\n**Функция Heal:**\n```\nHeal(Amount: Float):\n  if bIsDead → return\n  CurrentHealth = Clamp(CurrentHealth + Amount, 0, MaxHealth)\n  Call OnHealthChanged\n```\n\n**Смерть:**\nУстановите bIsDead = true, отключите коллизию, запустите анимацию смерти, через Delay → Destroy Actor.",
        xpReward: 220,
        estimatedMinutes: 18,
        tags: ["здоровье", "урон", "геймплей"],
        realWorldExample:
          "Dark Souls: CurrentHealth уменьшается от урона, Dead = true → анимация смерти → спавн у костра. Эстус фляга — Heal с анимацией.",
        practiceTask:
          "Создайте BP с переменными CurrentHealth/MaxHealth. Функция TakeDamage вычитает здоровье. При достижении 0 — Print 'Dead'. Протестируйте с разными значениями урона.",
        quizQuestions: [
          {
            id: "q031",
            question: "Почему лучше вынести систему здоровья в Actor Component?",
            options: [
              "Компоненты работают быстрее переменных",
              "Любой Actor может иметь здоровье без дублирования кода",
              "Component обязателен для работы Physics",
              "Только Component может хранить Float",
            ],
            correctIndex: 1,
            explanation: "Actor Component позволяет переиспользовать логику здоровья у врагов, игрока, разрушаемых объектов.",
          },
          {
            id: "q032",
            question: "Зачем использовать Clamp при изменении здоровья?",
            options: [
              "Для оптимизации вычислений",
              "Чтобы здоровье не выходило за допустимый диапазон (0 - MaxHealth)",
              "Clamp обязателен для Float-переменных",
              "Для совместимости с разными платформами",
            ],
            correctIndex: 1,
            explanation: "Clamp ограничивает значение диапазоном — здоровье не уйдёт ниже 0 или выше максимума.",
          },
          {
            id: "q033",
            question: "Что нужно сделать ПЕРВЫМ делом при получении урона, если объект уже мёртв?",
            options: [
              "Уменьшить здоровье как обычно",
              "Вызвать анимацию смерти снова",
              "Прервать выполнение (return) — мёртвый не получает урон",
              "Вызвать Respawn",
            ],
            correctIndex: 2,
            explanation:
              "Проверяйте bIsDead в начале TakeDamage — мёртвый Actor не должен получать урон и снова умирать.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте систему урона: TakeDamage Event → Subtract from Health → Clamp(0, MaxHealth) → Branch (Health <= 0) → [True] Print 'Умер' / [False] Print 'HP: X'",
          hint: "Узел Clamp зажимает значение здоровья. Результат Clamp идёт в Set CurrentHealth и в Branch для проверки смерти.",
          nodes: [
            {
              id: "n1",
              title: "Event TakeDamage",
              nodeType: "event",
              inputs: [],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "amount", label: "DamageAmount", type: "float" },
              ],
              x: 10,
              y: 90,
            },
            {
              id: "n2",
              title: "Float - Float",
              subtitle: "HP - Damage",
              nodeType: "value",
              inputs: [
                { id: "a", label: "A", type: "float" },
                { id: "b", label: "B", type: "float" },
              ],
              outputs: [{ id: "result", label: "Result", type: "float" }],
              x: 185,
              y: 130,
            },
            {
              id: "n3",
              title: "Clamp (Float)",
              nodeType: "function",
              inputs: [
                { id: "val", label: "Value", type: "float" },
                { id: "min", label: "Min", type: "float" },
                { id: "max", label: "Max", type: "float" },
              ],
              outputs: [{ id: "result", label: "Return", type: "float" }],
              x: 340,
              y: 110,
            },
            {
              id: "n4",
              title: "Branch",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 500,
              y: 70,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "result", toNodeId: "n3", toPinId: "val" },
            { fromNodeId: "n1", fromPinId: "amount", toNodeId: "n2", toPinId: "b" },
            { fromNodeId: "n3", fromPinId: "result", toNodeId: "n4", toPinId: "cond" },
          ],
        },
      },
      {
        id: "les_126",
        moduleId: "mod_gameplay",
        title: "Система инвентаря",
        description: "Создание инвентаря с предметами, добавлением и удалением",
        content:
          "Инвентарь — одна из базовых систем многих жанров. Реализуем правильно с нуля.\n\n**Структура данных:**\n```\nStruct S_InventoryItem:\n  ItemID (Name)\n  DisplayName (String)\n  Quantity (Integer)\n  MaxStack (Integer)\n  Icon (Texture2D)\n  bIsConsumable (Boolean)\n```\n\n**Хранение:**\nArray<S_InventoryItem> в компоненте BP_InventoryComponent.\n\n**Ключевые функции:**\n```\nAddItem(ItemID, Quantity):\n  Найти существующий стек (Contains)\n  Если есть и не полный → добавить к количеству\n  Если нет → Add к массиву (новый стек)\n  Dispatch OnInventoryChanged\n\nRemoveItem(ItemID, Quantity):\n  Find → уменьшить Quantity\n  Если Quantity <= 0 → Remove из массива\n  Dispatch OnInventoryChanged\n\nHasItem(ItemID, Quantity) → Boolean\n```\n\n**Событие OnInventoryChanged:**\nUI подписывается → обновляет отображение при каждом изменении.\n\n**Оптимизация:**\nИспользуйте Map<Name, Integer> для быстрого поиска количества по ID.",
        xpReward: 230,
        estimatedMinutes: 20,
        tags: ["инвентарь", "предметы", "система"],
        realWorldExample:
          "Minecraft-стиль: AddItem('Wood', 3) → нашли стек Wood (17/64) → стало 20. Следующий AddItem('Wood', 50) → 20+50=70, нужно 2 стека: 64 + 6.",
        practiceTask:
          "Создайте BP_InventoryComponent с Array<S_InventoryItem>. Реализуйте AddItem и HasItem. В BeginPlay: добавьте 'Sword'×1, 'Potion'×5. Проверьте HasItem('Potion', 3) → Print True.",
        quizQuestions: [
          {
            id: "q118",
            question: "Почему систему инвентаря лучше вынести в Actor Component?",
            options: [
              "Component работает быстрее Blueprint переменных",
              "Любой Actor (игрок, NPC, сундук) может иметь инвентарь без дублирования кода",
              "Component обязателен для массивов структур",
              "Только Component может хранить Texture2D",
            ],
            correctIndex: 1,
            explanation:
              "Actor Component позволяет переиспользовать логику инвентаря у игрока, торговца, сундука без дублирования кода.",
          },
          {
            id: "q119",
            question: "Зачем вызывать Event Dispatcher OnInventoryChanged после каждого изменения?",
            options: [
              "Без Dispatcher изменения не применяются",
              "Чтобы UI и другие системы могли отреагировать на изменение без прямой зависимости",
              "Dispatcher сохраняет данные на диск",
              "Это требование движка для массивов структур",
            ],
            correctIndex: 1,
            explanation:
              "Dispatcher уведомляет подписчиков (UI, квест-систему) об изменении инвентаря. Слабая связь — инвентарь не знает об UI.",
          },
          {
            id: "q120",
            question: "Как эффективно найти предмет по ID в массиве инвентаря?",
            options: [
              "For Each Loop с проверкой каждого элемента",
              "Map<Name, Integer> для O(1) поиска или For Each с ранним выходом",
              "Get элемент по индексу",
              "Find работает автоматически для структур",
            ],
            correctIndex: 1,
            explanation:
              "Map<Name, Integer> даёт O(1) поиск по ItemID. For Each — O(N). Для частых поисков используйте Map.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте добавление предмета: AddItem(ItemID) → For Each Loop Inventory → Branch (ID == ItemID) → [True] Increment Quantity / [False после цикла] Add New Stack.",
          hint: "For Each перебирает массив. Break структуру для сравнения ItemID. При совпадении — увеличить Quantity через Set элемент. Если не нашли — Add новый элемент.",
          nodes: [
            {
              id: "n1",
              title: "AddItem",
              subtitle: "Function Entry",
              nodeType: "event",
              inputs: [{ id: "itemid", label: "ItemID", type: "string" }],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "For Each Loop",
              subtitle: "Inventory Array",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "arr", label: "Array", type: "object" },
              ],
              outputs: [
                { id: "body", label: "Loop Body", type: "exec" },
                { id: "elem", label: "Array Element", type: "object" },
                { id: "completed", label: "Completed", type: "exec" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Branch",
              subtitle: "ID == ItemID?",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 370,
              y: 55,
            },
            {
              id: "n4",
              title: "Print 'Найден — увеличить'",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 555,
              y: 25,
            },
            {
              id: "n5",
              title: "Add Array Element",
              subtitle: "New Stack",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "item", label: "New Item", type: "object" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 370,
              y: 185,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "body", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "true", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "completed", toNodeId: "n5", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_127",
        moduleId: "mod_gameplay",
        title: "Система прыжка и движения",
        description: "Расширенное управление движением персонажа через Character Movement Component",
        content:
          "Character Movement Component (CMC) — встроенный компонент UE5 для движения персонажей. Мощный и расширяемый.\n\n**Основные переменные CMC:**\n• Max Walk Speed — максимальная скорость ходьбы\n• Max Acceleration — ускорение\n• Jump Z Velocity — вертикальная скорость прыжка\n• Air Control — управление в воздухе (0-1)\n• Gravity Scale — масштаб гравитации\n• Max Step Height — максимальная высота ступеньки\n\n**Функции движения:**\n• Add Movement Input — добавить вектор направления\n• Jump — прыжок\n• Stop Jumping — прервать прыжок\n• Launch Character — мощный импульс в направлении\n\n**Двойной прыжок:**\n```\nJumpCount: Integer\nOnJump:\n  if JumpCount < MaxJumps:\n    JumpCount++\n    Launch Character (Jump)\nOnLanded:\n  JumpCount = 0\n```\n\n**Dash (рывок):**\n```\nOnDash:\n  Launch Character (ForwardVector * DashForce)\n  Set DashCooldown = true\n  Delay DashCooldownTime → DashCooldown = false\n```\n\n**Crouch (приседание):**\nCMC поддерживает приседание нативно:\nCrouch() / UnCrouch() — автоматически изменяет Capsule и скорость.",
        xpReward: 220,
        estimatedMinutes: 18,
        tags: ["движение", "прыжок", "character movement"],
        realWorldExample:
          "Платформер: двойной прыжок (JumpCount), рывок (Dash с кулдауном), приседание уменьшает хитбокс. Всё через настройки CMC и Blueprint логику.",
        practiceTask:
          "Добавьте двойной прыжок к BP_ThirdPersonCharacter. Переменная JumpCount (Integer). Event OnJumped → JumpCount++. Повторный прыжок если JumpCount < 2: Launch Character вверх. OnLanded → JumpCount=0.",
        quizQuestions: [
          {
            id: "q121",
            question: "Какой параметр CMC отвечает за управление персонажем в воздухе?",
            options: ["Max Walk Speed", "Air Control", "Jump Z Velocity", "Max Acceleration"],
            correctIndex: 1,
            explanation:
              "Air Control (0-1) определяет насколько игрок может изменять направление в воздухе. 0 = нет управления, 1 = полное.",
          },
          {
            id: "q122",
            question: "Чем Launch Character отличается от обычного Jump?",
            options: [
              "Launch Character применяется только к AI",
              "Launch Character задаёт произвольный импульс в любом направлении",
              "Jump работает быстрее",
              "Они идентичны по результату",
            ],
            correctIndex: 1,
            explanation:
              "Launch Character применяет мгновенный импульс в любом векторе — для дашей, взрывов, пружин. Jump — только вертикальный предустановленный импульс.",
          },
          {
            id: "q123",
            question: "Когда нужно сбрасывать счётчик прыжков при двойном прыжке?",
            options: [
              "После каждого прыжка",
              "При приземлении (OnLanded событие)",
              "Каждый кадр в Tick",
              "При начале игры",
            ],
            correctIndex: 1,
            explanation:
              "OnLanded — событие, которое срабатывает при касании земли. Здесь сбрасывайте JumpCount = 0 для возможности прыгнуть снова.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте систему рывка: Input Dash → IsOnCooldown? [False] → Launch Character (ForwardVector * 1500) → Set Cooldown=true → Delay 1s → Set Cooldown=false.",
          hint: "Branch проверяет bDashCooldown. Launch Character принимает вектор — используйте Get Actor Forward Vector * 1500. Delay 1s сбрасывает кулдаун.",
          nodes: [
            {
              id: "n1",
              title: "Input Dash",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Branch",
              subtitle: "Is On Cooldown?",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Launch Character",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "vel", label: "Launch Velocity", type: "vector" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 370,
              y: 110,
            },
            {
              id: "n4",
              title: "Delay 1s",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "dur", label: "Duration", type: "float" },
              ],
              outputs: [{ id: "completed", label: "Completed", type: "exec" }],
              x: 545,
              y: 110,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "false", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "exec", toNodeId: "n4", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_128",
        moduleId: "mod_gameplay",
        title: "Система оружия и стрельбы",
        description: "Line Trace для попаданий и система оружия в Blueprint",
        content:
          "Система стрельбы в шутерах — один из самых важных Blueprint-компонентов.\n\n**Line Trace (Hitscan):**\nLine Trace By Channel — пускает невидимый луч и возвращает первое попадание.\n```\nLine Trace By Channel:\n  Start: Camera Location\n  End: Camera Location + Camera Forward * MaxRange\n  Collision Channel: Visibility\n  → Hit Result\n  → Break Hit Result: Hit Actor, Hit Location, Normal\n```\n\n**Sphere Trace:**\nПохоже на Line Trace, но с радиусом — для дробовиков, ракет.\n\n**Multi Line Trace:**\nВозвращает ВСЕ попадания по пути луча — для пуль, пробивающих стены.\n\n**Система очередей:**\n```\nFire():\n  if AmmoCount <= 0 → Reload\n  AmmoCount--\n  Line Trace\n  if Hit → Apply Damage\n  Spawn Muzzle Flash\n  Play Sound\n\nReload():\n  bIsReloading = true\n  Delay ReloadTime\n  AmmoCount = MaxAmmo\n  bIsReloading = false\n```\n\n**Projectile (физическая пуля):**\nAlternative — Spawn BP_Bullet → ProjectileMovement Component. Физичнее, но дороже.\n\n**Impact Effect:**\nHit Normal → Spawn Decal + Spawn Particle по нормали поверхности.",
        xpReward: 240,
        estimatedMinutes: 20,
        tags: ["оружие", "line trace", "стрельба"],
        realWorldExample:
          "CS-GO стиль: Line Trace из камеры → проверка ECC_Pawn → Cast To BP_Character → TakeDamage. Recoil: Add Controller Pitch Input случайно при каждом выстреле.",
        practiceTask:
          "Создайте систему стрельбы: LMB Event → Line Trace (камера вперёд, 5000 units) → если Hit → Print 'Попал в: ' + Hit Actor Name. Добавьте счётчик патронов (10 штук).",
        quizQuestions: [
          {
            id: "q124",
            question: "В чём разница между Line Trace и Sphere Trace?",
            options: [
              "Line Trace работает быстрее",
              "Sphere Trace имеет радиус — проверяет объёмную область вместо тонкой линии",
              "Sphere Trace работает только в 2D",
              "Они идентичны по результату",
            ],
            correctIndex: 1,
            explanation:
              "Sphere Trace — как Line Trace, но с радиусом. Полезен для дробовиков, мечей (близкая атака), ракет с большой зоной попадания.",
          },
          {
            id: "q125",
            question: "Что возвращает Break Hit Result?",
            options: [
              "Только позицию попадания",
              "Hit Actor, Location, Normal, Component, Physical Material и другие данные попадания",
              "Boolean — попало или нет",
              "Только расстояние до точки попадания",
            ],
            correctIndex: 1,
            explanation:
              "Break Hit Result даёт полную информацию: Hit Actor (что задели), Impact Point (куда), Impact Normal (угол), Hit Component (компонент).",
          },
          {
            id: "q126",
            question: "Когда стоит использовать Projectile вместо Line Trace?",
            options: [
              "Всегда — Line Trace устарел",
              "Когда нужна реальная физика полёта: гравитация, время полёта, отрикошет",
              "Только для дробовиков",
              "Line Trace быстрее всегда",
            ],
            correctIndex: 1,
            explanation:
              "Projectile — физичная пуля с гравитацией и временем полёта (снайперка на большой дистанции, гранаты). Line Trace — мгновенно, идеально для пистолетов и винтовок.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте hitscan выстрел: Input Fire → Line Trace (Camera→Forward*3000) → Is Blocking Hit → [True] Break Hit Result → Get Hit Actor → Print Name.",
          hint: "Line Trace By Channel возвращает Boolean и FHitResult. Is Blocking Hit → Branch. Break FHitResult → Get Hit Actor → Get Display Name.",
          nodes: [
            {
              id: "n1",
              title: "Input Fire",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Line Trace By Channel",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "start", label: "Start", type: "vector" },
                { id: "end", label: "End", type: "vector" },
              ],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "hit", label: "Return Value", type: "bool" },
                { id: "result", label: "Out Hit", type: "object" },
              ],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Branch",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 380,
              y: 55,
            },
            {
              id: "n4",
              title: "Break Hit Result",
              nodeType: "function",
              inputs: [{ id: "hit", label: "Hit Result", type: "object" }],
              outputs: [
                { id: "actor", label: "Hit Actor", type: "object" },
                { id: "loc", label: "Impact Point", type: "vector" },
              ],
              x: 555,
              y: 140,
            },
            {
              id: "n5",
              title: "Print Name",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "str", label: "String", type: "string" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 555,
              y: 30,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "hit", toNodeId: "n3", toPinId: "cond" },
            { fromNodeId: "n2", fromPinId: "result", toNodeId: "n4", toPinId: "hit" },
            { fromNodeId: "n3", fromPinId: "true", toNodeId: "n5", toPinId: "exec" },
          ],
        },
      },
      {
        id: "les_129",
        moduleId: "mod_gameplay",
        title: "Система квестов",
        description: "Создание простой системы квестов с целями и наградами",
        content:
          "Система квестов — интегрирующий элемент геймплея. Объединяет события, UI, награды.\n\n**Структура данных квеста:**\n```\nStruct S_QuestObjective:\n  ObjectiveID (Name)\n  Description (String)\n  RequiredCount (Integer)\n  CurrentCount (Integer)\n  bCompleted (Boolean)\n\nStruct S_Quest:\n  QuestID (Name)\n  Title (String)\n  Objectives (Array<S_QuestObjective>)\n  XPReward (Integer)\n  bActive (Boolean)\n  bCompleted (Boolean)\n```\n\n**Логика квест-менеджера:**\n```\nAcceptQuest(QuestID):\n  Load from DT_Quests\n  Add to ActiveQuests\n  Dispatch OnQuestAccepted\n\nUpdateObjective(QuestID, ObjectiveID, Count):\n  Find Quest → Find Objective\n  CurrentCount += Count\n  if CurrentCount >= RequiredCount → Complete Objective\n  if All Objectives Complete → CompleteQuest\n\nCompleteQuest(QuestID):\n  Give XP Reward\n  Dispatch OnQuestCompleted\n```\n\n**Интеграция с миром:**\nBP_Enemy OnDeath → QuestManager.UpdateObjective('KillWolves', 'Wolf', 1)\n\n**UI обновление:**\nOnQuestObjectiveUpdated → Обновить текст прогресса",
        xpReward: 250,
        estimatedMinutes: 22,
        tags: ["квесты", "система", "геймплей"],
        realWorldExample:
          "The Witcher: AcceptQuest → добавляет цели в Journal. При убийстве монстра → UpdateObjective. При выполнении всех целей → показ уведомления, выдача XP, разблокировка следующего квеста.",
        practiceTask:
          "Создайте квест 'Охотник': цель — убить 5 волков. BP_Wolf OnDeath → вызывает UpdateKillCount. При 5 убийствах → Print 'Квест завершён!' + Print 'XP +200'.",
        quizQuestions: [
          {
            id: "q127",
            question: "Почему данные квестов лучше хранить в Data Table?",
            options: [
              "Data Table быстрее массива структур",
              "Дизайнеры редактируют квесты в таблице без изменения Blueprint-логики",
              "Data Table поддерживает сетевую репликацию",
              "Только Data Table поддерживает вложенные структуры",
            ],
            correctIndex: 1,
            explanation:
              "Data Table отделяет данные (названия, описания, награды) от логики. Дизайнер добавляет квесты, не трогая Blueprint.",
          },
          {
            id: "q128",
            question: "Как лучше уведомить UI об изменении прогресса квеста?",
            options: [
              "Прямой вызов функции Widget из Quest Manager",
              "Event Dispatcher OnQuestObjectiveUpdated — UI подписывается",
              "Polling — UI проверяет прогресс каждый кадр",
              "Через Game State",
            ],
            correctIndex: 1,
            explanation:
              "Event Dispatcher — слабая связь. Quest Manager не знает об UI. UI подписывается и обновляется при событии.",
          },
          {
            id: "q129",
            question: "Что должно происходить при завершении всех целей квеста?",
            options: [
              "Автоматическое удаление квеста из памяти",
              "Пометить квест bCompleted, выдать награды, вызвать Dispatcher",
              "Перезапустить уровень",
              "Только показать уведомление",
            ],
            correctIndex: 1,
            explanation:
              "CompleteQuest: пометить bCompleted=true, выдать XP/предметы, вызвать OnQuestCompleted Dispatcher для UI и других систем.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте обновление цели: OnEnemyKilled Event → Get QuestProgress → Integer+1 → Set QuestProgress → Branch (>= 5) → [True] Print 'Квест выполнен!' → Give Reward.",
          hint: "Get QuestProgress переменная хранит текущий прогресс. После инкремента — Branch проверяет достижение цели (5 убийств).",
          nodes: [
            {
              id: "n1",
              title: "Event OnEnemyKilled",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Get QuestProgress",
              nodeType: "variable",
              inputs: [],
              outputs: [{ id: "val", label: "QuestProgress", type: "integer" }],
              x: 10,
              y: 185,
            },
            {
              id: "n3",
              title: "Integer + 1",
              nodeType: "value",
              inputs: [
                { id: "a", label: "A", type: "integer" },
                { id: "b", label: "B", type: "integer" },
              ],
              outputs: [{ id: "result", label: "Result", type: "integer" }],
              x: 185,
              y: 155,
            },
            {
              id: "n4",
              title: "Set QuestProgress",
              nodeType: "variable",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "val", label: "QuestProgress", type: "integer" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 355,
              y: 55,
            },
            {
              id: "n5",
              title: "Branch >= 5",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "cond", label: "Condition", type: "bool" },
              ],
              outputs: [
                { id: "true", label: "True", type: "exec" },
                { id: "false", label: "False", type: "exec" },
              ],
              x: 530,
              y: 55,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "val", toNodeId: "n3", toPinId: "a" },
            { fromNodeId: "n3", fromPinId: "result", toNodeId: "n4", toPinId: "val" },
            { fromNodeId: "n4", fromPinId: "exec", toNodeId: "n5", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "result", toNodeId: "n5", toPinId: "cond" },
          ],
        },
      },
      {
        id: "les_130",
        moduleId: "mod_gameplay",
        title: "Respawn система",
        description: "Реализация системы возрождения игрока после смерти",
        content:
          "Система respawn — критически важный элемент геймплея. Правильная реализация обеспечивает плавный опыт.\n\n**Базовый Respawn Flow:**\n```\nOnPlayerDeath:\n  1. Отключить input (Disable Input)\n  2. Анимация смерти\n  3. Показать Death UI (счётчик)\n  4. Delay RespawnTime (3-5 сек)\n  5. Choose Spawn Point\n  6. Respawn: Reset Health, Re-enable Input\n  7. Hide Death UI\n```\n\n**Player Respawn Points:**\n```\nGet All Actors Of Class (BP_SpawnPoint)\n→ Filter: IsActive и Team == PlayerTeam\n→ Random выбор\n```\n\n**Spectator Mode:**\nПока игрок мёртв → переключить на Spectator Pawn. Игрок наблюдает за боем.\n\n**Respawn через GameMode:**\nGameMode.RestartPlayer(Controller) — встроенный respawn:\n1. Находит свободную точку спавна\n2. Создаёт нового Pawn\n3. Передаёт управление PlayerController\n\n**Respawn с сохранением прогресса:**\n• Health сбрасывается → MaxHealth\n• Положение сбрасывается → SpawnPoint\n• Инвентарь может сохраняться (PlayerState)\n• Cooldowns сбрасываются\n\n**Checkpoint система:**\nCurrent Checkpoint → RespawnPoint. При прохождении нового Checkpoint → Update Current.",
        xpReward: 230,
        estimatedMinutes: 19,
        tags: ["respawn", "смерть", "checkpoint"],
        realWorldExample:
          "Dark Souls: смерть → Fade to Black → Load из Bonfire. Количество душ → Plant at Death Location. При respawn: полное HP, восстановление Estus.",
        practiceTask:
          "Создайте систему respawn: при Health=0 → Print 'Погиб' → Disable Input → Delay 3s → Set Actor Location (SpawnPoint) → Set Health=MaxHealth → Enable Input → Print 'Возрождён'.",
        quizQuestions: [
          {
            id: "q130",
            question: "Зачем отключать ввод (Disable Input) при смерти игрока?",
            options: [
              "Для улучшения производительности",
              "Чтобы игрок не мог двигаться или атаковать во время смерти/respawn",
              "Input отключается автоматически при смерти",
              "Для сохранения состояния управления",
            ],
            correctIndex: 1,
            explanation:
              "Без Disable Input игрок может продолжать управлять мёртвым персонажем. Это ломает анимации и логику.",
          },
          {
            id: "q131",
            question: "Почему данные инвентаря при respawn хранят в Player State, а не в Pawn?",
            options: [
              "Player State работает быстрее",
              "Pawn уничтожается при смерти, Player State — нет",
              "Pawn не может хранить массивы",
              "Player State автоматически реплицируется",
            ],
            correctIndex: 1,
            explanation:
              "Pawn (тело) уничтожается при смерти. Player State переживает respawn — данные сохраняются автоматически.",
          },
          {
            id: "q132",
            question: "Что делает GameMode.RestartPlayer?",
            options: [
              "Перезапускает уровень",
              "Создаёт новый Pawn, находит точку спавна, передаёт управление PlayerController",
              "Телепортирует игрока в начало уровня",
              "Сбрасывает все переменные персонажа",
            ],
            correctIndex: 1,
            explanation:
              "RestartPlayer — встроенный respawn GameMode. Автоматически ищет точку спавна, создаёт Pawn и подключает Controller.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте respawn: OnDeath → Disable Input → Delay 3s → Set Location (SpawnPoint) → Reset Health → Enable Input → Print 'Возрождён!'.",
          hint: "Disable Input принимает Player Controller. Delay 3s через Completed. Set Actor Location на CheckpointLocation. Set Health=MaxHealth. Enable Input.",
          nodes: [
            {
              id: "n1",
              title: "Event OnDeath",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Disable Input",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "ctrl", label: "Player Controller", type: "object" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Delay 3s",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "dur", label: "Duration", type: "float" },
              ],
              outputs: [{ id: "completed", label: "Completed", type: "exec" }],
              x: 360,
              y: 55,
            },
            {
              id: "n4",
              title: "Set Actor Location",
              subtitle: "SpawnPoint",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "loc", label: "New Location", type: "vector" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 535,
              y: 55,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "completed", toNodeId: "n4", toPinId: "exec" },
          ],
        },
      },
    ],
  },
  {
    id: "mod_ui",
    title: "UI и Widget Blueprint",
    description: "Создание интерфейсов пользователя через Widget Blueprint",
    icon: "monitor",
    difficulty: "intermediate",
    color: "#C879FF",
    xpRequired: 1500,
    lessons: [
      {
        id: "les_012",
        moduleId: "mod_ui",
        title: "Widget Blueprint основы",
        description: "Создание HUD и меню через UMG Widget Blueprint",
        content:
          "Widget Blueprint (UMG — Unreal Motion Graphics) — система создания UI в UE5.\n\n**Создание Widget:**\nContent Browser → ПКМ → User Interface → Widget Blueprint\n\n**Основные компоненты UMG:**\n• Text Block — отображение текста (HP: 100)\n• Image — изображение, иконка\n• Button — кнопка с событием OnClicked\n• Progress Bar — полоса прогресса (здоровье, опыт)\n• Canvas Panel — свободное размещение элементов\n• Vertical/Horizontal Box — автоматический layout\n• Grid Panel — сетка для инвентаря\n\n**Привязка данных (Binding):**\nText Block может быть привязан к функции Blueprint.\n\n```\nBind → GetHealthText():\n  return «HP: » + ToString(CurrentHealth)\n```\n\n**Добавление виджета на экран:**\n```\nCreate Widget (class: WBP_HUD)\n→ Add to Viewport\n```\n\n**Анимации в UMG:**\nUMG имеет встроенный редактор анимаций. Можно анимировать позицию, прозрачность, цвет любого элемента.",
        xpReward: 240,
        estimatedMinutes: 20,
        tags: ["ui", "widget", "umg", "hud"],
        realWorldExample:
          "Полоска HP привязана к CurrentHealth через Binding — обновляется автоматически. Кнопка паузы OnClicked → Set Game Paused → показать меню.",
        practiceTask:
          "Создайте WBP_HUD с Progress Bar для здоровья. Привяжите Percent к функции, возвращающей CurrentHealth / MaxHealth. Добавьте виджет на экран из BP_Character в BeginPlay.",
        quizQuestions: [
          {
            id: "q034",
            question: "Какой компонент UMG используется для отображения полосы прогресса здоровья?",
            options: ["Text Block", "Slider", "Progress Bar", "Canvas Panel"],
            correctIndex: 2,
            explanation: "Progress Bar отображает значение от 0.0 до 1.0 в виде заполненной полосы.",
          },
          {
            id: "q035",
            question: "Как добавить Widget Blueprint на экран игрока?",
            options: [
              "Drag & Drop в Viewport",
              "Create Widget → Add to Viewport",
              "Автоматически при создании виджета",
              "Через Camera Component",
            ],
            correctIndex: 1,
            explanation: "Create Widget создаёт экземпляр виджета, Add to Viewport отображает его на экране.",
          },
          {
            id: "q036",
            question: "Что такое Binding в контексте UMG?",
            options: [
              "Привязка виджета к Actor",
              "Привязка значения свойства к функции для автоматического обновления",
              "Связь между кнопкой и событием",
              "Импорт шрифтов",
            ],
            correctIndex: 1,
            explanation: "Binding связывает свойство UI-элемента с функцией — значение обновляется каждый кадр автоматически.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте показ UI: BeginPlay → Create WBP_HUD Widget → Add to Viewport. Передайте ссылку на персонажа в виджет через Set Owning Player.",
          hint: "Create Widget имеет пин Owning Player — передайте туда Get Player Controller. Затем Exec → Add to Viewport.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 90,
            },
            {
              id: "n2",
              title: "Create Widget",
              subtitle: "WBP_HUD",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "owner", label: "Owning Player", type: "object" },
              ],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "widget", label: "Return Value", type: "object" },
              ],
              x: 185,
              y: 65,
            },
            {
              id: "n3",
              title: "Get Player Controller",
              nodeType: "function",
              inputs: [],
              outputs: [{ id: "ctrl", label: "Player Controller", type: "object" }],
              x: 10,
              y: 195,
            },
            {
              id: "n4",
              title: "Add to Viewport",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "target", label: "Target", type: "object" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 380,
              y: 65,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "ctrl", toNodeId: "n2", toPinId: "owner" },
            { fromNodeId: "n2", fromPinId: "exec", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "widget", toNodeId: "n4", toPinId: "target" },
          ],
        },
      },
    ],
  },
  {
    id: "mod_ai",
    title: "AI на Blueprint",
    description: "Создание поведения врагов с помощью Blueprint AI",
    icon: "eye",
    difficulty: "advanced",
    color: "#7B4FFF",
    xpRequired: 2000,
    lessons: [
      {
        id: "les_013",
        moduleId: "mod_ai",
        title: "Behavior Tree основы",
        description: "Создание ИИ-поведения через Behavior Tree и Blueprint",
        content:
          "Behavior Tree (дерево поведения) — стандарт для ИИ в UE5. Комбинируется с Blueprint для гибкого поведения.\n\n**Компоненты системы AI:**\n• AIController — управляет Pawn, имеет AI-логику\n• Behavior Tree — дерево решений\n• Blackboard — «память» AI, хранит переменные\n• Tasks — листовые узлы дерева (Move To, Wait, Attack)\n• Decorators — условия (Is Player In Range, Has Ammo)\n• Services — периодически обновляют Blackboard\n\n**Структура Behavior Tree:**\n```\nRoot\n└── Selector\n    ├── [Decorator: SeePlayer] → Sequence\n    │   ├── Task: Chase Player\n    │   └── Task: Attack\n    └── Task: Patrol\n```\n\n**Blueprint Tasks:**\nВы можете создавать Blueprint BTTask:\n1. Content Browser → ПКМ → AI → Behavior Tree Task\n2. Переопределите ExecuteTask\n3. При завершении вызовите Finish Execute (Success/Fail)\n\n**Blackboard Keys:**\nBB хранит данные: PlayerActor (Object), LastKnownLocation (Vector), IsAlert (Bool). Services обновляют их, Tasks используют.",
        xpReward: 280,
        estimatedMinutes: 22,
        tags: ["ai", "behavior tree", "blackboard"],
        realWorldExample:
          "Охранник: патрулирует (Patrol Task) → замечает игрока (EQS + Decorator) → преследует (Move To Player) → атакует (Attack Task) → теряет (Clear Blackboard Key) → возвращается.",
        practiceTask:
          "Создайте AIController с Behavior Tree. Добавьте задачу патрулирования: случайная точка на NavMesh → Move To. Подключите Behavior Tree к AI через AIController BeginPlay.",
        quizQuestions: [
          {
            id: "q037",
            question: "Что такое Blackboard в контексте Behavior Tree?",
            options: [
              "Визуальный редактор дерева поведения",
              "Хранилище данных для ИИ — переменные, доступные всему дереву",
              "Компонент для рендеринга отладочной информации",
              "Тип AIController",
            ],
            correctIndex: 1,
            explanation: "Blackboard — «память» ИИ. Хранит переменные (позиция игрока, состояние тревоги), которые используют узлы дерева.",
          },
          {
            id: "q038",
            question: "Что делает Decorator в Behavior Tree?",
            options: [
              "Рисует отладочную информацию",
              "Украшает узел для читаемости",
              "Условие выполнения ветки — разрешает или блокирует",
              "Выполняет периодические обновления",
            ],
            correctIndex: 2,
            explanation: "Decorator — условие на узле BT. Если условие не выполнено — ветка пропускается.",
          },
          {
            id: "q039",
            question: "Что нужно вызвать в конце Blueprint BTTask для завершения задачи?",
            options: ["Return Node", "End Task", "Finish Execute (Success или Fail)", "Complete Task"],
            correctIndex: 2,
            explanation:
              "Finish Execute с параметром Success (true) или Fail (false) сигнализирует BT о завершении задачи.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте запуск AI: BeginPlay → Run Behavior Tree → AIController получает ссылку на Blackboard → Set Blackboard Value (PlayerRef).",
          hint: "Run Behavior Tree принимает BTAsset. После запуска обновите Blackboard через Get Blackboard → Set Value As Object.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 80,
            },
            {
              id: "n2",
              title: "Run Behavior Tree",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "bt", label: "BTAsset", type: "object" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 185,
              y: 55,
            },
            {
              id: "n3",
              title: "Get Blackboard",
              nodeType: "function",
              inputs: [],
              outputs: [{ id: "bb", label: "Blackboard", type: "object" }],
              x: 185,
              y: 165,
            },
            {
              id: "n4",
              title: "Set Value As Object",
              subtitle: "PlayerRef",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "target", label: "Target", type: "object" },
                { id: "val", label: "Value", type: "object" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 370,
              y: 55,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "exec", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "bb", toNodeId: "n4", toPinId: "target" },
          ],
        },
      },
    ],
  },
  {
    id: "mod_optimization",
    title: "Оптимизация Blueprint",
    description: "Лучшие практики и оптимизация производительности Blueprint",
    icon: "zap",
    difficulty: "expert",
    color: "#FFB800",
    xpRequired: 3000,
    lessons: [
      {
        id: "les_014",
        moduleId: "mod_optimization",
        title: "Профилирование и оптимизация",
        description: "Поиск узких мест и оптимизация Blueprint-графов",
        content:
          "Неоптимизированный Blueprint может убить производительность. Научитесь находить и устранять узкие места.\n\n**Инструменты профилирования:**\n• stat fps / stat unit — базовые метрики в реальном времени\n• Blueprint Profiler — встроенный профайлер Blueprint (Window → Developer Tools → Blueprint Profiler)\n• Session Frontend → Profiler — детальный анализ CPU/GPU\n\n**Частые ошибки Blueprint:**\n\n1. Тяжёлый Tick\nGetAllActorsOfClass в Tick — O(N) каждый кадр. Кэшируйте результат в BeginPlay!\n\n2. Частый Cast в Tick\nCast дорогой. Выполните один раз, сохраните в переменную.\n\n3. Spawn в Tick\nSpawning Actor каждый кадр = гарантированный лаг. Используйте Object Pooling.\n\n4. Слишком много Tick-объектов\nОтключите Tick у объектов, которым он не нужен: Begin Play → Set Actor Tick Enabled (false).\n\n**Blueprint vs C++:**\nBlueprint: разработка быстрее, C++: выполнение быстрее. Критичную логику (тысячи вызовов/сек) переносите в C++. Blueprint вызывает нативную функцию без накладных расходов.\n\n**Nativization:**\nUE5 может скомпилировать Blueprint в C++ автоматически (Project Settings → Packaging → Blueprint Nativization).",
        xpReward: 320,
        estimatedMinutes: 25,
        tags: ["оптимизация", "производительность", "профилирование"],
        realWorldExample:
          "В шутере от первого лица: Tick врагов отключён пока игрок далеко (Distance Culling). При входе в радиус — включается. 50 врагов → только 5 активных = 10x экономия.",
        practiceTask:
          "Откройте Blueprint Profiler. Создайте намеренно «плохой» Blueprint с GetAllActors в Tick. Запустите профилер и найдите узкое место. Исправьте, кэшировав результат.",
        quizQuestions: [
          {
            id: "q040",
            question: "Почему GetAllActorsOfClass нельзя вызывать в Event Tick?",
            options: [
              "Функция работает только в BeginPlay",
              "Это O(N) операция каждый кадр — огромная нагрузка на CPU",
              "Функция не возвращает актуальные данные в Tick",
              "Ограничение движка",
            ],
            correctIndex: 1,
            explanation:
              "GetAllActorsOfClass перебирает все объекты уровня каждый кадр. При 60fps и сотнях объектов — критичная нагрузка. Кэшируйте в BeginPlay.",
          },
          {
            id: "q041",
            question: "Что такое Blueprint Nativization?",
            options: [
              "Конвертация C++ в Blueprint",
              "Автоматическая компиляция Blueprint в C++ при packaging",
              "Удаление Blueprint из сборки",
              "Оптимизация текстур Blueprint",
            ],
            correctIndex: 1,
            explanation:
              "Blueprint Nativization конвертирует BP в C++ при сборке — Blueprint пишется удобно, а работает как нативный код.",
          },
          {
            id: "q042",
            question: "Как уменьшить нагрузку от большого числа Actor-ов с Tick?",
            options: [
              "Увеличить framerate",
              "Отключить Tick у далёких/неактивных Actor-ов через Set Actor Tick Enabled",
              "Удалить все Actor-ы из уровня",
              "Уменьшить MaxHealth всех Actor-ов",
            ],
            correctIndex: 1,
            explanation:
              "Отключайте Tick у неактивных объектов (Set Actor Tick Enabled false) и включайте только когда нужно — Distance Culling паттерн.",
          },
        ],
        buildChallenge: {
          instruction:
            "Постройте оптимизированную инициализацию: BeginPlay → Get All Actors Of Class → Set EnemiesCache → Set Tick Enabled (false) для каждого врага через For Each Loop.",
          hint: "GetAllActors возвращает массив. For Each Loop перебирает его. Set Actor Tick Enabled (false) отключает Tick каждого врага. Это кэширование + оптимизация.",
          nodes: [
            {
              id: "n1",
              title: "Event BeginPlay",
              nodeType: "event",
              inputs: [],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 10,
              y: 90,
            },
            {
              id: "n2",
              title: "Get All Actors Of Class",
              subtitle: "BP_Enemy",
              nodeType: "function",
              inputs: [{ id: "exec", label: "Exec", type: "exec" }],
              outputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "actors", label: "Out Actors", type: "object" },
              ],
              x: 185,
              y: 65,
            },
            {
              id: "n3",
              title: "For Each Loop",
              nodeType: "flow",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "arr", label: "Array", type: "object" },
              ],
              outputs: [
                { id: "body", label: "Loop Body", type: "exec" },
                { id: "elem", label: "Array Element", type: "object" },
                { id: "done", label: "Completed", type: "exec" },
              ],
              x: 360,
              y: 55,
            },
            {
              id: "n4",
              title: "Set Actor Tick Enabled",
              nodeType: "function",
              inputs: [
                { id: "exec", label: "Exec", type: "exec" },
                { id: "target", label: "Target", type: "object" },
                { id: "enabled", label: "Enabled", type: "bool" },
              ],
              outputs: [{ id: "exec", label: "Exec", type: "exec" }],
              x: 540,
              y: 55,
            },
          ],
          solution: [
            { fromNodeId: "n1", fromPinId: "exec", toNodeId: "n2", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "exec", toNodeId: "n3", toPinId: "exec" },
            { fromNodeId: "n2", fromPinId: "actors", toNodeId: "n3", toPinId: "arr" },
            { fromNodeId: "n3", fromPinId: "body", toNodeId: "n4", toPinId: "exec" },
            { fromNodeId: "n3", fromPinId: "elem", toNodeId: "n4", toPinId: "target" },
          ],
        },
      },
    ],
  },
];

export const ACHIEVEMENTS = [
  {
    id: "ach_first_lesson",
    title: "Первый шаг",
    description: "Завершите первый урок",
    icon: "star",
    condition: (stats: { totalLessons: number }) => stats.totalLessons >= 1,
  },
  {
    id: "ach_five_lessons",
    title: "Студент Blueprint",
    description: "Завершите 5 уроков",
    icon: "book-open",
    condition: (stats: { totalLessons: number }) => stats.totalLessons >= 5,
  },
  {
    id: "ach_all_beginner",
    title: "Основы заложены",
    description: "Завершите все уроки уровня Начинающий",
    icon: "award",
    condition: (stats: { totalLessons: number }) => stats.totalLessons >= 4,
  },
  {
    id: "ach_streak_3",
    title: "На волне",
    description: "Поддерживайте серию 3 дня подряд",
    icon: "zap",
    condition: (stats: { streak: number }) => stats.streak >= 3,
  },
  {
    id: "ach_streak_7",
    title: "Неделя Blueprint",
    description: "Серия 7 дней подряд",
    icon: "trending-up",
    condition: (stats: { streak: number }) => stats.streak >= 7,
  },
  {
    id: "ach_perfect_quiz",
    title: "Идеальный результат",
    description: "Пройдите тест на 100%",
    icon: "check-circle",
    condition: (stats: { perfectQuizzes: number }) => stats.perfectQuizzes >= 1,
  },
  {
    id: "ach_xp_500",
    title: "Опытный",
    description: "Накопите 500 XP",
    icon: "activity",
    condition: (stats: { xp: number }) => stats.xp >= 500,
  },
  {
    id: "ach_xp_2000",
    title: "Мастер Blueprint",
    description: "Накопите 2000 XP",
    icon: "cpu",
    condition: (stats: { xp: number }) => stats.xp >= 2000,
  },
];

export const REAL_WORLD_EXAMPLES = [
  {
    id: "ex_001",
    title: "Вращающийся Actor",
    category: "Движение",
    description: "Плавно вращающийся объект с настраиваемой скоростью — идеально для монет, бонусов, декораций",
    difficulty: "beginner" as Difficulty,
    color: "#00D4FF",
    steps: [
      "Создайте новый Blueprint Actor",
      "Добавьте Static Mesh компонент",
      "В Event Tick: Add Actor World Rotation",
      "Создайте переменную RotationSpeed (Float, default 90.0, Instance Editable = true)",
      "Умножьте RotationSpeed на Delta Seconds (Get World Delta Seconds)",
      "Передайте результат в пин Z компонента Delta Rotation",
    ],
    nodes: ["Event Tick", "Add Actor World Rotation", "Get World Delta Seconds", "Make Rotator", "Float * Float"],
    tags: ["вращение", "Tick", "физика"],
  },
  {
    id: "ex_002",
    title: "Открывающаяся дверь",
    category: "Взаимодействие",
    description: "Дверь открывается при входе игрока и закрывается при выходе — классический триггер-оверлап",
    difficulty: "basic" as Difficulty,
    color: "#39D353",
    steps: [
      "Создайте BP_Door с Door Mesh и Box Collision",
      "На OnComponentBeginOverlap: Cast To BP_ThirdPersonCharacter",
      "При успешном Cast: Timeline (Float Track 0→1 за 0.5 сек, Ease In/Out)",
      "Timeline Update: Set Relative Rotation двери (0 → 90 градусов через Lerp Rotator)",
      "OnComponentEndOverlap: вызовите Reverse на той же Timeline",
    ],
    nodes: ["Box Collision", "Cast To Character", "Timeline", "Set Relative Rotation", "Lerp (Rotator)"],
    tags: ["дверь", "overlap", "timeline"],
  },
  {
    id: "ex_003",
    title: "Двойной прыжок",
    category: "Движение",
    description: "Система двойного прыжка с ограничением количества прыжков и визуальными эффектами",
    difficulty: "intermediate" as Difficulty,
    color: "#FFB800",
    steps: [
      "Откройте BP_ThirdPersonCharacter",
      "Создайте переменную JumpCount (Integer, default 0)",
      "В InputAction Jump: Branch → JumpCount < 2 → True: Jump + JumpCount++",
      "В Event Landed: Set JumpCount = 0",
      "Добавьте Spawn Emitter At Location в месте прыжка",
      "Опционально: Play Sound (Cue воздушного прыжка) через Spawn Sound at Location",
    ],
    nodes: ["Jump", "Launch Character", "Landed", "Branch", "Integer + Integer", "Spawn Emitter"],
    tags: ["прыжок", "персонаж", "движение"],
  },
  {
    id: "ex_004",
    title: "Подбираемый предмет",
    category: "Взаимодействие",
    description: "Предмет подбирается при касании: эффекты, звук, уничтожение, плавающая анимация",
    difficulty: "basic" as Difficulty,
    color: "#7B4FFF",
    steps: [
      "Blueprint Actor с Mesh и Sphere Collision (No Physics Simulation)",
      "Event ActorBeginOverlap → Cast To Character",
      "При успехе: вызвать функцию AddItem на Character (через Interface)",
      "Spawn Sound At Location + Spawn Emitter At Location",
      "Destroy Actor",
      "Парение: Event Tick → Sin(Total Elapsed Time) * 20 → Set Actor Z Location",
    ],
    nodes: ["Sphere Collision", "Cast To Character", "Spawn Sound", "Spawn Emitter", "Destroy Actor"],
    tags: ["pickup", "инвентарь", "эффекты"],
  },
  {
    id: "ex_005",
    title: "HUD с полоской здоровья",
    category: "UI",
    description: "Widget Blueprint с динамической полоской HP, привязанной к персонажу через Event Dispatcher",
    difficulty: "intermediate" as Difficulty,
    color: "#FF4757",
    steps: [
      "Создайте WBP_HealthBar (Widget Blueprint)",
      "Добавьте Progress Bar + Text Block для значения HP",
      "Progress Bar Percent: привязать (Bind) к функции CurrentHP / MaxHP",
      "Text: привязать к ToString(CurrentHP) + ' / ' + ToString(MaxHP)",
      "В BP_Character BeginPlay: Create WBP_HealthBar Widget → Add to Viewport",
      "Сохраните ссылку на Widget → при изменении HP вызовите UpdateHealth",
    ],
    nodes: ["Progress Bar Binding", "Create Widget", "Add to Viewport", "Text Binding", "Float / Float"],
    tags: ["ui", "hud", "health"],
  },
  {
    id: "ex_006",
    title: "Враг с патрулированием",
    category: "ИИ",
    description: "ИИ-враг патрулирует между точками, видит игрока и начинает преследование",
    difficulty: "advanced" as Difficulty,
    color: "#FF6B35",
    steps: [
      "Создайте BP_Enemy с AIController и Behavior Tree",
      "Добавьте массив PatrolPoints (Array of Actor Reference, Instance Editable)",
      "BTTask_Patrol: Get следующую точку по индексу, Move To Actor",
      "PawnSensing Component → OnSeePawn → Set BB Key 'PlayerRef'",
      "Behavior Tree: Selector → [Sequence(Chase) → Selector(Patrol)]",
      "Decorator IsSet(PlayerRef) на Chase ветке",
      "При потере игрока (Lost Sight): Clear BB Key → вернуться к патрулированию",
    ],
    nodes: ["Behavior Tree", "BTTask", "PawnSensing", "Move To Actor", "Blackboard", "Decorator"],
    tags: ["ai", "патрулирование", "blackboard"],
  },
  {
    id: "ex_007",
    title: "Система сохранения",
    category: "Геймплей",
    description: "Полноценное сохранение прогресса: очки, уровень, инвентарь — через SaveGame Blueprint",
    difficulty: "intermediate" as Difficulty,
    color: "#A855F7",
    steps: [
      "Blueprint Class → SaveGame → добавьте переменные: Score (Int), Level (Int), HasSword (Bool)",
      "Функция SaveProgress: Create Save Game Object → Cast To MySaveGame → заполнить поля",
      "Save Game to Slot ('Slot1', 0) → выводить Print String при успехе",
      "Функция LoadProgress: Does Save Game Exist → Load Game from Slot → Cast To MySaveGame",
      "Применить сохранённые данные к персонажу/GameMode",
      "Вызывайте SaveProgress при смерти, выходе, прохождении чекпоинта",
    ],
    nodes: ["Create Save Game Object", "Save Game to Slot", "Load Game from Slot", "Cast To SaveGame", "Does Save Game Exist"],
    tags: ["сохранение", "persistence", "данные"],
  },
  {
    id: "ex_008",
    title: "Таймер обратного отсчёта",
    category: "Геймплей",
    description: "UI-таймер с обратным отсчётом, завершающий раунд при достижении нуля",
    difficulty: "basic" as Difficulty,
    color: "#00D4FF",
    steps: [
      "В GameMode: переменная TimeRemaining (Float, default 60.0)",
      "BeginPlay → Set Timer by Event: каждую секунду вызывать OnTick",
      "OnTick: TimeRemaining -= 1.0 → обновить HUD (Event Dispatcher OnTimeUpdated)",
      "Branch: TimeRemaining <= 0 → Clear Timer → вызвать OnRoundEnd",
      "В WBP_HUD: Text привязан к ToString(TimeRemaining)",
      "Мигание текста через анимацию UMG при TimeRemaining < 10",
    ],
    nodes: ["Set Timer by Event", "Clear Timer", "Event Dispatcher", "Custom Event", "Branch", "Text Binding"],
    tags: ["таймер", "gamemode", "ui"],
  },
  {
    id: "ex_009",
    title: "Дэш (рывок)",
    category: "Движение",
    description: "Рывок персонажа вперёд с кулдауном и визуальным следом",
    difficulty: "intermediate" as Difficulty,
    color: "#39D353",
    steps: [
      "В BP_Character: переменная CanDash (Bool, default true)",
      "InputAction Dash: Branch (CanDash) → True: выполнить рывок",
      "Get Actor Forward Vector → * 2000 → Launch Character (XYOverride=true)",
      "CanDash = false → Spawn Trail Effect (Niagara System)",
      "Set Timer by Function Name 'ResetDash' через 1.5 сек",
      "ResetDash: CanDash = true → опционально Play Sound",
    ],
    nodes: ["Launch Character", "Get Forward Vector", "Float * Vector", "Set Timer", "Branch", "Spawn Niagara System"],
    tags: ["dash", "движение", "cooldown"],
  },
  {
    id: "ex_010",
    title: "Система урона",
    category: "Геймплей",
    description: "Нанесение и получение урона через Blueprint Interface — правильный архитектурный паттерн",
    difficulty: "intermediate" as Difficulty,
    color: "#FF4757",
    steps: [
      "Создайте Blueprint Interface IDamageable с функцией TakeDamage(Amount: Float)",
      "В BP_Enemy: Class Settings → Interfaces → Add IDamageable",
      "Реализуйте Event TakeDamage: Health -= Amount → Branch (Health <= 0) → Die",
      "В BP_Projectile OnHit: вызовите TakeDamage на Hit Actor (без Cast!)",
      "Die функция: Play Death Animation → Set Life Span 2.0 → Spawn Loot",
      "Опционально: Apply Radial Damage для взрывов",
    ],
    nodes: ["Blueprint Interface", "Apply Damage", "Event Take Damage", "Apply Radial Damage", "Health Float", "Die"],
    tags: ["урон", "health", "interface"],
  },
  {
    id: "ex_011",
    title: "Интерактивный объект (E)",
    category: "Взаимодействие",
    description: "Объект с подсказкой 'Нажмите E', активирующийся через Line Trace из камеры игрока",
    difficulty: "intermediate" as Difficulty,
    color: "#FFB800",
    steps: [
      "Создайте Blueprint Interface IInteractable с функцией Interact(Caller: Actor)",
      "В BP_Character Event Tick: Line Trace by Channel из камеры (1.5м вперёд)",
      "При Hit: Cast To IInteractable → если успешно, показать WBP_InteractHint",
      "InputAction Interact (E): вызовите Interact на сохранённом FocusedActor",
      "В BP_Button реализуйте Event Interact: Toggle IsOpen, воспроизвести анимацию",
    ],
    nodes: ["Line Trace", "Blueprint Interface", "Interact", "Widget Show/Hide", "Cast To Interface"],
    tags: ["interaction", "line trace", "E key"],
  },
  {
    id: "ex_012",
    title: "Портал перехода",
    category: "Геймплей",
    description: "Портал телепортирует игрока на другой уровень или в другую точку карты",
    difficulty: "basic" as Difficulty,
    color: "#7B4FFF",
    steps: [
      "Blueprint Actor: Box Collision + Mesh (полупрозрачный материал)",
      "Переменная TargetLevelName (Name, Instance Editable) или TargetTransform (Transform)",
      "OnComponentBeginOverlap → Cast To Character → Play Fade Animation",
      "Если смена уровня: Open Level by Name (TargetLevelName)",
      "Если телепорт на карте: Teleport (TargetTransform.Location, TargetTransform.Rotation)",
      "Spawn Portal FX (Niagara) по обе стороны портала",
    ],
    nodes: ["Box Collision", "Open Level", "Teleport", "Spawn Niagara", "Set View Target", "Fade Out"],
    tags: ["портал", "телепорт", "level"],
  },
  {
    id: "ex_013",
    title: "Пружинящая платформа",
    category: "Движение",
    description: "Платформа, подбрасывающая игрока вверх с анимацией сжатия",
    difficulty: "beginner" as Difficulty,
    color: "#39D353",
    steps: [
      "Blueprint Actor: Static Mesh Platform + Box Collision",
      "OnComponentHit → Cast To Character → проверить Hit Normal.Z > 0.5 (сверху)",
      "Launch Character: вверх 1500 + вперёд 100 единиц",
      "Timeline анимация: платформа сжимается (ScaleZ 1.0 → 0.6 → 1.2 → 1.0) за 0.4 сек",
      "Play Sound (пружинистый звук)",
    ],
    nodes: ["OnComponentHit", "Launch Character", "Timeline", "Set Relative Scale 3D", "Cast To Character"],
    tags: ["прыжок", "платформа", "physics"],
  },
  {
    id: "ex_014",
    title: "Inventory Array",
    category: "Геймплей",
    description: "Простой массив инвентаря с добавлением, удалением и проверкой предметов",
    difficulty: "intermediate" as Difficulty,
    color: "#A855F7",
    steps: [
      "В BP_Character: переменная Inventory (Array of Name или структура FItemData)",
      "Функция AddItem(ItemName: Name): Branch (Inventory.Length < MaxSlots) → Add (Array Add Unique)",
      "Функция RemoveItem: Array Remove Item + обновить HUD",
      "Функция HasItem: Array Contains → возвращает Bool",
      "При подборе предмета: вызвать AddItem → если True, показать '+Item' тост",
      "Обновлять инвентарный виджет через Event Dispatcher OnInventoryChanged",
    ],
    nodes: ["Array Add", "Array Remove", "Array Contains", "Array Length", "Branch", "Event Dispatcher"],
    tags: ["инвентарь", "array", "данные"],
  },
  {
    id: "ex_015",
    title: "Диалоговая система",
    category: "UI",
    description: "Диалоговые окна с NPC: текст печатается посимвольно, выбор ответов",
    difficulty: "advanced" as Difficulty,
    color: "#FF6B35",
    steps: [
      "Создайте структуру FDialogLine: Speaker (Name), Text (String), Responses (Array of String)",
      "В NPC BP: массив DialogLines, переменная CurrentLineIndex",
      "При взаимодействии (E): Create WBP_Dialog → Add to Viewport → передать FirstLine",
      "WBP_Dialog: SetTimer By Event каждые 0.05 сек печатать по одному символу",
      "Кнопка Continue: перейти к следующей строке или закрыть диалог",
      "Response Buttons: создать динамически через ForEach + Create Widget",
    ],
    nodes: ["Struct", "Array of Struct", "Set Timer", "String Length", "Mid (String)", "Create Widget", "For Each"],
    tags: ["диалог", "npc", "ui", "struct"],
  },
  {
    id: "ex_016",
    title: "Стрельба с пулями",
    category: "Геймплей",
    description: "Оружие стреляет пулями — Spawn Actor, начальная скорость, попадание, урон",
    difficulty: "basic" as Difficulty,
    color: "#FF4757",
    steps: [
      "Создайте BP_Bullet: Static Mesh + Projectile Movement Component",
      "Projectile Movement: Initial Speed=3000, Max Speed=3000, bShouldBounce=false",
      "В BP_Weapon InputAction Fire: Get Muzzle Socket Transform → Spawn Actor BP_Bullet",
      "Установить Initial Velocity из Socket Forward Vector * Speed",
      "В BP_Bullet OnComponentHit: Apply Damage на Hit Actor + Spawn Impact FX + Destroy Actor",
      "Добавьте Set Life Span 3.0 в BeginPlay чтобы пули исчезали",
    ],
    nodes: ["Spawn Actor", "Projectile Movement", "On Component Hit", "Apply Damage", "Destroy Actor", "Set Life Span"],
    tags: ["стрельба", "пуля", "projectile"],
  },
  {
    id: "ex_017",
    title: "Камера от третьего лица с зумом",
    category: "Движение",
    description: "Зум камеры колёсиком мыши с плавной интерполяцией Spring Arm длины",
    difficulty: "basic" as Difficulty,
    color: "#00D4FF",
    steps: [
      "В BP_Character: переменная TargetArmLength (Float, default 400)",
      "InputAxis MouseWheel: TargetArmLength += Axis * -50 → Clamp(200, 800)",
      "Event Tick: Spring Arm Target Arm Length → Interp To (TargetArmLength, Speed=10)",
      "Set Target Arm Length на Spring Arm Component",
      "Опционально: ограничить через Clamp(Min=150, Max=600)",
    ],
    nodes: ["Spring Arm", "Interp To", "Clamp", "Set Target Arm Length", "Mouse Wheel Axis", "Event Tick"],
    tags: ["камера", "зум", "spring arm"],
  },
  {
    id: "ex_018",
    title: "Взрывная бочка",
    category: "Геймплей",
    description: "Бочка взрывается при попадании: Apply Radial Damage, взрывная волна, эффекты",
    difficulty: "intermediate" as Difficulty,
    color: "#FFB800",
    steps: [
      "BP_ExplosiveBarrel реализует IDamageable",
      "TakeDamage → Health -= Amount → Branch Health <= 0 → Explode",
      "Explode: Apply Radial Damage (BaseDamage=100, Radius=400, Origin=Actor Location)",
      "Add Radial Impulse → подбросить физические объекты рядом",
      "Spawn Niagara System (взрыв) + Spawn Sound",
      "Отключить Collision + скрыть Mesh → Set Life Span 5.0",
    ],
    nodes: ["Apply Radial Damage", "Add Radial Impulse", "Spawn Niagara", "Branch", "Set Life Span", "Set Visibility"],
    tags: ["взрыв", "физика", "damage"],
  },
  {
    id: "ex_019",
    title: "Шкала заряда (Charge Attack)",
    category: "Геймплей",
    description: "Удержание кнопки заряжает атаку — чем дольше держишь, тем мощнее удар",
    difficulty: "intermediate" as Difficulty,
    color: "#A855F7",
    steps: [
      "Переменная IsCharging (Bool), ChargeTime (Float)",
      "InputAction Attack Pressed: IsCharging = true",
      "Event Tick: Branch (IsCharging) → ChargeTime += Delta Seconds → Clamp(0, 3)",
      "Обновить HUD: Progress Bar = ChargeTime / 3.0 (через Event Dispatcher)",
      "InputAction Attack Released: IsCharging = false → Release(ChargeTime) → ChargeTime = 0",
      "Release: Damage = BaseDamage * (1 + ChargeTime * 2) → Launch Projectile с расчётным уроном",
    ],
    nodes: ["Input Pressed/Released", "Event Tick", "Clamp", "Float * Float", "Event Dispatcher", "Branch"],
    tags: ["charge", "атака", "input"],
  },
  {
    id: "ex_020",
    title: "Respawn после смерти",
    category: "Геймплей",
    description: "Персонаж умирает, исчезает и возрождается через 3 секунды на SpawnPoint",
    difficulty: "intermediate" as Difficulty,
    color: "#FF6B35",
    steps: [
      "В BP_Character функция Die: Disable Input → Play Death Montage → Collision Off",
      "Set Timer by Function Name 'Respawn' после 3.0 сек",
      "В GameMode: массив SpawnPoints (Player Start акторы)",
      "Respawn: выбрать случайный SpawnPoint → Set Actor Transform → Re-Enable Input",
      "Restore Health = MaxHealth → обновить HUD через Event Dispatcher",
      "Spawn Respawn FX + Play Invulnerability Effect на 2 сек",
    ],
    nodes: ["Disable Input", "Set Timer", "Get Random Element", "Set Actor Transform", "Enable Input", "Event Dispatcher"],
    tags: ["respawn", "смерть", "gamemode"],
  },
];

export const EXAMPLES = REAL_WORLD_EXAMPLES;
