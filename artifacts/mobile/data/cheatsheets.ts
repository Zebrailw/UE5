export interface CheatItem {
  label: string;
  value: string;
  note?: string;
}

export interface CheatSheet {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  sections: {
    heading: string;
    items: CheatItem[];
  }[];
}

export const CHEAT_SHEETS: CheatSheet[] = [
  {
    id: "hotkeys",
    title: "Горячие клавиши",
    subtitle: "Blueprint Editor UE5",
    icon: "zap",
    color: "#FFB800",
    sections: [
      {
        heading: "Навигация по графу",
        items: [
          { label: "Двигать граф", value: "ПКМ + тянуть", note: "или средняя кнопка мыши" },
          { label: "Масштаб", value: "Колёсико мыши" },
          { label: "Вписать всё в экран", value: "Home" },
          { label: "Сфокусировать на выбранном", value: "F" },
        ],
      },
      {
        heading: "Работа с нодами",
        items: [
          { label: "Добавить ноду", value: "ПКМ по графу" },
          { label: "Вырезать", value: "Ctrl + X" },
          { label: "Копировать", value: "Ctrl + C" },
          { label: "Вставить", value: "Ctrl + V" },
          { label: "Дублировать", value: "Ctrl + D" },
          { label: "Удалить", value: "Delete" },
          { label: "Выделить всё", value: "Ctrl + A" },
          { label: "Отменить", value: "Ctrl + Z" },
          { label: "Повторить", value: "Ctrl + Y" },
        ],
      },
      {
        heading: "Провода",
        items: [
          { label: "Удалить провод", value: "Alt + клик по проводу" },
          { label: "Вставить ноду в провод", value: "Перетащить ноду на провод" },
          { label: "Рекомпилировать", value: "F7" },
          { label: "Скрыть несвязанные пины", value: "ПКМ по пину → Hide Unconnected" },
        ],
      },
      {
        heading: "Быстрые ноды (тяни из пина)",
        items: [
          { label: "Ноды под тип пина", value: "Тянуть из пина → отпустить" },
          { label: "Print String", value: "Напечатать 'print' в поиске" },
          { label: "Branch (if)", value: "Напечатать 'branch'" },
          { label: "Cast To", value: "Напечатать 'cast'" },
        ],
      },
    ],
  },
  {
    id: "top_nodes",
    title: "Топ-20 нод",
    subtitle: "Самые нужные Blueprint-ноды",
    icon: "grid",
    color: "#00D4FF",
    sections: [
      {
        heading: "Ноды событий",
        items: [
          { label: "Event BeginPlay", value: "Запуск при старте игры", note: "точка входа" },
          { label: "Event Tick", value: "Каждый кадр", note: "используй осторожно!" },
          { label: "Event OnHit", value: "При столкновении объекта" },
          { label: "Event ActorBeginOverlap", value: "Вход в триггер-зону" },
          { label: "Custom Event", value: "Создать свой вызываемый ивент" },
        ],
      },
      {
        heading: "Поток управления",
        items: [
          { label: "Branch", value: "if / else — выбор пути" },
          { label: "Sequence", value: "Выполнить несколько веток по порядку" },
          { label: "Delay", value: "Пауза N секунд затем продолжить" },
          { label: "For Each Loop", value: "Перебрать массив" },
          { label: "Do Once", value: "Сработать только первый раз" },
        ],
      },
      {
        heading: "Акторы и мир",
        items: [
          { label: "Spawn Actor from Class", value: "Создать объект в мире" },
          { label: "Destroy Actor", value: "Удалить объект из мира" },
          { label: "Get Actor Location / Rotation", value: "Получить позицию/поворот" },
          { label: "Set Actor Location", value: "Переместить объект" },
          { label: "Cast To [ClassName]", value: "Привести объект к нужному типу" },
        ],
      },
      {
        heading: "Утилиты",
        items: [
          { label: "Print String", value: "Вывести текст на экран (отладка)" },
          { label: "Get Player Character", value: "Получить персонажа игрока" },
          { label: "Get Game Mode", value: "Доступ к правилам игры" },
          { label: "Set Timer by Function Name", value: "Вызов функции через N сек" },
          { label: "Line Trace by Channel", value: "Трассировка луча (raycast)" },
        ],
      },
    ],
  },
  {
    id: "day1",
    title: "День 1 в UE5",
    subtitle: "Пошаговый старт в реальном проекте",
    icon: "flag",
    color: "#39D353",
    sections: [
      {
        heading: "Установка и настройка",
        items: [
          { label: "1", value: "Скачать Epic Games Launcher → установить UE5 (версия 5.3+)", note: "epicgames.com/store/en-US/download" },
          { label: "2", value: "Создать новый проект: Games → Third Person → Blueprint → No Starter Content" },
          { label: "3", value: "Запустить проект (зелёная кнопка Play)" },
          { label: "4", value: "Ходить по уровню через WASD и мышь — убедись что всё работает" },
        ],
      },
      {
        heading: "Первый Blueprint",
        items: [
          { label: "5", value: "Content Browser → ПКМ → Blueprint Class → Actor → назвать MyFirstActor" },
          { label: "6", value: "Открыть → перейти во вкладку Event Graph" },
          { label: "7", value: "Тянуть из BeginPlay → найти Print String → написать 'Привет!' " },
          { label: "8", value: "Нажать Compile (F7), затем перетащить актор на уровень, нажать Play" },
        ],
      },
      {
        heading: "Первая переменная",
        items: [
          { label: "9", value: "В Variables (слева) нажать + → назвать Health → тип Float → дефолт 100" },
          { label: "10", value: "Тянуть Health в граф → Get Health → Print String через ToString" },
          { label: "11", value: "Compile → Play — увидишь '100.0' на экране" },
        ],
      },
      {
        heading: "Первый компонент",
        items: [
          { label: "12", value: "Components (слева вверху) → Add → Static Mesh Component" },
          { label: "13", value: "Details (справа) → Static Mesh → выбрать Cube" },
          { label: "14", value: "В Event Graph: BeginPlay → Set Relative Scale 3D на Cube → X=2, Y=2, Z=2" },
          { label: "15", value: "Compile → Play → куб на уровне стал в 2 раза больше" },
        ],
      },
    ],
  },
  {
    id: "patterns",
    title: "Паттерны Blueprint",
    subtitle: "Частые задачи → готовые решения",
    icon: "code",
    color: "#A855F7",
    sections: [
      {
        heading: "Таймер — действие через N секунд",
        items: [
          { label: "1", value: "BeginPlay → Set Timer by Function Name" },
          { label: "2", value: "Function Name = 'OnTimer', Time = 3.0, Looping = false" },
          { label: "3", value: "Создать Custom Event OnTimer → добавить логику" },
        ],
      },
      {
        heading: "Триггер-зона — игрок входит → происходит действие",
        items: [
          { label: "1", value: "Добавить Box Collision Component" },
          { label: "2", value: "Details → On Component Begin Overlap → Add Event" },
          { label: "3", value: "Cast To PlayerCharacter → проверить что это игрок → логика" },
        ],
      },
      {
        heading: "Интерфейс между Акторами (через Interface)",
        items: [
          { label: "1", value: "Content Browser → Blueprint Interface → добавить функцию TakeDamage(Amount: Float)" },
          { label: "2", value: "В Enemy BP: Class Settings → добавить интерфейс → реализовать Event TakeDamage" },
          { label: "3", value: "В Player BP: Cast To Enemy → тянуть → вызвать TakeDamage (не Cast нужен!)" },
        ],
      },
      {
        heading: "Сохранение данных",
        items: [
          { label: "1", value: "Создать Blueprint Class → SaveGame → добавить переменные (Score, Level, ...)" },
          { label: "2", value: "Сохранить: Create Save Game Object → Cast To MySave → заполнить поля → Save Game to Slot" },
          { label: "3", value: "Загрузить: Load Game from Slot → Cast To MySave → Get Score" },
        ],
      },
      {
        heading: "Делегат событий (Event Dispatcher)",
        items: [
          { label: "1", value: "В исходном BP: добавить Event Dispatcher (колонка слева) → OnDeath" },
          { label: "2", value: "Вызвать: Call OnDeath в нужном месте графа" },
          { label: "3", value: "В слушателе (GameMode и т.д.): получить ссылку → Bind Event to OnDeath → Custom Event" },
        ],
      },
    ],
  },
  {
    id: "bp_to_cpp",
    title: "Blueprint → C++",
    subtitle: "Как перейти от визуального к коду",
    icon: "terminal",
    color: "#FF6B35",
    sections: [
      {
        heading: "Эквиваленты Blueprint → C++",
        items: [
          { label: "Event BeginPlay", value: "virtual void BeginPlay() override;" },
          { label: "Event Tick", value: "virtual void Tick(float DeltaTime) override;" },
          { label: "Переменная Float Health", value: "UPROPERTY(EditAnywhere) float Health = 100.f;" },
          { label: "Print String", value: "GEngine->AddOnScreenDebugMessage(-1, 5.f, FColor::White, TEXT(\"Привет\"));" },
          { label: "Set Actor Location", value: "SetActorLocation(FVector(X, Y, Z));" },
          { label: "Spawn Actor", value: "GetWorld()->SpawnActor<AMyActor>(MyClass, Transform);" },
          { label: "Destroy Actor", value: "Destroy();" },
          { label: "Branch (if)", value: "if (bCondition) { ... } else { ... }" },
          { label: "Cast To", value: "AMyActor* MyActor = Cast<AMyActor>(OtherActor);" },
          { label: "Delay", value: "GetWorldTimerManager().SetTimer(Handle, this, &AMyActor::OnDelay, 2.f);" },
        ],
      },
      {
        heading: "Когда переходить на C++?",
        items: [
          { label: "✓ Оставь в Blueprint", value: "Геймплейные события, UI-логика, прототипы, анимации" },
          { label: "✓ Пиши на C++", value: "Системы с высокой частотой вызовов, системы ИИ, физика, сетевой код" },
          { label: "✓ Смешанный подход", value: "C++ базовые классы + Blueprint-наследники (лучший вариант для больших проектов)" },
        ],
      },
      {
        heading: "Путь к C++ из Blueprint",
        items: [
          { label: "Шаг 1", value: "Изучи основы C++ — указатели, классы, наследование (отдельно от UE)" },
          { label: "Шаг 2", value: "Пройди официальный курс UE: docs.unrealengine.com → 'Your First Hour in Unreal Engine 5'" },
          { label: "Шаг 3", value: "Создай проект с C++, добавь UCLASS с UPROPERTY и UFUNCTION — сравни с Blueprint" },
          { label: "Шаг 4", value: "Порт одной небольшой Blueprint-системы в C++. Остальное оставь в BP." },
        ],
      },
    ],
  },
];
