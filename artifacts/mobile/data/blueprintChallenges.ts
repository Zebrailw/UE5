import { BuildChallenge } from "./curriculum";

export interface BlueprintChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "Beginner" | "Basic" | "Intermediate" | "Advanced" | "Expert";
  xpReward: number;
  buildChallenge: BuildChallenge;
}

const DIFFICULTIES = ["Beginner", "Basic", "Intermediate", "Advanced", "Expert"] as const;

export const BLUEPRINT_CHALLENGES: BlueprintChallenge[] = [
  {
    id: "bc001",
    title: "Привет, Blueprint!",
    description: "Соедини событие старта игры с выводом текста в лог — классический первый Blueprint.",
    category: "Основы",
    difficulty: "Beginner",
    xpReward: 30,
    buildChallenge: {
      instruction: "Соедини выходной пин Exec у «Event BeginPlay» с входным пином Exec у «Print String».",
      hint: "Нажми на белый треугольник на правой стороне BeginPlay, потом на треугольник слева у Print String.",
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
          subtitle: "Hello Blueprint!",
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
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n2", toPinId: "exec_in" },
      ],
    },
  },
  {
    id: "bc002",
    title: "Прыжок персонажа",
    description: "Соедини Input Event прыжка с функцией Jump персонажа.",
    category: "Движение",
    difficulty: "Beginner",
    xpReward: 40,
    buildChallenge: {
      instruction: "Соедини событие IA_Jump → Cast To Character, затем Cast To Character → Jump.",
      hint: "Exec соединяется с Exec. Cast нужен для получения функций персонажа.",
      nodes: [
        {
          id: "n1",
          title: "IA_Jump",
          subtitle: "Started",
          nodeType: "event",
          inputs: [],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10,
          y: 60,
        },
        {
          id: "n2",
          title: "Cast To Character",
          nodeType: "flow",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "obj_in", label: "Object", type: "object" },
          ],
          outputs: [
            { id: "exec_success", label: "Success", type: "exec" },
            { id: "char_out", label: "Character", type: "object" },
          ],
          x: 190,
          y: 40,
        },
        {
          id: "n3",
          title: "Jump",
          nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "self_in", label: "Target", type: "object" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 390,
          y: 60,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n2", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "exec_success", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "char_out", toNodeId: "n3", toPinId: "self_in" },
      ],
    },
  },
  {
    id: "bc003",
    title: "Проверка здоровья",
    description: "Используй Branch чтобы проверить — умер ли персонаж (Health ≤ 0).",
    category: "Геймплей",
    difficulty: "Beginner",
    xpReward: 50,
    buildChallenge: {
      instruction: "Соедини Float <= Float (здоровье ≤ 0) с пином Condition у Branch. Затем соедини True-выход с Die.",
      hint: "Пин Condition ожидает булевое значение (bool). Нода <= возвращает bool.",
      nodes: [
        {
          id: "n1",
          title: "On Damage Received",
          nodeType: "event",
          inputs: [],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10,
          y: 80,
        },
        {
          id: "n2",
          title: "Float <= Float",
          subtitle: "Health ≤ 0",
          nodeType: "value",
          inputs: [
            { id: "a_in", label: "Health", type: "float" },
            { id: "b_in", label: "0.0", type: "float" },
          ],
          outputs: [{ id: "bool_out", label: "Return", type: "bool" }],
          x: 170,
          y: 140,
        },
        {
          id: "n3",
          title: "Branch",
          nodeType: "flow",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "cond_in", label: "Condition", type: "bool" },
          ],
          outputs: [
            { id: "true_out", label: "True", type: "exec" },
            { id: "false_out", label: "False", type: "exec" },
          ],
          x: 170,
          y: 40,
        },
        {
          id: "n4",
          title: "Die",
          subtitle: "Custom Event",
          nodeType: "function",
          inputs: [{ id: "exec_in", label: "Exec", type: "exec" }],
          outputs: [],
          x: 360,
          y: 30,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "bool_out", toNodeId: "n3", toPinId: "cond_in" },
        { fromNodeId: "n3", fromPinId: "true_out", toNodeId: "n4", toPinId: "exec_in" },
      ],
    },
  },
  {
    id: "bc004",
    title: "Задержка взрыва",
    description: "Активация → задержка 3 секунды → взрыв. Используй ноду Delay.",
    category: "Поток выполнения",
    difficulty: "Beginner",
    xpReward: 40,
    buildChallenge: {
      instruction: "Соедини Event Activate → Delay → Explode по цепочке Exec.",
      hint: "Delay возвращает Exec-пин Completed — он срабатывает через указанное время.",
      nodes: [
        {
          id: "n1",
          title: "Event Activate",
          nodeType: "event",
          inputs: [],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10,
          y: 70,
        },
        {
          id: "n2",
          title: "Delay",
          subtitle: "3.0 sec",
          nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "dur_in", label: "Duration", type: "float" },
          ],
          outputs: [{ id: "completed", label: "Completed", type: "exec" }],
          x: 190,
          y: 50,
        },
        {
          id: "n3",
          title: "Explode",
          subtitle: "Custom Event",
          nodeType: "function",
          inputs: [{ id: "exec_in", label: "Exec", type: "exec" }],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 380,
          y: 60,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n2", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "completed", toNodeId: "n3", toPinId: "exec_in" },
      ],
    },
  },
  {
    id: "bc005",
    title: "Переменная скорости",
    description: "Получи переменную WalkSpeed и передай её в Set Max Walk Speed.",
    category: "Переменные",
    difficulty: "Basic",
    xpReward: 50,
    buildChallenge: {
      instruction: "Соедини Get WalkSpeed (float) с пином Max Walk Speed у функции Set Max Walk Speed.",
      hint: "Переменная возвращает float. Вход Max Walk Speed тоже ожидает float.",
      nodes: [
        {
          id: "n1",
          title: "Event BeginPlay",
          nodeType: "event",
          inputs: [],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10,
          y: 70,
        },
        {
          id: "n2",
          title: "Get WalkSpeed",
          subtitle: "Variable",
          nodeType: "variable",
          inputs: [],
          outputs: [{ id: "val_out", label: "Walk Speed", type: "float" }],
          x: 170,
          y: 140,
        },
        {
          id: "n3",
          title: "Set Max Walk Speed",
          nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "speed_in", label: "Max Walk Speed", type: "float" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 180,
          y: 40,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "val_out", toNodeId: "n3", toPinId: "speed_in" },
      ],
    },
  },
  {
    id: "bc006",
    title: "Спавн Актора",
    description: "При нажатии кнопки создай (заспавни) новый Actor в мире.",
    category: "Геймплей",
    difficulty: "Basic",
    xpReward: 55,
    buildChallenge: {
      instruction: "Соедини IA_SpawnActor Exec → Spawn Actor from Class. Подключи Get Actor Transform к Spawn Transform.",
      hint: "Spawn Actor нужен Transform для позиции. Get Actor Transform возвращает Transform текущего актора.",
      nodes: [
        {
          id: "n1",
          title: "IA_Spawn",
          subtitle: "Started",
          nodeType: "event",
          inputs: [],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10,
          y: 60,
        },
        {
          id: "n2",
          title: "Get Actor Transform",
          nodeType: "value",
          inputs: [],
          outputs: [{ id: "xform_out", label: "Return", type: "vector" }],
          x: 170,
          y: 140,
        },
        {
          id: "n3",
          title: "Spawn Actor from Class",
          nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "class_in", label: "Class", type: "object" },
            { id: "xform_in", label: "Spawn Transform", type: "vector" },
          ],
          outputs: [
            { id: "exec_out", label: "Exec", type: "exec" },
            { id: "actor_out", label: "Return Value", type: "object" },
          ],
          x: 180,
          y: 30,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "xform_out", toNodeId: "n3", toPinId: "xform_in" },
      ],
    },
  },
  {
    id: "bc007",
    title: "Воспроизведение звука",
    description: "При попадании пули воспроизведи звук в точке контакта.",
    category: "Аудио",
    difficulty: "Basic",
    xpReward: 45,
    buildChallenge: {
      instruction: "Соедини Event On Hit → Play Sound at Location. Hit Location → Location у Play Sound.",
      hint: "On Hit даёт Hit Location — это Vector. Play Sound at Location принимает Location как Vector.",
      nodes: [
        {
          id: "n1",
          title: "Event On Hit",
          nodeType: "event",
          inputs: [],
          outputs: [
            { id: "exec_out", label: "Exec", type: "exec" },
            { id: "loc_out", label: "Hit Location", type: "vector" },
          ],
          x: 10,
          y: 50,
        },
        {
          id: "n2",
          title: "Play Sound at Location",
          nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "sound_in", label: "Sound", type: "object" },
            { id: "loc_in", label: "Location", type: "vector" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 220,
          y: 40,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n2", toPinId: "exec_in" },
        { fromNodeId: "n1", fromPinId: "loc_out", toNodeId: "n2", toPinId: "loc_in" },
      ],
    },
  },
  {
    id: "bc008",
    title: "Нанесение урона",
    description: "Применяем урон к Актору при попадании. Используй Apply Damage.",
    category: "Боёвка",
    difficulty: "Intermediate",
    xpReward: 65,
    buildChallenge: {
      instruction: "Соедини Hit Actor из Break Hit Result в Target пин Apply Damage. Damage Amount соедини с Damage.",
      hint: "Break Hit Result разбирает структуру попадания. Hit Actor — это объект, которому наносим урон.",
      nodes: [
        {
          id: "n1",
          title: "Event On Hit",
          nodeType: "event",
          inputs: [],
          outputs: [
            { id: "exec_out", label: "Exec", type: "exec" },
            { id: "hit_out", label: "Hit Result", type: "object" },
          ],
          x: 10,
          y: 60,
        },
        {
          id: "n2",
          title: "Break Hit Result",
          nodeType: "value",
          inputs: [{ id: "hit_in", label: "Hit Result", type: "object" }],
          outputs: [
            { id: "actor_out", label: "Hit Actor", type: "object" },
            { id: "loc_out", label: "Hit Location", type: "vector" },
          ],
          x: 170,
          y: 100,
        },
        {
          id: "n3",
          title: "Apply Damage",
          nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "target_in", label: "Damaged Actor", type: "object" },
            { id: "dmg_in", label: "Base Damage", type: "float" },
          ],
          outputs: [
            { id: "exec_out", label: "Exec", type: "exec" },
            { id: "dmg_out", label: "Actual Damage", type: "float" },
          ],
          x: 370,
          y: 40,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n1", fromPinId: "hit_out", toNodeId: "n2", toPinId: "hit_in" },
        { fromNodeId: "n2", fromPinId: "actor_out", toNodeId: "n3", toPinId: "target_in" },
      ],
    },
  },
  {
    id: "bc009",
    title: "Таймер и событие",
    description: "Создай повторяющийся таймер который каждую секунду вызывает функцию.",
    category: "Поток выполнения",
    difficulty: "Intermediate",
    xpReward: 60,
    buildChallenge: {
      instruction: "Соедини BeginPlay Exec → Set Timer by Function Name. Looping=true для бесконечного повтора.",
      hint: "Set Timer by Function Name принимает Name (имя функции как строку) и Rate (интервал в секундах).",
      nodes: [
        {
          id: "n1",
          title: "Event BeginPlay",
          nodeType: "event",
          inputs: [],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10,
          y: 60,
        },
        {
          id: "n2",
          title: "Set Timer by Function Name",
          nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "obj_in", label: "Object", type: "object" },
            { id: "name_in", label: "Function Name", type: "string" },
            { id: "rate_in", label: "Time", type: "float" },
            { id: "loop_in", label: "Looping", type: "bool" },
          ],
          outputs: [
            { id: "exec_out", label: "Exec", type: "exec" },
            { id: "handle_out", label: "Return Handle", type: "object" },
          ],
          x: 190,
          y: 30,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n2", toPinId: "exec_in" },
      ],
    },
  },
  {
    id: "bc010",
    title: "Вектор движения камеры",
    description: "Получи направление камеры и передай в Add Movement Input для стрейфа.",
    category: "Движение",
    difficulty: "Intermediate",
    xpReward: 70,
    buildChallenge: {
      instruction: "Соедини Get Control Rotation → Get Right Vector → Multiply (axis value) → Add Movement Input.",
      hint: "Get Right Vector возвращает вектор вправо. Умножь на ось ввода (−1 до 1) для стрейфа.",
      nodes: [
        {
          id: "n1",
          title: "IA_Move",
          subtitle: "Axis X (Right)",
          nodeType: "event",
          inputs: [],
          outputs: [
            { id: "exec_out", label: "Exec", type: "exec" },
            { id: "axis_out", label: "Axis Value", type: "float" },
          ],
          x: 10,
          y: 60,
        },
        {
          id: "n2",
          title: "Get Control Rotation",
          nodeType: "value",
          inputs: [],
          outputs: [{ id: "rot_out", label: "Return", type: "vector" }],
          x: 10,
          y: 160,
        },
        {
          id: "n3",
          title: "Get Right Vector",
          nodeType: "value",
          inputs: [{ id: "rot_in", label: "Rotation", type: "vector" }],
          outputs: [{ id: "vec_out", label: "Return", type: "vector" }],
          x: 175,
          y: 155,
        },
        {
          id: "n4",
          title: "Add Movement Input",
          nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "dir_in", label: "World Direction", type: "vector" },
            { id: "scale_in", label: "Scale Value", type: "float" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 360,
          y: 40,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n4", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "rot_out", toNodeId: "n3", toPinId: "rot_in" },
        { fromNodeId: "n3", fromPinId: "vec_out", toNodeId: "n4", toPinId: "dir_in" },
        { fromNodeId: "n1", fromPinId: "axis_out", toNodeId: "n4", toPinId: "scale_in" },
      ],
    },
  },
  {
    id: "bc011",
    title: "Открытие двери Timeline",
    description: "Используй Timeline для плавного открытия двери по оси Z.",
    category: "Взаимодействие",
    difficulty: "Intermediate",
    xpReward: 70,
    buildChallenge: {
      instruction: "Соедини Overlap → Timeline Play. Timeline Update → Set Relative Location с Z-значением.",
      hint: "Timeline Update вызывается каждый кадр. Float Value передаём в вертикальную координату двери.",
      nodes: [
        {
          id: "n1",
          title: "On Begin Overlap",
          nodeType: "event",
          inputs: [],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10,
          y: 60,
        },
        {
          id: "n2",
          title: "Open Door Timeline",
          nodeType: "function",
          inputs: [{ id: "play_in", label: "Play", type: "exec" }],
          outputs: [
            { id: "update_out", label: "Update", type: "exec" },
            { id: "float_out", label: "Float Value", type: "float" },
            { id: "finished_out", label: "Finished", type: "exec" },
          ],
          x: 190,
          y: 40,
        },
        {
          id: "n3",
          title: "Set Relative Location",
          nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "loc_in", label: "New Location (Z)", type: "vector" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 390,
          y: 40,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n2", toPinId: "play_in" },
        { fromNodeId: "n2", fromPinId: "update_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "float_out", toNodeId: "n3", toPinId: "loc_in" },
      ],
    },
  },
  {
    id: "bc012",
    title: "Сохранение игры",
    description: "Создай объект сохранения, запишите здоровье и сохрани на диск.",
    category: "Системы",
    difficulty: "Advanced",
    xpReward: 90,
    buildChallenge: {
      instruction: "Цепочка: Create Save Game Object → Cast to MySaveGame → Set Health Variable → Save Game to Slot.",
      hint: "Create Save Game Object создаёт экземпляр. Cast позволяет записывать переменные. Save Game to Slot — финальная запись.",
      nodes: [
        {
          id: "n1",
          title: "IA_Save",
          nodeType: "event",
          inputs: [],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10,
          y: 70,
        },
        {
          id: "n2",
          title: "Create Save Game Object",
          nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "class_in", label: "Save Game Class", type: "object" },
          ],
          outputs: [
            { id: "exec_out", label: "Exec", type: "exec" },
            { id: "save_out", label: "Return Value", type: "object" },
          ],
          x: 170,
          y: 50,
        },
        {
          id: "n3",
          title: "Cast to MySaveGame",
          nodeType: "flow",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "obj_in", label: "Object", type: "object" },
          ],
          outputs: [
            { id: "success_out", label: "Success", type: "exec" },
            { id: "cast_out", label: "As MySaveGame", type: "object" },
          ],
          x: 350,
          y: 50,
        },
        {
          id: "n4",
          title: "Save Game to Slot",
          nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "save_in", label: "Save Game Object", type: "object" },
            { id: "slot_in", label: "Slot Name", type: "string" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 370,
          y: 150,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n2", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "exec_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "save_out", toNodeId: "n3", toPinId: "obj_in" },
        { fromNodeId: "n3", fromPinId: "success_out", toNodeId: "n4", toPinId: "exec_in" },
        { fromNodeId: "n3", fromPinId: "cast_out", toNodeId: "n4", toPinId: "save_in" },
      ],
    },
  },
  {
    id: "bc013",
    title: "Загрузка уровня",
    description: "При нажатии кнопки загрузи новый уровень по имени.",
    category: "Системы",
    difficulty: "Basic",
    xpReward: 50,
    buildChallenge: {
      instruction: "Соедини IA_LoadLevel Exec → Open Level (by Name). Make Literal Name → Level Name.",
      hint: "Open Level by Name принимает имя уровня как Name. Make Literal Name создаёт константное значение.",
      nodes: [
        {
          id: "n1", title: "IA_LoadLevel", subtitle: "Started", nodeType: "event",
          inputs: [], outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10, y: 60,
        },
        {
          id: "n2", title: "Make Literal Name", subtitle: "\"Level_02\"", nodeType: "value",
          inputs: [], outputs: [{ id: "name_out", label: "Value", type: "string" }],
          x: 170, y: 140,
        },
        {
          id: "n3", title: "Open Level (by Name)", nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "name_in", label: "Level Name", type: "string" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 175, y: 40,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "name_out", toNodeId: "n3", toPinId: "name_in" },
      ],
    },
  },
  {
    id: "bc014",
    title: "Анимация атаки",
    description: "Воспроизведи монтаж анимации атаки при нажатии кнопки.",
    category: "Анимация",
    difficulty: "Basic",
    xpReward: 55,
    buildChallenge: {
      instruction: "Соедини IA_Attack → Get Mesh → Play Anim Montage. Montage пин — это ссылка на Attack_Montage.",
      hint: "Get Mesh возвращает компонент скелетной сетки. Play Anim Montage принимает Mesh и Montage.",
      nodes: [
        {
          id: "n1", title: "IA_Attack", subtitle: "Started", nodeType: "event",
          inputs: [], outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10, y: 60,
        },
        {
          id: "n2", title: "Get Mesh", nodeType: "value",
          inputs: [], outputs: [{ id: "mesh_out", label: "Return", type: "object" }],
          x: 170, y: 140,
        },
        {
          id: "n3", title: "Play Anim Montage", nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "mesh_in", label: "In Skeletal Mesh", type: "object" },
            { id: "mont_in", label: "Anim Montage", type: "object" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 175, y: 35,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "mesh_out", toNodeId: "n3", toPinId: "mesh_in" },
      ],
    },
  },
  {
    id: "bc015",
    title: "Физика толчка",
    description: "При попадании добавь физический импульс к объекту.",
    category: "Физика",
    difficulty: "Intermediate",
    xpReward: 65,
    buildChallenge: {
      instruction: "Соедини Event On Hit → Add Impulse. Hit Normal * -1 * Force → Impulse. Velocity Change = true.",
      hint: "Add Impulse добавляет мгновенный импульс. Множь вектор нормали на -1 чтобы толкнуть от удара.",
      nodes: [
        {
          id: "n1", title: "Event On Hit", nodeType: "event",
          inputs: [],
          outputs: [
            { id: "exec_out", label: "Exec", type: "exec" },
            { id: "normal_out", label: "Hit Normal", type: "vector" },
          ],
          x: 10, y: 50,
        },
        {
          id: "n2", title: "Vector * Float", subtitle: "Normal * 500", nodeType: "value",
          inputs: [
            { id: "vec_in", label: "A (Vector)", type: "vector" },
            { id: "float_in", label: "B (Float)", type: "float" },
          ],
          outputs: [{ id: "result_out", label: "Return", type: "vector" }],
          x: 200, y: 120,
        },
        {
          id: "n3", title: "Add Impulse", nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "impulse_in", label: "Impulse", type: "vector" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 390, y: 40,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n1", fromPinId: "normal_out", toNodeId: "n2", toPinId: "vec_in" },
        { fromNodeId: "n2", fromPinId: "result_out", toNodeId: "n3", toPinId: "impulse_in" },
      ],
    },
  },
  {
    id: "bc016",
    title: "Виджет HP на экране",
    description: "Создай виджет здоровья и добавь его на экран при старте.",
    category: "UI",
    difficulty: "Intermediate",
    xpReward: 70,
    buildChallenge: {
      instruction: "Соедини BeginPlay → Create Widget (класс WBP_HUD) → Add to Viewport.",
      hint: "Create Widget создаёт экземпляр UI. Add to Viewport показывает его на экране.",
      nodes: [
        {
          id: "n1", title: "Event BeginPlay", nodeType: "event",
          inputs: [], outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10, y: 60,
        },
        {
          id: "n2", title: "Create Widget", subtitle: "WBP_HUD", nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "class_in", label: "Class", type: "object" },
          ],
          outputs: [
            { id: "exec_out", label: "Exec", type: "exec" },
            { id: "widget_out", label: "Return Value", type: "object" },
          ],
          x: 185, y: 40,
        },
        {
          id: "n3", title: "Add to Viewport", nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "target_in", label: "Target", type: "object" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 385, y: 40,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n2", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "exec_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "widget_out", toNodeId: "n3", toPinId: "target_in" },
      ],
    },
  },
  {
    id: "bc017",
    title: "Линейная интерполяция",
    description: "Интерполируй цвет между двумя значениями по времени Timeline.",
    category: "Материалы",
    difficulty: "Intermediate",
    xpReward: 65,
    buildChallenge: {
      instruction: "Timeline Update Float Value → Lerp (Color) Alpha пин. Linear Color A и B в Lerp. Результат → Set Material Parameter.",
      hint: "Lerp смешивает два значения по Alpha от 0 до 1. Timeline даёт плавное изменение Alpha.",
      nodes: [
        {
          id: "n1", title: "Activate Timeline", nodeType: "event",
          inputs: [],
          outputs: [
            { id: "exec_out", label: "Exec", type: "exec" },
            { id: "update_out", label: "Update", type: "exec" },
            { id: "alpha_out", label: "Alpha", type: "float" },
          ],
          x: 10, y: 50,
        },
        {
          id: "n2", title: "Lerp (LinearColor)", nodeType: "value",
          inputs: [
            { id: "a_in", label: "A", type: "vector" },
            { id: "b_in", label: "B", type: "vector" },
            { id: "alpha_in", label: "Alpha", type: "float" },
          ],
          outputs: [{ id: "color_out", label: "Return", type: "vector" }],
          x: 215, y: 90,
        },
        {
          id: "n3", title: "Set Material Param", nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "val_in", label: "Value", type: "vector" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 400, y: 40,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "update_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n1", fromPinId: "alpha_out", toNodeId: "n2", toPinId: "alpha_in" },
        { fromNodeId: "n2", fromPinId: "color_out", toNodeId: "n3", toPinId: "val_in" },
      ],
    },
  },
  {
    id: "bc018",
    title: "AI поиск игрока",
    description: "AI контроллер: получи местоположение игрока и двигайся к нему.",
    category: "AI",
    difficulty: "Advanced",
    xpReward: 85,
    buildChallenge: {
      instruction: "Соедини Event Tick → Get Player Pawn → Get Actor Location → AI Move To. AI Move To: Target → Player Pawn.",
      hint: "AI Move To принимает Pawn (кто идёт) и Location (куда идёт). Get Actor Location возвращает вектор позиции.",
      nodes: [
        {
          id: "n1", title: "Event Tick", nodeType: "event",
          inputs: [], outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10, y: 60,
        },
        {
          id: "n2", title: "Get Player Pawn", subtitle: "Index 0", nodeType: "value",
          inputs: [], outputs: [{ id: "pawn_out", label: "Return", type: "object" }],
          x: 170, y: 140,
        },
        {
          id: "n3", title: "Get Actor Location", nodeType: "value",
          inputs: [{ id: "actor_in", label: "Target", type: "object" }],
          outputs: [{ id: "loc_out", label: "Return", type: "vector" }],
          x: 170, y: 220,
        },
        {
          id: "n4", title: "AI Move To", nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "pawn_in", label: "Pawn", type: "object" },
            { id: "dest_in", label: "Destination", type: "vector" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 370, y: 40,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n4", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "pawn_out", toNodeId: "n3", toPinId: "actor_in" },
        { fromNodeId: "n2", fromPinId: "pawn_out", toNodeId: "n4", toPinId: "pawn_in" },
        { fromNodeId: "n3", fromPinId: "loc_out", toNodeId: "n4", toPinId: "dest_in" },
      ],
    },
  },
  {
    id: "bc019",
    title: "Переключение коллизии",
    description: "Включи/выключи коллизию объекта по событию.",
    category: "Физика",
    difficulty: "Basic",
    xpReward: 45,
    buildChallenge: {
      instruction: "Соедини Event → Set Collision Enabled. Get Mesh → Target пин. Выбери CollisionEnabled.",
      hint: "Set Collision Enabled принимает Mesh компонент и тип коллизии. No Collision или Query and Physics.",
      nodes: [
        {
          id: "n1", title: "Event Toggle", nodeType: "event",
          inputs: [], outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10, y: 60,
        },
        {
          id: "n2", title: "Get Mesh", nodeType: "value",
          inputs: [], outputs: [{ id: "mesh_out", label: "Return", type: "object" }],
          x: 170, y: 130,
        },
        {
          id: "n3", title: "Set Collision Enabled", nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "target_in", label: "Target", type: "object" },
            { id: "type_in", label: "New Type", type: "string" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 175, y: 35,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "mesh_out", toNodeId: "n3", toPinId: "target_in" },
      ],
    },
  },
  {
    id: "bc020",
    title: "Множественный спавн",
    description: "Используй ForLoop чтобы создать 5 акторов в ряд.",
    category: "Поток выполнения",
    difficulty: "Advanced",
    xpReward: 90,
    buildChallenge: {
      instruction: "Соедини BeginPlay → ForLoop (0 до 4) → Spawn Actor. Index * 200 передай в X спавна.",
      hint: "ForLoop вызывает Loop Body на каждой итерации. Index — текущий номер от 0 до N-1.",
      nodes: [
        {
          id: "n1", title: "Event BeginPlay", nodeType: "event",
          inputs: [], outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10, y: 60,
        },
        {
          id: "n2", title: "For Loop", subtitle: "0..4", nodeType: "flow",
          inputs: [{ id: "exec_in", label: "Exec", type: "exec" }],
          outputs: [
            { id: "body_out", label: "Loop Body", type: "exec" },
            { id: "index_out", label: "Index", type: "integer" },
            { id: "complete_out", label: "Completed", type: "exec" },
          ],
          x: 185, y: 40,
        },
        {
          id: "n3", title: "Spawn Actor from Class", nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "class_in", label: "Class", type: "object" },
            { id: "xform_in", label: "Spawn Transform", type: "vector" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 380, y: 40,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n2", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "body_out", toNodeId: "n3", toPinId: "exec_in" },
      ],
    },
  },
  {
    id: "bc021",
    title: "Уничтожение с задержкой",
    description: "Уничтожь актор через 5 секунд после появления.",
    category: "Геймплей",
    difficulty: "Beginner",
    xpReward: 35,
    buildChallenge: {
      instruction: "Соедини BeginPlay → Delay (5 сек) → Destroy Actor.",
      hint: "Destroy Actor удаляет текущий актор из мира. Используй Self как Target.",
      nodes: [
        {
          id: "n1", title: "Event BeginPlay", nodeType: "event",
          inputs: [], outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10, y: 60,
        },
        {
          id: "n2", title: "Delay", subtitle: "5.0 sec", nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "dur_in", label: "Duration", type: "float" },
          ],
          outputs: [{ id: "completed", label: "Completed", type: "exec" }],
          x: 190, y: 45,
        },
        {
          id: "n3", title: "Destroy Actor", nodeType: "function",
          inputs: [{ id: "exec_in", label: "Exec", type: "exec" }],
          outputs: [],
          x: 385, y: 55,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n2", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "completed", toNodeId: "n3", toPinId: "exec_in" },
      ],
    },
  },
  {
    id: "bc022",
    title: "Получение дистанции",
    description: "Вычисли расстояние между игроком и врагом для логики атаки.",
    category: "Математика",
    difficulty: "Basic",
    xpReward: 50,
    buildChallenge: {
      instruction: "Get Actor Location (Enemy) и Get Actor Location (Player) → Get Distance To → Branch (< 300).",
      hint: "Get Distance To принимает два вектора и возвращает Float — расстояние между точками.",
      nodes: [
        {
          id: "n1", title: "Event Tick", nodeType: "event",
          inputs: [], outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10, y: 60,
        },
        {
          id: "n2", title: "Get Distance To", nodeType: "value",
          inputs: [
            { id: "a_in", label: "From", type: "vector" },
            { id: "b_in", label: "To", type: "vector" },
          ],
          outputs: [{ id: "dist_out", label: "Distance", type: "float" }],
          x: 185, y: 120,
        },
        {
          id: "n3", title: "Float < Float", subtitle: "< 300", nodeType: "value",
          inputs: [
            { id: "a_in", label: "Distance", type: "float" },
            { id: "b_in", label: "300.0", type: "float" },
          ],
          outputs: [{ id: "bool_out", label: "Return", type: "bool" }],
          x: 370, y: 110,
        },
        {
          id: "n4", title: "Branch", nodeType: "flow",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "cond_in", label: "Condition", type: "bool" },
          ],
          outputs: [
            { id: "true_out", label: "True", type: "exec" },
            { id: "false_out", label: "False", type: "exec" },
          ],
          x: 370, y: 35,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n4", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "dist_out", toNodeId: "n3", toPinId: "a_in" },
        { fromNodeId: "n3", fromPinId: "bool_out", toNodeId: "n4", toPinId: "cond_in" },
      ],
    },
  },
  {
    id: "bc023",
    title: "Камера от первого лица",
    description: "Прикрепи Camera Component к голове персонажа при старте.",
    category: "Камера",
    difficulty: "Basic",
    xpReward: 50,
    buildChallenge: {
      instruction: "Соедини BeginPlay → Get Camera Component → Attach To Component (Head Socket).",
      hint: "Attach To Component прикрепляет один компонент к сокету другого. Socket Name = 'head'.",
      nodes: [
        {
          id: "n1", title: "Event BeginPlay", nodeType: "event",
          inputs: [], outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10, y: 60,
        },
        {
          id: "n2", title: "Get Camera Component", nodeType: "value",
          inputs: [], outputs: [{ id: "cam_out", label: "Return", type: "object" }],
          x: 170, y: 140,
        },
        {
          id: "n3", title: "Attach To Component", nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "target_in", label: "Target", type: "object" },
            { id: "parent_in", label: "Parent", type: "object" },
            { id: "socket_in", label: "Socket Name", type: "string" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 175, y: 35,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "cam_out", toNodeId: "n3", toPinId: "target_in" },
      ],
    },
  },
  {
    id: "bc024",
    title: "Случайный лут",
    description: "При смерти врага случайно выбери один из трёх типов лута.",
    category: "Геймплей",
    difficulty: "Intermediate",
    xpReward: 70,
    buildChallenge: {
      instruction: "On Death Exec → Random Integer (0-2) → Switch on Int. Каждый Case → Spawn соответствующего лута.",
      hint: "Switch on Int разветвляет выполнение по целому числу. Random Integer In Range возвращает число от Min до Max.",
      nodes: [
        {
          id: "n1", title: "Event On Death", nodeType: "event",
          inputs: [], outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10, y: 60,
        },
        {
          id: "n2", title: "Random Integer In Range", subtitle: "0..2", nodeType: "value",
          inputs: [], outputs: [{ id: "int_out", label: "Return", type: "integer" }],
          x: 170, y: 140,
        },
        {
          id: "n3", title: "Switch on Int", nodeType: "flow",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "sel_in", label: "Selection", type: "integer" },
          ],
          outputs: [
            { id: "case0_out", label: "0", type: "exec" },
            { id: "case1_out", label: "1", type: "exec" },
            { id: "case2_out", label: "2", type: "exec" },
          ],
          x: 170, y: 35,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "int_out", toNodeId: "n3", toPinId: "sel_in" },
      ],
    },
  },
  {
    id: "bc025",
    title: "Интерфейс здоровья",
    description: "Реализуй интерфейс получения урона через Blueprint Interface.",
    category: "Архитектура",
    difficulty: "Advanced",
    xpReward: 95,
    buildChallenge: {
      instruction: "Event ReceiveDamage (BPI) → вычти Damage из Health → Branch (Health ≤ 0) → True: Die Event.",
      hint: "Blueprint Interface события реализуются как обычные Event ноды. Вычитание через Float - Float.",
      nodes: [
        {
          id: "n1", title: "Event ReceiveDamage", subtitle: "BPI", nodeType: "event",
          inputs: [],
          outputs: [
            { id: "exec_out", label: "Exec", type: "exec" },
            { id: "dmg_out", label: "Damage", type: "float" },
          ],
          x: 10, y: 50,
        },
        {
          id: "n2", title: "Float - Float", subtitle: "Health - Damage", nodeType: "value",
          inputs: [
            { id: "a_in", label: "Health", type: "float" },
            { id: "b_in", label: "Damage", type: "float" },
          ],
          outputs: [{ id: "result_out", label: "Return", type: "float" }],
          x: 200, y: 130,
        },
        {
          id: "n3", title: "Float <= Float", subtitle: "NewHealth ≤ 0", nodeType: "value",
          inputs: [
            { id: "a_in", label: "New Health", type: "float" },
            { id: "b_in", label: "0.0", type: "float" },
          ],
          outputs: [{ id: "bool_out", label: "Return", type: "bool" }],
          x: 380, y: 130,
        },
        {
          id: "n4", title: "Branch", nodeType: "flow",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "cond_in", label: "Condition", type: "bool" },
          ],
          outputs: [
            { id: "true_out", label: "True", type: "exec" },
            { id: "false_out", label: "False", type: "exec" },
          ],
          x: 380, y: 30,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n4", toPinId: "exec_in" },
        { fromNodeId: "n1", fromPinId: "dmg_out", toNodeId: "n2", toPinId: "b_in" },
        { fromNodeId: "n2", fromPinId: "result_out", toNodeId: "n3", toPinId: "a_in" },
        { fromNodeId: "n3", fromPinId: "bool_out", toNodeId: "n4", toPinId: "cond_in" },
      ],
    },
  },
  {
    id: "bc026",
    title: "Пикап предмета",
    description: "Подбери предмет при перекрытии и добавь в инвентарь.",
    category: "Взаимодействие",
    difficulty: "Basic",
    xpReward: 55,
    buildChallenge: {
      instruction: "On Begin Overlap → Cast To BP_Character → Add Item To Inventory → Destroy Actor.",
      hint: "Cast нужен чтобы убедиться что подбирает именно персонаж, а не любой актор.",
      nodes: [
        {
          id: "n1", title: "On Begin Overlap", nodeType: "event",
          inputs: [],
          outputs: [
            { id: "exec_out", label: "Exec", type: "exec" },
            { id: "actor_out", label: "Other Actor", type: "object" },
          ],
          x: 10, y: 50,
        },
        {
          id: "n2", title: "Cast To BP_Character", nodeType: "flow",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "obj_in", label: "Object", type: "object" },
          ],
          outputs: [
            { id: "success_out", label: "Success", type: "exec" },
            { id: "char_out", label: "BP_Character", type: "object" },
          ],
          x: 195, y: 35,
        },
        {
          id: "n3", title: "Add Item To Inventory", nodeType: "function",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "target_in", label: "Target", type: "object" },
          ],
          outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 390, y: 30,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n2", toPinId: "exec_in" },
        { fromNodeId: "n1", fromPinId: "actor_out", toNodeId: "n2", toPinId: "obj_in" },
        { fromNodeId: "n2", fromPinId: "success_out", toNodeId: "n3", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "char_out", toNodeId: "n3", toPinId: "target_in" },
      ],
    },
  },
  {
    id: "bc027",
    title: "Регенерация здоровья",
    description: "Постепенно восстанавливай здоровье каждую секунду если ниже 50%.",
    category: "Геймплей",
    difficulty: "Advanced",
    xpReward: 90,
    buildChallenge: {
      instruction: "Timer → Get Health → Float < 50 → Branch True → Set Health (Health + RegenRate).",
      hint: "Timer вызывает функцию каждые N секунд. Проверяем здоровье через Branch и добавляем реген.",
      nodes: [
        {
          id: "n1", title: "Regen Timer Event", nodeType: "event",
          inputs: [], outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
          x: 10, y: 60,
        },
        {
          id: "n2", title: "Get Health", subtitle: "Variable", nodeType: "variable",
          inputs: [], outputs: [{ id: "hp_out", label: "Health", type: "float" }],
          x: 170, y: 140,
        },
        {
          id: "n3", title: "Float < Float", subtitle: "Health < 50", nodeType: "value",
          inputs: [
            { id: "a_in", label: "Health", type: "float" },
            { id: "b_in", label: "50.0", type: "float" },
          ],
          outputs: [{ id: "bool_out", label: "Return", type: "bool" }],
          x: 340, y: 130,
        },
        {
          id: "n4", title: "Branch", nodeType: "flow",
          inputs: [
            { id: "exec_in", label: "Exec", type: "exec" },
            { id: "cond_in", label: "Condition", type: "bool" },
          ],
          outputs: [
            { id: "true_out", label: "True", type: "exec" },
            { id: "false_out", label: "False", type: "exec" },
          ],
          x: 340, y: 35,
        },
      ],
      solution: [
        { fromNodeId: "n1", fromPinId: "exec_out", toNodeId: "n4", toPinId: "exec_in" },
        { fromNodeId: "n2", fromPinId: "hp_out", toNodeId: "n3", toPinId: "a_in" },
        { fromNodeId: "n3", fromPinId: "bool_out", toNodeId: "n4", toPinId: "cond_in" },
      ],
    },
  },
];

export function getRandomChallenge(
  excludeIds: string[] = [],
  difficulty?: string
): BlueprintChallenge {
  let pool = BLUEPRINT_CHALLENGES.filter((c) => !excludeIds.includes(c.id));
  if (difficulty && difficulty !== "all") {
    const filtered = pool.filter((c) => c.difficulty === difficulty);
    if (filtered.length > 0) pool = filtered;
  }
  if (pool.length === 0) pool = BLUEPRINT_CHALLENGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getDailyChallenge(): BlueprintChallenge {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  return BLUEPRINT_CHALLENGES[dayOfYear % BLUEPRINT_CHALLENGES.length];
}
