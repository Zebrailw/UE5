export type Difficulty = "beginner" | "basic" | "intermediate" | "advanced" | "expert";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
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

export const MODULES: Module[] = [
  {
    id: "mod_intro",
    title: "What is Blueprint?",
    description: "Understand Unreal Engine's visual scripting system from scratch",
    icon: "grid",
    difficulty: "beginner",
    color: "#00D4FF",
    xpRequired: 0,
    lessons: [
      {
        id: "les_001",
        moduleId: "mod_intro",
        title: "Introduction to Blueprints",
        description: "Learn what Blueprint is and why it's powerful",
        content: "Blueprint is Unreal Engine 5's visual scripting system that allows you to create game logic without writing C++ code. Instead of text-based code, you connect nodes together in a graph — each node performs a specific action or returns a value.\n\nBlueprint uses an event-driven programming model. Your code doesn't run from top to bottom — it runs in response to events like 'Begin Play', 'On Hit', or 'Tick'.\n\n**Key concepts:**\n• Nodes — The building blocks of Blueprint logic\n• Pins — Connection points on nodes (input/output)\n• Wires — Lines connecting pins between nodes\n• Events — Special nodes that trigger execution\n• Variables — Store and retrieve data\n\nBlueprints compile to bytecode at runtime, making them fast enough for most gameplay logic. For performance-critical systems, you can expose Blueprint functions to C++ or migrate later.",
        xpReward: 100,
        estimatedMinutes: 8,
        tags: ["basics", "intro"],
        realWorldExample: "Every major AAA game built with UE5 uses Blueprint for rapid prototyping — even teams with dedicated C++ programmers use Blueprint for gameplay scripting.",
        practiceTask: "Open Unreal Engine, create a new Blueprint Actor, and explore the Event Graph. Find the BeginPlay and Tick events.",
        quizQuestions: [
          {
            id: "q001",
            question: "What is the main purpose of Blueprint in Unreal Engine?",
            options: [
              "To replace the entire C++ engine",
              "To create game logic visually without writing code",
              "Only for creating UI menus",
              "To optimize rendering performance"
            ],
            correctIndex: 1,
            explanation: "Blueprint is a visual scripting system that lets you create game logic by connecting nodes, without writing C++ code."
          },
          {
            id: "q002",
            question: "What connects nodes together in a Blueprint graph?",
            options: ["Cables", "Wires", "Bridges", "Channels"],
            correctIndex: 1,
            explanation: "Wires are the lines that connect pins between nodes, creating the flow of logic in Blueprint."
          },
          {
            id: "q003",
            question: "How does Blueprint execute code?",
            options: [
              "From top to bottom like Python",
              "Randomly",
              "In response to events",
              "Only on button press"
            ],
            correctIndex: 2,
            explanation: "Blueprint uses an event-driven model — code runs when specific events occur like BeginPlay, Tick, or OnHit."
          }
        ]
      },
      {
        id: "les_002",
        moduleId: "mod_intro",
        title: "Blueprint Types",
        description: "Actor BP, Level BP, Widget BP — know the difference",
        content: "Unreal Engine has several types of Blueprints, each serving a different purpose:\n\n**Actor Blueprint** — The most common type. Represents any object that can be placed in the world — characters, props, doors, enemies. This is where most gameplay logic lives.\n\n**Level Blueprint** — One per level. Used for level-specific scripting like cutscenes, opening sequences, or one-off events. Avoid putting reusable logic here.\n\n**Widget Blueprint** — For creating UI (HUD, menus, inventory screens). Uses a visual designer alongside Blueprint logic.\n\n**Animation Blueprint** — Controls animation state machines for characters. Runs on the animation thread for performance.\n\n**Game Mode Blueprint** — Defines rules of your game: scoring, win/lose conditions, default player class.\n\n**Player Controller Blueprint** — Handles player input and translates it into game actions.\n\n**Game Instance Blueprint** — Persists across level loads. Perfect for storing player data, save game state, or global settings.",
        xpReward: 120,
        estimatedMinutes: 10,
        tags: ["basics", "types"],
        realWorldExample: "A door that opens when a player presses E uses an Actor Blueprint. The HUD showing health is a Widget Blueprint. Game rules are in Game Mode Blueprint.",
        practiceTask: "In UE5, right-click in the Content Browser and explore the Blueprint submenu. Notice the different Blueprint types available.",
        quizQuestions: [
          {
            id: "q004",
            question: "Which Blueprint type persists across level loads?",
            options: ["Actor Blueprint", "Level Blueprint", "Game Instance Blueprint", "Widget Blueprint"],
            correctIndex: 2,
            explanation: "Game Instance Blueprint is created once and persists throughout the entire game session, surviving level transitions."
          },
          {
            id: "q005",
            question: "What is a Widget Blueprint used for?",
            options: [
              "Enemy AI behavior",
              "Creating UI elements like HUD and menus",
              "Physics calculations",
              "Sound management"
            ],
            correctIndex: 1,
            explanation: "Widget Blueprint is specifically designed for creating user interface elements — health bars, menus, inventory screens, etc."
          }
        ]
      }
    ]
  },
  {
    id: "mod_nodes",
    title: "Nodes & Execution",
    description: "Master the building blocks: node types, execution flow, and pins",
    icon: "cpu",
    difficulty: "beginner",
    color: "#7B4FFF",
    xpRequired: 100,
    lessons: [
      {
        id: "les_003",
        moduleId: "mod_nodes",
        title: "Node Types",
        description: "Function nodes, event nodes, variable nodes, pure nodes",
        content: "Understanding node types is fundamental to Blueprint mastery.\n\n**Event Nodes** (Red header) — Start execution chains. Examples: BeginPlay, Tick, OnHit. They have a white execution output pin.\n\n**Function Nodes** (Blue header) — Perform actions and can return values. Examples: Print String, Spawn Actor, Get Player Character.\n\n**Pure Nodes** (Green, no execution pins) — Return values without side effects. Examples: math operations, Get Actor Location, comparisons. They run whenever their output is needed.\n\n**Macro Nodes** (Purple header) — Reusable groups of nodes with multiple inputs/outputs.\n\n**Variable Nodes** — Get or Set variable values.\n\n**Comment Nodes** — Group and document your Blueprint logic (press C to create).\n\n**Pins explained:**\n• White pins = Execution flow\n• Blue pins = Object references\n• Green pins = Boolean\n• Yellow pins = Integer/Float\n• Pink pins = String\n• Cyan pins = Struct",
        xpReward: 150,
        estimatedMinutes: 12,
        tags: ["nodes", "flow"],
        realWorldExample: "Get Player Character is a Pure node because it just returns a value. Destroy Actor is a Function node because it has a side effect.",
        quizQuestions: [
          {
            id: "q006",
            question: "What color are execution (flow) pins in Blueprint?",
            options: ["Blue", "Green", "White", "Yellow"],
            correctIndex: 2,
            explanation: "White pins represent the execution flow in Blueprint — they determine the order in which nodes execute."
          },
          {
            id: "q007",
            question: "What makes a Pure node different from a Function node?",
            options: [
              "Pure nodes are faster",
              "Pure nodes have no side effects and no execution pins",
              "Pure nodes can only be used once",
              "Pure nodes require a special license"
            ],
            correctIndex: 1,
            explanation: "Pure nodes (green header) have no side effects and no execution pins — they just return values whenever their output is needed."
          }
        ]
      },
      {
        id: "les_004",
        moduleId: "mod_nodes",
        title: "Execution Flow",
        description: "How Blueprint executes: sequences, branches, and multiple outputs",
        content: "Blueprint execution follows the white execution wires from left to right. Understanding this flow is crucial.\n\n**Sequential Execution** — Nodes connected with white wires execute one after another.\n\n**Branch Node** — The Blueprint equivalent of if/else. Takes a Boolean condition and routes execution to True or False outputs.\n\n**Sequence Node** — Executes multiple connected outputs in order. Useful for organizing complex logic.\n\n**Do Once** — Allows execution to pass through only once, then blocks until Reset is called.\n\n**Do N** — Executes a maximum of N times before stopping.\n\n**Gate** — Open/Close to allow or block execution flow.\n\n**FlipFlop** — Alternates between A and B outputs each time it's called.\n\n**Is Valid** — Checks if an object reference is valid before using it (prevents crashes).\n\n**Pro Tip:** Right-click any execution wire and add a node inline. Hold Alt and click a wire to disconnect it.",
        xpReward: 150,
        estimatedMinutes: 10,
        tags: ["flow", "branch"],
        practiceTask: "Create a Branch node that checks if a variable is greater than 5. Print 'High' if true, 'Low' if false.",
        quizQuestions: [
          {
            id: "q008",
            question: "Which node is Blueprint's equivalent of if/else?",
            options: ["Sequence", "Branch", "Gate", "FlipFlop"],
            correctIndex: 1,
            explanation: "Branch node takes a Boolean input and routes execution to either the True or False output pin."
          },
          {
            id: "q009",
            question: "What does the Sequence node do?",
            options: [
              "Creates a random sequence",
              "Executes multiple connected outputs in order",
              "Loops through an array",
              "Delays execution"
            ],
            correctIndex: 1,
            explanation: "Sequence node executes its Then 0, Then 1, Then 2... outputs sequentially, allowing you to chain multiple actions."
          }
        ]
      }
    ]
  },
  {
    id: "mod_variables",
    title: "Variables & Data Types",
    description: "Store and manipulate data: integers, floats, booleans, strings, vectors",
    icon: "database",
    difficulty: "beginner",
    color: "#39D353",
    xpRequired: 200,
    lessons: [
      {
        id: "les_005",
        moduleId: "mod_variables",
        title: "Variable Types",
        description: "Boolean, Integer, Float, String, Name, Vector, Rotator, Transform",
        content: "Variables store data in your Blueprint. Choosing the right type is important for both correctness and performance.\n\n**Boolean** — True or False. Used for flags, states, toggles. (Green)\n\n**Integer** — Whole numbers (-2, 0, 5, 100). Use for counts, indexes, ammo. (Cyan)\n\n**Float** — Decimal numbers (3.14, -0.5). Use for speed, health, damage. (Green-yellow)\n\n**String** — Text ('Hello World'). Used for display text, debug info. Avoid in gameplay logic.\n\n**Name** — Like String but optimized for comparison. Use for identifiers, tags.\n\n**Vector** — 3D point (X, Y, Z). Used for positions, directions, velocities. (Yellow)\n\n**Rotator** — Rotation in 3 axes (Pitch, Yaw, Roll). Used for object orientation.\n\n**Transform** — Combines Location (Vector), Rotation (Rotator), and Scale (Vector).\n\n**Object Reference** — A reference to a specific Blueprint actor instance.\n\n**Variable Scope:**\n• Instance variables — Different value per Actor instance\n• Class defaults — Shared starting values\n• Local variables — Exist only inside a function",
        xpReward: 180,
        estimatedMinutes: 12,
        tags: ["variables", "data"],
        practiceTask: "Create variables: PlayerHealth (Float, default 100), IsAlive (Boolean, default true), PlayerName (String).",
        quizQuestions: [
          {
            id: "q010",
            question: "Which type should you use for an ammo counter?",
            options: ["Float", "String", "Integer", "Boolean"],
            correctIndex: 2,
            explanation: "Integer (whole numbers) is perfect for ammo counters since you can't have 5.5 bullets."
          },
          {
            id: "q011",
            question: "What does a Transform variable store?",
            options: [
              "Only position",
              "Only rotation",
              "Location, Rotation, and Scale together",
              "Color and opacity"
            ],
            correctIndex: 2,
            explanation: "Transform combines Location (Vector), Rotation (Rotator), and Scale (Vector) into a single convenient variable."
          }
        ]
      },
      {
        id: "les_006",
        moduleId: "mod_variables",
        title: "Arrays, Maps & Sets",
        description: "Collections for storing multiple values efficiently",
        content: "Collections let you store multiple values in a single variable.\n\n**Array** — Ordered list of items. Each item has an index starting at 0.\n• Get (copy) — Read value at index\n• Set — Change value at index\n• Add — Append to end\n• Remove Index — Delete specific index\n• Length — Get count of items\n• ForEachLoop — Iterate all items\n\n**Map** — Key-value pairs (like a dictionary).\n• Add entry — Insert key:value pair\n• Find — Look up value by key\n• Contains — Check if key exists\n• Keys — Get array of all keys\n\n**Set** — Unordered collection of unique values. No duplicates.\n• Add Member — Insert value (ignored if duplicate)\n• Contains — Check membership\n• Intersection — Find values in both sets\n\n**Performance Tips:**\n• Arrays are fastest for sequential access\n• Maps excel at lookup by key\n• Sets are perfect for 'has this been collected?' checks\n• Avoid huge arrays in Tick — cache results",
        xpReward: 200,
        estimatedMinutes: 14,
        tags: ["variables", "arrays", "collections"],
        practiceTask: "Create an Inventory array of Strings. Add 3 items, loop through and print each one.",
        quizQuestions: [
          {
            id: "q012",
            question: "What index does the first item in a Blueprint Array have?",
            options: ["1", "0", "-1", "It depends on the array"],
            correctIndex: 1,
            explanation: "Arrays in Blueprint (and most programming languages) start at index 0. The first item is at index 0."
          },
          {
            id: "q013",
            question: "When would you use a Map instead of an Array?",
            options: [
              "When you need ordered items",
              "When you need to look up values by a specific key quickly",
              "When you need to store booleans",
              "Maps are always better than Arrays"
            ],
            correctIndex: 1,
            explanation: "Maps (key-value pairs) excel when you need to quickly find a value using a specific key, like looking up damage values by weapon type."
          }
        ]
      }
    ]
  },
  {
    id: "mod_functions",
    title: "Functions & Macros",
    description: "Organize and reuse logic with custom functions, events, and macros",
    icon: "code",
    difficulty: "basic",
    color: "#FF6B35",
    xpRequired: 400,
    lessons: [
      {
        id: "les_007",
        moduleId: "mod_functions",
        title: "Custom Functions",
        description: "Create reusable functions with inputs and outputs",
        content: "Functions let you organize code into reusable blocks. Instead of duplicating 20 nodes in multiple places, create a function once and call it anywhere.\n\n**Creating a Function:**\n1. In My Blueprint panel, click + next to Functions\n2. Name it clearly (e.g., 'CalculateDamage', 'SpawnEnemy')\n3. Add inputs and outputs in the Details panel\n4. Build the logic inside the function graph\n\n**Function Inputs** — Data passed into the function when called\n**Function Outputs** — Data returned after the function runs\n\n**Pure Functions** — Check 'Pure' in Details. No execution pins, can be used like math nodes.\n\n**Local Variables** — Variables that only exist inside a function. Declared in the function's Local Variables section.\n\n**Best Practices:**\n• Name functions with verbs: 'CalculateDamage' not 'Damage'\n• Keep functions focused on ONE thing\n• Functions can call other functions\n• Max ~20-30 nodes per function before splitting\n\n**Functions vs Custom Events:**\n• Functions — Synchronous, can return values, can't have Delays or Latent nodes\n• Custom Events — Async-friendly, no return values, can use Timeline and Delay",
        xpReward: 220,
        estimatedMinutes: 15,
        tags: ["functions", "organization"],
        practiceTask: "Create a function 'TakeDamage' with Float input 'DamageAmount'. It should subtract from Health and print the result.",
        quizQuestions: [
          {
            id: "q014",
            question: "What is the main advantage of using Functions?",
            options: [
              "They run faster than regular nodes",
              "They can only be used in one Blueprint",
              "Reusable, organized logic that avoids code duplication",
              "They automatically handle errors"
            ],
            correctIndex: 2,
            explanation: "Functions let you write logic once and call it from multiple places, avoiding duplication and making code easier to maintain."
          },
          {
            id: "q015",
            question: "Can a regular Function contain a Delay node?",
            options: [
              "Yes, always",
              "No, use Custom Events for async operations",
              "Only if it returns void",
              "Only in Game Mode Blueprint"
            ],
            correctIndex: 1,
            explanation: "Regular Functions are synchronous and cannot contain latent nodes like Delay or Timeline. Use Custom Events instead for async operations."
          }
        ]
      },
      {
        id: "les_008",
        moduleId: "mod_functions",
        title: "Custom Events & Dispatchers",
        description: "Event dispatchers for decoupled Blueprint communication",
        content: "Event Dispatchers allow Blueprints to communicate without directly referencing each other — the foundation of decoupled game architecture.\n\n**Custom Events:**\nCreate in the Event Graph via Add Custom Event. They can have parameters, can be called from anywhere, and support async operations.\n\n**Event Dispatchers:**\nDeclare in My Blueprint > Event Dispatchers. Other Blueprints can Bind to them and receive notifications.\n\n**How Dispatchers Work:**\n1. Blueprint A declares a Dispatcher 'OnEnemyDied'\n2. Blueprint B (e.g., Score Manager) binds to that Dispatcher\n3. When Blueprint A calls the Dispatcher, ALL bound listeners are notified automatically\n\n**Usage Pattern:**\n```\nDeclare → Bind → Call → All listeners respond\n```\n\n**Bind Event to Dispatcher** — Connect a function/event to a dispatcher\n**Call [DispatcherName]** — Fire the event to all listeners\n**Unbind** — Remove a binding (important to prevent memory leaks)\n\n**When to use:**\n• Enemy death → Update score (dispatcher)\n• Health changed → Update HUD (dispatcher)\n• Quest completed → Unlock new area (dispatcher)\n\n**vs Interfaces:** Dispatchers are 1-to-many, Interfaces are direct calls to specific actors.",
        xpReward: 250,
        estimatedMinutes: 15,
        tags: ["events", "dispatchers", "communication"],
        quizQuestions: [
          {
            id: "q016",
            question: "What is the main advantage of Event Dispatchers?",
            options: [
              "They are faster than function calls",
              "Blueprints can communicate without directly referencing each other",
              "They work only in multiplayer games",
              "They replace all other Blueprint nodes"
            ],
            correctIndex: 1,
            explanation: "Event Dispatchers allow decoupled communication — Blueprint A can notify Blueprint B without holding a direct reference to it."
          }
        ]
      }
    ]
  },
  {
    id: "mod_actor_comm",
    title: "Actor Communication",
    description: "Casting, interfaces, and direct references between Blueprints",
    icon: "share-2",
    difficulty: "intermediate",
    color: "#FFB800",
    xpRequired: 700,
    lessons: [
      {
        id: "les_009",
        moduleId: "mod_actor_comm",
        title: "Casting",
        description: "Cast To node — access specific Blueprint functionality",
        content: "Casting converts a generic Actor reference into a specific Blueprint type so you can access its variables and functions.\n\n**Why Cast?**\nWhen you Get Player Character, it returns a generic 'Character' type. To access YOUR specific variables like Health or IsRunning, you must Cast to YOUR Blueprint class.\n\n**Cast To Node:**\nInput: Object (any reference)\nOutput: Success/Failure execution, Cast reference (if successful)\n\n**Pattern:**\n```\nGet Player Character → Cast To BP_MyCharacter → Access variables/functions\n```\n\n**Failed Cast:**\nIf the cast fails (object isn't that type), execution goes to Cast Failed pin. Always handle this case!\n\n**Performance Warning:**\nCasting has a small CPU cost. For frequently-called code (Tick), store the cast result in a variable rather than casting every frame.\n\n**Interface vs Cast:**\n• Cast — Direct, specific, requires knowing the exact type\n• Interface — Flexible, works on any Actor implementing it\n\n**Blueprint Interfaces** are preferred over casting for:\n• Interacting with many different actor types\n• Damage systems\n• Pickup systems\n• Any scenario where you don't know the exact actor type",
        xpReward: 280,
        estimatedMinutes: 14,
        tags: ["casting", "communication"],
        quizQuestions: [
          {
            id: "q017",
            question: "Why is casting every Tick frame a bad practice?",
            options: [
              "It looks bad in the graph",
              "Casting has CPU cost — cache the result in a variable instead",
              "Cast doesn't work in Tick",
              "It causes network issues"
            ],
            correctIndex: 1,
            explanation: "Cast To has a small but real CPU cost. When called 60 times per second in Tick, it adds up. Store cast results in variables."
          }
        ]
      },
      {
        id: "les_010",
        moduleId: "mod_actor_comm",
        title: "Blueprint Interfaces",
        description: "Define contracts between Blueprints without tight coupling",
        content: "Blueprint Interfaces define a contract — a set of functions any Blueprint can implement. This allows interaction with any actor without knowing its specific type.\n\n**Creating an Interface:**\n1. Content Browser → Add → Blueprint Interface\n2. Add functions (no implementation, just signatures)\n3. Add input/output parameters\n\n**Implementing an Interface:**\n1. Open your Blueprint\n2. Class Settings → Add Interface\n3. Go to Event Graph — interface events appear automatically\n4. Add logic to each event\n\n**Calling Interface Functions:**\nUse 'Does Implement Interface' check, then call the interface function on the actor.\n\n**Classic Example — Interact System:**\n```\nInterface: IInteractable\nFunction: Interact(Actor Instigator)\n\nDoor implements → Opens door\nPickup implements → Gives item\nNPC implements → Starts dialogue\n\nPlayer presses E → Call Interact on hit actor → Works on EVERYTHING\n```\n\n**Damage Interface Example:**\nInterface: IDamageable\nFunction: TakeDamage(Float Amount, Actor DamageSource)\n\nAny Actor (Enemy, Barrel, Vehicle) implements it differently. The weapon just calls it without caring what it hits.",
        xpReward: 300,
        estimatedMinutes: 18,
        tags: ["interfaces", "communication"],
        quizQuestions: [
          {
            id: "q018",
            question: "What is the main advantage of Blueprint Interfaces over direct casting?",
            options: [
              "Interfaces run faster",
              "You can call functions on any actor implementing the interface without knowing its exact type",
              "Interfaces have better graphics",
              "Casting doesn't work in multiplayer"
            ],
            correctIndex: 1,
            explanation: "Interfaces allow calling functions on any Actor implementing them without knowing the exact Blueprint type, enabling flexible and decoupled designs."
          }
        ]
      }
    ]
  },
  {
    id: "mod_gameplay",
    title: "Gameplay Mechanics",
    description: "Health systems, input, timers, line traces, and core game mechanics",
    icon: "zap",
    difficulty: "intermediate",
    color: "#FF4757",
    xpRequired: 1100,
    lessons: [
      {
        id: "les_011",
        moduleId: "mod_gameplay",
        title: "Health & Damage System",
        description: "Build a complete health/damage system from scratch",
        content: "A health system is one of the most fundamental gameplay mechanics. Here's a complete Blueprint implementation.\n\n**Variables needed:**\n• MaxHealth (Float) = 100\n• CurrentHealth (Float) = 100\n• IsAlive (Boolean) = true\n\n**Functions to create:**\n\n1. **TakeDamage(Float DamageAmount)**\n   - Check IsAlive, if false: return\n   - Subtract DamageAmount from CurrentHealth\n   - Clamp CurrentHealth (0, MaxHealth)\n   - If CurrentHealth ≤ 0: Call OnDeath()\n   - Call OnHealthChanged Dispatcher\n\n2. **Heal(Float HealAmount)**\n   - Check IsAlive, if false: return\n   - Add HealAmount to CurrentHealth\n   - Clamp CurrentHealth (0, MaxHealth)\n   - Call OnHealthChanged Dispatcher\n\n3. **OnDeath()**\n   - Set IsAlive = false\n   - Play death animation\n   - Call OnDeath Dispatcher\n   - Set lifespan to auto-destroy\n\n**Dispatchers:**\n• OnHealthChanged (passes Float NewHealth, Float MaxHealth)\n• OnDeath\n\n**HUD connection:**\nBind to OnHealthChanged → Update health bar widget\n\n**Game Mode connection:**\nBind to OnDeath → Increment kill counter, check win condition",
        xpReward: 320,
        estimatedMinutes: 20,
        tags: ["health", "damage", "gameplay"],
        practiceTask: "Build the complete health system described above. Add a Billboard component that shows current health as text.",
        quizQuestions: [
          {
            id: "q019",
            question: "Why should you clamp CurrentHealth after taking damage?",
            options: [
              "To improve performance",
              "To prevent health going below 0 or above MaxHealth",
              "Clamping is optional decoration",
              "To trigger animations"
            ],
            correctIndex: 1,
            explanation: "Clamping ensures CurrentHealth stays within valid bounds (0 to MaxHealth), preventing negative health or health exceeding the maximum."
          }
        ]
      },
      {
        id: "les_012",
        moduleId: "mod_gameplay",
        title: "Line Trace (Raycasting)",
        description: "Shoot invisible rays to detect objects, enemies, and surfaces",
        content: "Line Trace (raycasting) shoots an invisible ray from point A to point B and reports what it hit. It's used for:\n• Shooting weapons\n• Interaction detection\n• Ground checks\n• Wall detection\n• AI visibility checks\n\n**Line Trace By Channel:**\nInputs: Start (Vector), End (Vector), Trace Channel\nOutputs: Return Value (Bool hit something), Hit Result (struct)\n\n**Hit Result breakdown:**\n• Hit Actor — What was hit\n• Hit Component — Which component\n• Impact Point — World location of hit\n• Impact Normal — Surface normal at hit point\n• Distance — How far the hit is\n\n**Weapon Shooting Pattern:**\n```\nCamera Location → Camera Forward × TraceRange = End\nLineTrace → Hit Result → Cast To Enemy → TakeDamage\n```\n\n**DrawDebugLine:**\nUse for development! Visualizes where your trace goes.\n\n**Trace Channels:**\n• Visibility — Hits visible mesh\n• Camera — Camera-specific traces\n• Custom — Create your own channels\n\n**Multi Line Trace:**\nReturns all actors hit along the path, not just the first.\n\n**Sphere/Box/Capsule Trace:**\nShapes instead of a single point — better for area effects.",
        xpReward: 300,
        estimatedMinutes: 18,
        tags: ["linetrace", "raycasting", "physics"],
        quizQuestions: [
          {
            id: "q020",
            question: "What does Line Trace return when it hits nothing?",
            options: [
              "A crash",
              "Zero vector",
              "False (the boolean return value)",
              "It always hits something"
            ],
            correctIndex: 2,
            explanation: "Line Trace returns False as its boolean output when it hits nothing. Always check this before using the Hit Result."
          }
        ]
      }
    ]
  },
  {
    id: "mod_ui",
    title: "UI & Widget Blueprint",
    description: "Build HUDs, menus, inventory screens, and interactive UI",
    icon: "monitor",
    difficulty: "intermediate",
    color: "#00D4FF",
    xpRequired: 1500,
    lessons: [
      {
        id: "les_013",
        moduleId: "mod_ui",
        title: "Widget Blueprint Basics",
        description: "Create health bars, ammo counters, and HUD elements",
        content: "Widget Blueprints are the UE5 UI system. They combine a visual designer with Blueprint logic.\n\n**Creating a Widget:**\n1. Content Browser → Add → User Interface → Widget Blueprint\n2. Open Widget Designer — drag and drop components\n3. Switch to Graph to add logic\n\n**Common Widget Components:**\n• Text Block — Display text\n• Image — Show textures/icons\n• Progress Bar — Health, loading, exp bars\n• Button — Clickable interaction\n• Vertical/Horizontal Box — Layout containers\n• Canvas Panel — Free positioning\n• Scroll Box — Scrollable content\n\n**Binding Widget to Game Data:**\nOption 1: Binding (easiest)\n• Click bind on a widget property\n• Return the value from your game variable\n• Updates every tick (performance cost)\n\nOption 2: Event-driven (recommended)\n• Listen for OnHealthChanged Dispatcher\n• Update widget manually when event fires\n• Much more performant\n\n**Adding Widget to Screen:**\nCreate Widget → Add to Viewport\n\n**Removing Widget:**\nRemove From Parent\n\n**Best Practice:** Create widgets in Player Controller or HUD class, not in the Character Blueprint. Keep UI separated from gameplay logic.",
        xpReward: 280,
        estimatedMinutes: 16,
        tags: ["ui", "widget", "hud"],
        quizQuestions: [
          {
            id: "q021",
            question: "Why is the event-driven approach preferred over bindings for widgets?",
            options: [
              "Bindings look better in the designer",
              "Event-driven updates only when needed, bindings check every tick (performance)",
              "Events work on mobile, bindings don't",
              "Bindings require C++ code"
            ],
            correctIndex: 1,
            explanation: "Bindings evaluate every frame (60+ times/sec). Event-driven updates only fire when data actually changes, using far less CPU."
          }
        ]
      }
    ]
  },
  {
    id: "mod_ai",
    title: "AI Blueprint Basics",
    description: "Behavior trees, blackboards, and simple AI enemies",
    icon: "cpu",
    difficulty: "advanced",
    color: "#7B4FFF",
    xpRequired: 2000,
    lessons: [
      {
        id: "les_014",
        moduleId: "mod_ai",
        title: "Behavior Trees & Blackboards",
        description: "Build intelligent enemy AI with behavior trees",
        content: "Unreal Engine's AI system is built around two key assets: Behavior Trees and Blackboards.\n\n**Blackboard:**\nA shared memory space — like a whiteboard the AI can read and write.\nKeys: PlayerActor (Object), LastKnownLocation (Vector), IsPlayerInRange (Boolean), AIState (Name)\n\n**Behavior Tree:**\nA graph that defines how the AI makes decisions. Processes from left to right, top to bottom.\n\n**Behavior Tree Nodes:**\n• Selector (?) — Tries children left to right, stops at first success\n• Sequence (→) — Runs children in order, stops at first failure\n• Task — Leaf node that does something (Move To, Wait, Custom tasks)\n• Decorator — Condition attached to any node (Check BB Key, Is In Range)\n• Service — Runs repeatedly while branch is active (Update Target Location)\n\n**Simple Chase AI setup:**\n```\nRoot → Selector\n  ├── Sequence (Chase Player)\n  │   ├── [Decorator: IsPlayerInRange = true]\n  │   └── Task: Move To (Target: PlayerActor)\n  └── Sequence (Patrol)\n      └── Task: Move To (Target: PatrolPoint)\n```\n\n**AI Controller:**\nAll AI needs an AI Controller. Assign your Behavior Tree in BeginPlay using Run Behavior Tree.\n\n**Pawn Sensing:**\nUse PawnSensingComponent to detect players visually or by sound. Binds to OnSeePawn event.",
        xpReward: 400,
        estimatedMinutes: 25,
        tags: ["ai", "behavior-tree", "enemy"],
        quizQuestions: [
          {
            id: "q022",
            question: "What does a Blackboard store in the AI system?",
            options: [
              "The visual appearance of the AI",
              "Shared data the AI can read and write — like player location, states",
              "The enemy's health points",
              "Animation sequences"
            ],
            correctIndex: 1,
            explanation: "The Blackboard is a shared data store for the AI — it holds keys like PlayerActor, LastKnownLocation, and IsPlayerInRange that the Behavior Tree reads."
          }
        ]
      }
    ]
  },
  {
    id: "mod_optimization",
    title: "Optimization & Best Practices",
    description: "Write efficient Blueprints, avoid common mistakes, debug like a pro",
    icon: "trending-up",
    difficulty: "expert",
    color: "#FFB800",
    xpRequired: 3000,
    lessons: [
      {
        id: "les_015",
        moduleId: "mod_optimization",
        title: "Blueprint Optimization",
        description: "Avoid common performance pitfalls and write efficient Blueprints",
        content: "Blueprints are powerful but can become performance bottlenecks if not optimized. Here are the most important practices.\n\n**NEVER do these in Tick:**\n• GetAllActorsOfClass — Expensive O(n) scan every frame\n• Cast To — Cache the result in BeginPlay\n• Overlap events searching the whole world\n• Heavy string operations\n• Creating/Destroying actors (use object pooling)\n\n**Use Events, Not Tick:**\nIf you're doing something in Tick that could be triggered by an event, use the event.\nBAD: Check overlap in Tick → GOOD: Use OnComponentBeginOverlap event\n\n**Set Timer by Function Name:**\nInstead of checking a condition in Tick, set a timer to check periodically.\n\n**Object Pooling:**\nDon't Spawn/Destroy actors constantly. Create a pool of pre-spawned actors, activate/deactivate as needed.\n\n**LOD & Disable Tick:**\nDisable tick on actors that don't need it. Set minimum tick interval for non-critical Blueprints.\n\n**Blueprint Nativization (Legacy):**\nConvert hot Blueprints to C++ for critical paths.\n\n**Profiling Tools:**\n• Stat Game — Show frame times\n• Blueprint Profiler — Find expensive nodes\n• GPU Visualizer — GPU bottlenecks\n\n**Common Mistakes:**\n• Using Delay in Tick\n• Not using Is Valid before accessing actors\n• Forgetting to Unbind dispatchers (memory leaks)\n• Using String comparison instead of Name comparison",
        xpReward: 500,
        estimatedMinutes: 20,
        tags: ["optimization", "performance", "best-practices"],
        quizQuestions: [
          {
            id: "q023",
            question: "Why is GetAllActorsOfClass dangerous in Tick?",
            options: [
              "It crashes the engine",
              "It scans ALL actors in the level every frame — very expensive",
              "It only works in C++",
              "It returns outdated data"
            ],
            correctIndex: 1,
            explanation: "GetAllActorsOfClass iterates through every actor in the level. Called 60 times/second in Tick, this is extremely expensive. Cache results or use a manager pattern instead."
          }
        ]
      }
    ]
  }
];

export const REAL_WORLD_EXAMPLES = [
  {
    id: "ex_001",
    title: "Open Door by Trigger",
    category: "Interaction",
    difficulty: "beginner" as Difficulty,
    description: "Create a door that opens when the player enters a trigger volume",
    steps: [
      "Create Box Trigger component on the door Actor",
      "Bind OnComponentBeginOverlap event",
      "Cast hit actor to BP_Character to verify it's the player",
      "Play Timeline to smoothly rotate door",
      "Bind OnComponentEndOverlap to close door"
    ],
    nodes: ["Box Trigger", "OnComponentBeginOverlap", "Cast To", "Timeline", "SetRelativeRotation"],
    color: "#39D353"
  },
  {
    id: "ex_002",
    title: "Health & Damage System",
    category: "Gameplay",
    difficulty: "basic" as Difficulty,
    description: "Complete health system with damage, healing, and death",
    steps: [
      "Add CurrentHealth and MaxHealth Float variables",
      "Create TakeDamage function with Float input",
      "Clamp health between 0 and MaxHealth",
      "Create OnDeath custom event",
      "Create OnHealthChanged dispatcher for HUD updates"
    ],
    nodes: ["Variables", "Functions", "Clamp", "Event Dispatcher", "Branch"],
    color: "#FF4757"
  },
  {
    id: "ex_003",
    title: "Pickup System",
    category: "Gameplay",
    difficulty: "beginner" as Difficulty,
    description: "Items the player can pick up to restore health or collect",
    steps: [
      "Create Pickup Actor with Static Mesh and Sphere Collision",
      "Bind OnComponentBeginOverlap",
      "Implement IPickupable interface",
      "Call interface function on overlapping actor",
      "Destroy self after pickup with particle effect"
    ],
    nodes: ["Sphere Collision", "Interface", "DestroyActor", "SpawnEmitterAtLocation"],
    color: "#00D4FF"
  },
  {
    id: "ex_004",
    title: "Simple Shooting",
    category: "Combat",
    difficulty: "intermediate" as Difficulty,
    description: "Hitscan weapon using line trace from camera",
    steps: [
      "Get Camera Location and Forward Vector",
      "Multiply forward vector by trace distance",
      "Line Trace by Channel (Visibility)",
      "Check if hit actor implements IDamageable",
      "Call TakeDamage through interface"
    ],
    nodes: ["GetPlayerCamera", "LineTrace", "GetHitResultUnderCursor", "Interface Call", "DrawDebugLine"],
    color: "#FF6B35"
  },
  {
    id: "ex_005",
    title: "Simple Inventory",
    category: "Systems",
    difficulty: "intermediate" as Difficulty,
    description: "Array-based inventory system with add/remove",
    steps: [
      "Create ItemData struct with Name, Icon, Quantity",
      "Add Items array variable (Array of ItemData)",
      "Create AddItem function — check stack limit",
      "Create RemoveItem function — check quantity",
      "Create OnInventoryChanged dispatcher for UI"
    ],
    nodes: ["Array", "Struct", "For Each Loop", "Find", "Dispatcher"],
    color: "#7B4FFF"
  },
  {
    id: "ex_006",
    title: "Save & Load Game",
    category: "Systems",
    difficulty: "advanced" as Difficulty,
    description: "Persistent save game using SaveGame object",
    steps: [
      "Create SaveGame Blueprint class",
      "Add variables to save: PlayerHealth, Level, Inventory",
      "Create SaveGame function using Save Game to Slot",
      "Create LoadGame function using Load Game from Slot",
      "Call save on checkpoint overlap, load on game start"
    ],
    nodes: ["SaveGameObject", "SaveGameToSlot", "LoadGameFromSlot", "Cast To SaveGame", "AsyncSaveGame"],
    color: "#FFB800"
  }
];

export function getDifficultyLabel(d: Difficulty): string {
  switch (d) {
    case "beginner": return "Beginner";
    case "basic": return "Basic";
    case "intermediate": return "Intermediate";
    case "advanced": return "Advanced";
    case "expert": return "Expert";
  }
}

export function getDifficultyColor(d: Difficulty): string {
  switch (d) {
    case "beginner": return "#39D353";
    case "basic": return "#00D4FF";
    case "intermediate": return "#FFB800";
    case "advanced": return "#FF6B35";
    case "expert": return "#FF4757";
  }
}

export const ACHIEVEMENTS = [
  { id: "ach_001", title: "First Steps", description: "Complete your first lesson", icon: "star", xpRequired: 0, completedLessons: 1 },
  { id: "ach_002", title: "Blueprint Novice", description: "Complete 5 lessons", icon: "award", xpRequired: 0, completedLessons: 5 },
  { id: "ach_003", title: "Consistent Learner", description: "Maintain a 3-day streak", icon: "zap", xpRequired: 0, completedLessons: 0 },
  { id: "ach_004", title: "Blueprint Apprentice", description: "Reach 500 XP", icon: "trending-up", xpRequired: 500, completedLessons: 0 },
  { id: "ach_005", title: "Blueprint Developer", description: "Reach 1500 XP", icon: "code", xpRequired: 1500, completedLessons: 0 },
  { id: "ach_006", title: "Quiz Master", description: "Score 100% on 5 quizzes", icon: "check-circle", xpRequired: 0, completedLessons: 0 },
  { id: "ach_007", title: "Blueprint Architect", description: "Complete all basic modules", icon: "grid", xpRequired: 1000, completedLessons: 8 },
  { id: "ach_008", title: "Blueprint Expert", description: "Reach 3000 XP", icon: "cpu", xpRequired: 3000, completedLessons: 0 },
];
