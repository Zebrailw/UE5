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

export const EXAMPLES = [
  {
    id: "ex_001",
    title: "Вращающийся Actor",
    description: "Плавно вращающийся объект с настраиваемой скоростью",
    difficulty: "beginner" as Difficulty,
    color: "#00D4FF",
    steps: [
      "Создайте новый Blueprint Actor",
      "Добавьте Static Mesh компонент",
      "В Event Tick: Add Actor World Rotation",
      "Создайте переменную RotationSpeed (Float, default 90.0)",
      "Умножьте RotationSpeed на Delta Seconds (Get World Delta Seconds)",
      "Передайте результат в пин Z компонента Delta Rotation",
      "Установите Instance Editable = true для настройки на уровне",
    ],
    nodes: ["Event Tick", "Add Actor World Rotation", "Get World Delta Seconds", "Make Rotator", "Float * Float"],
    tags: ["вращение", "Tick", "физика"],
  },
  {
    id: "ex_002",
    title: "Открывающаяся дверь",
    description: "Дверь открывается при входе игрока и закрывается при выходе",
    difficulty: "basic" as Difficulty,
    color: "#39D353",
    steps: [
      "Создайте BP_Door с Door Mesh и Box Collision",
      "На OnComponentBeginOverlap: Cast To BP_ThirdPersonCharacter",
      "При успешном Cast: Timeline (Float Track 0→1 за 0.5 сек)",
      "Timeline Update: Set Relative Rotation двери (0 → 90 градусов)",
      "OnComponentEndOverlap: Timeline Reverse",
      "Используйте Lerp с Alpha из Timeline для плавности",
    ],
    nodes: ["Box Collision", "Cast To Character", "Timeline", "Set Relative Rotation", "Lerp (Rotator)"],
    tags: ["дверь", "overlap", "timeline"],
  },
  {
    id: "ex_003",
    title: "Двойной прыжок",
    description: "Система двойного прыжка с ограничением и анимацией",
    difficulty: "intermediate" as Difficulty,
    color: "#FFB800",
    steps: [
      "Откройте BP_ThirdPersonCharacter",
      "Создайте переменную JumpCount (Integer)",
      "В событии Jump: Branch (JumpCount < 2)",
      "При True: Launch Character вертикально + JumpCount++",
      "В событии Landed: Reset JumpCount = 0",
      "Добавьте эффект частиц через Spawn Emitter At Location",
    ],
    nodes: ["Jump", "Launch Character", "Landed", "Branch", "Integer + Integer", "Spawn Emitter"],
    tags: ["прыжок", "персонаж", "движение"],
  },
  {
    id: "ex_004",
    title: "Подбираемый предмет",
    description: "Предмет, который подбирает игрок с эффектами и звуком",
    difficulty: "basic" as Difficulty,
    color: "#7B4FFF",
    steps: [
      "Blueprint Actor с Mesh и Sphere Collision",
      "Event ActorBeginOverlap → Cast To Character",
      "При успехе: добавьте предмет в инвентарь персонажа",
      "Spawn звуковой эффект (Spawn Sound At Location)",
      "Spawn визуальный эффект (Spawn Emitter At Location)",
      "Destroy Actor — уничтожить предмет",
      "Анимация: вращение в Tick + синусоидальное парение через Sin(Time)",
    ],
    nodes: ["Sphere Collision", "Cast To Character", "Spawn Sound", "Spawn Emitter", "Destroy Actor"],
    tags: ["pickup", "инвентарь", "эффекты"],
  },
  {
    id: "ex_005",
    title: "Простой UI здоровья",
    description: "HUD с полоской здоровья, привязанной к персонажу",
    difficulty: "intermediate" as Difficulty,
    color: "#FF4757",
    steps: [
      "Создайте WBP_HealthBar (Widget Blueprint)",
      "Добавьте Progress Bar, Text Block для значения HP",
      "Привяжите Percent к функции: CurrentHP / MaxHP",
      "Привяжите Text к функции: ToString(CurrentHP) + '/' + ToString(MaxHP)",
      "В BP_Character BeginPlay: Create WBP_HealthBar → Add to Viewport",
      "Сохраните ссылку на виджет для последующего обновления",
    ],
    nodes: ["Progress Bar Binding", "Create Widget", "Add to Viewport", "Text Binding", "Float / Float"],
    tags: ["ui", "hud", "health"],
  },
  {
    id: "ex_006",
    title: "Враг с патрулированием",
    description: "ИИ-враг, патрулирующий между точками и реагирующий на игрока",
    difficulty: "advanced" as Difficulty,
    color: "#FF6B35",
    steps: [
      "Создайте BP_Enemy с AIController",
      "Добавьте массив PatrolPoints (массив Actor-ссылок)",
      "В AIController BeginPlay: Run Behavior Tree",
      "BTTask_Patrol: Get следующую точку, MoveToActor",
      "PawnSensing Component: OnSeePawn → установить PlayerRef в Blackboard",
      "Decorator на Chase ветке: Is Blackboard Key Set (PlayerRef)",
      "При потере игрока: Clear Blackboard Value → вернуться к патрулированию",
    ],
    nodes: ["Behavior Tree", "BTTask", "PawnSensing", "Move To Actor", "Blackboard", "Decorator"],
    tags: ["ai", "патрулирование", "blackboard"],
  },
];
