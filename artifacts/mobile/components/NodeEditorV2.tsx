import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";

const { width: SW, height: SH } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

type PinType = "exec" | "bool" | "int" | "float" | "vector" | "string" | "object" | "rotator" | "name";
type VarType = "bool" | "int32" | "float" | "FVector" | "FRotator" | "FString" | "FName";
type NodeCategory = "Events" | "Flow" | "Math" | "Vector" | "String" | "Actor" | "Variable" | "Cast" | "IO";

interface Pin {
  id: string;
  label: string;
  type: PinType;
  side: "input" | "output";
}

interface EditableField {
  id: string;
  label: string;
  placeholder: string;
  keyboard?: "default" | "decimal-pad";
}

interface NodeTemplate {
  templateId: string;
  title: string;
  subtitle?: string;
  category: NodeCategory;
  inputs: Omit<Pin, "side">[];
  outputs: Omit<Pin, "side">[];
  fields?: EditableField[];
}

interface NENode extends NodeTemplate {
  id: string;
  x: number;
  y: number;
  fieldValues: Record<string, string>;
}

interface NEConnection {
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;
}

interface Variable {
  id: string;
  name: string;
  type: VarType;
  defaultValue: string;
  flags: {
    editAnywhere: boolean;
    blueprintReadWrite: boolean;
    blueprintReadOnly: boolean;
    exposeOnSpawn: boolean;
    transient: boolean;
    category: string;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PIN_COLORS: Record<PinType, string> = {
  exec:    "#FFFFFF",
  bool:    "#C0392B",
  int:     "#5DADE2",
  float:   "#58D68D",
  vector:  "#F4D03F",
  string:  "#A569BD",
  object:  "#1ABC9C",
  rotator: "#7B68EE",
  name:    "#F39C12",
};

const CAT_COLORS: Record<NodeCategory, [string, string]> = {
  Events:   ["#7F1D1D", "#B91C1C"],
  Flow:     ["#3B0764", "#7C3AED"],
  Math:     ["#0C4A6E", "#0369A1"],
  Vector:   ["#713F12", "#A16207"],
  String:   ["#3B0764", "#9333EA"],
  Actor:    ["#042F2E", "#0F766E"],
  Variable: ["#431407", "#C2410C"],
  Cast:     ["#14532D", "#15803D"],
  IO:       ["#1E1B4B", "#4338CA"],
};

const VAR_TYPE_PIN: Record<VarType, PinType> = {
  bool: "bool", int32: "int", float: "float",
  FVector: "vector", FRotator: "rotator", FString: "string", FName: "name",
};

const VAR_TYPE_CPP: Record<VarType, string> = {
  bool: "bool", int32: "int32", float: "float",
  FVector: "FVector", FRotator: "FRotator", FString: "FString", FName: "FName",
};

const VAR_DEFAULT_CPP: Record<VarType, string> = {
  bool: "false", int32: "0", float: "0.0f",
  FVector: "FVector::ZeroVector", FRotator: "FRotator::ZeroRotator",
  FString: "TEXT(\"\")", FName: "NAME_None",
};

const NODE_W = 210;
const HEADER_H = 36;
const PIN_ROW_H = 28;
const PIN_DOT = 12;

// ─── Node Templates ───────────────────────────────────────────────────────────

const TEMPLATES: NodeTemplate[] = [
  // Events
  { templateId: "event_beginplay", title: "Event BeginPlay", category: "Events",
    inputs: [], outputs: [{ id: "exec", label: "", type: "exec" }] },
  { templateId: "event_tick", title: "Event Tick", category: "Events",
    inputs: [], outputs: [{ id: "exec", label: "", type: "exec" }, { id: "delta", label: "Delta Seconds", type: "float" }] },
  { templateId: "event_custom", title: "Custom Event", category: "Events",
    inputs: [], outputs: [{ id: "exec", label: "", type: "exec" }],
    fields: [{ id: "name", label: "Event Name", placeholder: "MyEvent" }] },
  // Flow
  { templateId: "branch", title: "Branch", category: "Flow",
    inputs: [{ id: "exec", label: "", type: "exec" }, { id: "cond", label: "Condition", type: "bool" }],
    outputs: [{ id: "true", label: "True", type: "exec" }, { id: "false", label: "False", type: "exec" }] },
  { templateId: "sequence", title: "Sequence", category: "Flow",
    inputs: [{ id: "exec", label: "", type: "exec" }],
    outputs: [{ id: "then0", label: "Then 0", type: "exec" }, { id: "then1", label: "Then 1", type: "exec" }, { id: "then2", label: "Then 2", type: "exec" }] },
  { templateId: "delay", title: "Delay", category: "Flow",
    inputs: [{ id: "exec", label: "", type: "exec" }, { id: "dur", label: "Duration", type: "float" }],
    outputs: [{ id: "completed", label: "Completed", type: "exec" }],
    fields: [{ id: "duration", label: "Duration", placeholder: "1.0", keyboard: "decimal-pad" }] },
  { templateId: "forloop", title: "For Loop", category: "Flow",
    inputs: [{ id: "exec", label: "", type: "exec" }, { id: "first", label: "First Index", type: "int" }, { id: "last", label: "Last Index", type: "int" }],
    outputs: [{ id: "body", label: "Loop Body", type: "exec" }, { id: "index", label: "Index", type: "int" }, { id: "completed", label: "Completed", type: "exec" }] },
  { templateId: "whileloop", title: "While Loop", category: "Flow",
    inputs: [{ id: "exec", label: "", type: "exec" }, { id: "cond", label: "Condition", type: "bool" }],
    outputs: [{ id: "body", label: "Loop Body", type: "exec" }, { id: "completed", label: "Completed", type: "exec" }] },
  // Math
  { templateId: "math_add", title: "Add", subtitle: "float + float", category: "Math",
    inputs: [{ id: "a", label: "A", type: "float" }, { id: "b", label: "B", type: "float" }],
    outputs: [{ id: "result", label: "Result", type: "float" }] },
  { templateId: "math_sub", title: "Subtract", subtitle: "float - float", category: "Math",
    inputs: [{ id: "a", label: "A", type: "float" }, { id: "b", label: "B", type: "float" }],
    outputs: [{ id: "result", label: "Result", type: "float" }] },
  { templateId: "math_mul", title: "Multiply", subtitle: "float × float", category: "Math",
    inputs: [{ id: "a", label: "A", type: "float" }, { id: "b", label: "B", type: "float" }],
    outputs: [{ id: "result", label: "Result", type: "float" }] },
  { templateId: "math_div", title: "Divide", subtitle: "float ÷ float", category: "Math",
    inputs: [{ id: "a", label: "A", type: "float" }, { id: "b", label: "B", type: "float" }],
    outputs: [{ id: "result", label: "Result", type: "float" }] },
  { templateId: "random_float", title: "Random Float in Range", category: "Math",
    inputs: [{ id: "min", label: "Min", type: "float" }, { id: "max", label: "Max", type: "float" }],
    outputs: [{ id: "result", label: "Return Value", type: "float" }] },
  { templateId: "map_range", title: "Map Range Clamped", category: "Math",
    inputs: [{ id: "val", label: "Value", type: "float" }, { id: "in_a", label: "In Range A", type: "float" }, { id: "in_b", label: "In Range B", type: "float" }, { id: "out_a", label: "Out Range A", type: "float" }, { id: "out_b", label: "Out Range B", type: "float" }],
    outputs: [{ id: "result", label: "Return Value", type: "float" }] },
  // Vector
  { templateId: "make_vector", title: "Make Vector", category: "Vector",
    inputs: [{ id: "x", label: "X", type: "float" }, { id: "y", label: "Y", type: "float" }, { id: "z", label: "Z", type: "float" }],
    outputs: [{ id: "result", label: "Return Value", type: "vector" }] },
  { templateId: "break_vector", title: "Break Vector", category: "Vector",
    inputs: [{ id: "vec", label: "In Vec", type: "vector" }],
    outputs: [{ id: "x", label: "X", type: "float" }, { id: "y", label: "Y", type: "float" }, { id: "z", label: "Z", type: "float" }] },
  { templateId: "vector_add", title: "Vector + Vector", category: "Vector",
    inputs: [{ id: "a", label: "A", type: "vector" }, { id: "b", label: "B", type: "vector" }],
    outputs: [{ id: "result", label: "Result", type: "vector" }] },
  { templateId: "vector_mul", title: "Vector × Float", category: "Vector",
    inputs: [{ id: "vec", label: "Vector", type: "vector" }, { id: "scale", label: "Scale", type: "float" }],
    outputs: [{ id: "result", label: "Result", type: "vector" }] },
  { templateId: "vector_length", title: "Vector Length", category: "Vector",
    inputs: [{ id: "vec", label: "Vector", type: "vector" }],
    outputs: [{ id: "length", label: "Length", type: "float" }] },
  // String
  { templateId: "append_string", title: "Append", subtitle: "string concat", category: "String",
    inputs: [{ id: "a", label: "A", type: "string" }, { id: "b", label: "B", type: "string" }],
    outputs: [{ id: "result", label: "Return Value", type: "string" }] },
  { templateId: "format_string", title: "Format String", category: "String",
    inputs: [{ id: "fmt", label: "Format", type: "string" }, { id: "arg0", label: "{0}", type: "string" }, { id: "arg1", label: "{1}", type: "string" }],
    outputs: [{ id: "result", label: "Result", type: "string" }],
    fields: [{ id: "format", label: "Format", placeholder: "Hello {0}!" }] },
  { templateId: "print_string", title: "Print String", category: "IO",
    inputs: [{ id: "exec", label: "", type: "exec" }, { id: "str", label: "In String", type: "string" }],
    outputs: [{ id: "exec", label: "", type: "exec" }],
    fields: [{ id: "text", label: "Text", placeholder: "Hello!" }, { id: "duration", label: "Duration", placeholder: "2.0", keyboard: "decimal-pad" }] },
  // Actor
  { templateId: "spawn_actor", title: "Spawn Actor from Class", category: "Actor",
    inputs: [{ id: "exec", label: "", type: "exec" }, { id: "class", label: "Class", type: "object" }, { id: "transform", label: "Spawn Transform", type: "vector" }],
    outputs: [{ id: "exec", label: "", type: "exec" }, { id: "actor", label: "Return Value", type: "object" }] },
  { templateId: "destroy_actor", title: "Destroy Actor", category: "Actor",
    inputs: [{ id: "exec", label: "", type: "exec" }, { id: "target", label: "Target", type: "object" }],
    outputs: [{ id: "exec", label: "", type: "exec" }] },
  { templateId: "get_location", title: "Get Actor Location", category: "Actor",
    inputs: [{ id: "target", label: "Target", type: "object" }],
    outputs: [{ id: "location", label: "Return Value", type: "vector" }] },
  { templateId: "set_location", title: "Set Actor Location", category: "Actor",
    inputs: [{ id: "exec", label: "", type: "exec" }, { id: "target", label: "Target", type: "object" }, { id: "loc", label: "New Location", type: "vector" }],
    outputs: [{ id: "exec", label: "", type: "exec" }, { id: "swept", label: "Swept", type: "bool" }] },
  { templateId: "get_rotation", title: "Get Actor Rotation", category: "Actor",
    inputs: [{ id: "target", label: "Target", type: "object" }],
    outputs: [{ id: "rotation", label: "Return Value", type: "rotator" }] },
  { templateId: "set_rotation", title: "Set Actor Rotation", category: "Actor",
    inputs: [{ id: "exec", label: "", type: "exec" }, { id: "target", label: "Target", type: "object" }, { id: "rot", label: "New Rotation", type: "rotator" }],
    outputs: [{ id: "exec", label: "", type: "exec" }] },
  { templateId: "add_movement", title: "Add Movement Input", category: "Actor",
    inputs: [{ id: "exec", label: "", type: "exec" }, { id: "dir", label: "World Direction", type: "vector" }, { id: "scale", label: "Scale Value", type: "float" }],
    outputs: [{ id: "exec", label: "", type: "exec" }] },
  { templateId: "line_trace", title: "Line Trace by Channel", category: "Actor",
    inputs: [{ id: "exec", label: "", type: "exec" }, { id: "start", label: "Start", type: "vector" }, { id: "end", label: "End", type: "vector" }],
    outputs: [{ id: "hit", label: "Hit", type: "exec" }, { id: "no_hit", label: "No Hit", type: "exec" }, { id: "out_hit", label: "Out Hit", type: "object" }] },
  // Cast
  { templateId: "cast_to", title: "Cast To", category: "Cast",
    inputs: [{ id: "exec", label: "", type: "exec" }, { id: "obj", label: "Object", type: "object" }],
    outputs: [{ id: "success", label: "Cast Succeeded", type: "exec" }, { id: "fail", label: "Cast Failed", type: "exec" }, { id: "ref", label: "As Object", type: "object" }],
    fields: [{ id: "class", label: "Target Class", placeholder: "AMyActor" }] },
];

const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.templateId, t]));
const CATEGORIES = [...new Set(TEMPLATES.map((t) => t.category))] as NodeCategory[];

// ─── Helpers ──────────────────────────────────────────────────────────────────

let _id = 1;
const uid = () => `n${_id++}`;

function makeNode(templateId: string, x: number, y: number): NENode {
  const tmpl = TEMPLATE_MAP[templateId];
  return {
    ...tmpl,
    id: uid(),
    x,
    y,
    fieldValues: Object.fromEntries((tmpl.fields || []).map((f) => [f.id, ""])),
  };
}

function getPinY(pinsOnSide: Omit<Pin, "side">[], fieldCount: number, pinIndex: number) {
  return HEADER_H + fieldCount * 32 + 6 + pinIndex * PIN_ROW_H + PIN_ROW_H / 2;
}

// ─── Exporters ────────────────────────────────────────────────────────────────

function exportCpp(nodes: NENode[], vars: Variable[], graphName: string): { header: string; impl: string } {
  const className = `A${graphName.replace(/\s+/g, "_")}`;
  const upropLines = vars.map((v) => {
    const flags = [
      v.flags.editAnywhere ? "EditAnywhere" : "VisibleAnywhere",
      v.flags.blueprintReadOnly ? "BlueprintReadOnly" : v.flags.blueprintReadWrite ? "BlueprintReadWrite" : "",
      v.flags.exposeOnSpawn ? 'meta=(ExposeOnSpawn)' : "",
      v.flags.transient ? "Transient" : "",
    ].filter(Boolean).join(", ");
    const cat = v.flags.category || "Variables";
    const cppType = VAR_TYPE_CPP[v.type];
    const defVal = v.defaultValue || VAR_DEFAULT_CPP[v.type];
    return `\t/** Auto-generated from UE5 Node Editor */\n\tUPROPERTY(${flags}, Category="${cat}")\n\t${cppType} ${v.name} = ${defVal};\n`;
  });

  const hasTick = nodes.some((n) => n.templateId === "event_tick");
  const hasBeginPlay = nodes.some((n) => n.templateId === "event_beginplay");
  const customEvents = nodes.filter((n) => n.templateId === "event_custom").map((n) => n.fieldValues["name"] || "MyEvent");

  const ufuncDecls = customEvents.map((e) => `\tUFUNCTION(BlueprintCallable, Category="Events")\n\tvoid ${e}();\n`);

  const header = `// ${className}.h — Auto-generated by UE5 Node Editor
// Copy to: Source/YourProject/${className}.h

#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "${className}.generated.h"

UCLASS(Blueprintable, BlueprintType)
class YOURPROJECT_API ${className} : public AActor
{
\tGENERATED_BODY()

public:
\t${className}();

${upropLines.join("\n")}
${ufuncDecls.join("\n")}
protected:${hasBeginPlay ? "\n\tvirtual void BeginPlay() override;" : ""}${hasTick ? "\n\tvirtual void Tick(float DeltaTime) override;" : ""}
};
`;

  const mathNodeCode = (n: NENode) => {
    const ops: Record<string, string> = {
      math_add: "+", math_sub: "-", math_mul: "*", math_div: "/",
    };
    const op = ops[n.templateId];
    return op ? `\t// ${n.title}\n\tfloat result_${n.id} = A ${op} B;\n` : "";
  };

  const nodeComments = nodes
    .filter((n) => !["event_beginplay", "event_tick", "event_custom"].includes(n.templateId))
    .map((n) => `\t// ${n.title}${n.fieldValues["name"] ? ` (${n.fieldValues["name"]})` : ""}`)
    .join("\n");

  const impl = `// ${className}.cpp — Auto-generated by UE5 Node Editor
// Copy to: Source/YourProject/${className}.cpp

#include "${className}.h"

${className}::${className}()
{${hasTick ? "\n\tPrimaryActorTick.bCanEverTick = true;" : ""}
}
${hasBeginPlay ? `
void ${className}::BeginPlay()
{
\tSuper::BeginPlay();

${nodeComments}
}
` : ""}${hasTick ? `
void ${className}::Tick(float DeltaTime)
{
\tSuper::Tick(DeltaTime);
}
` : ""}${customEvents.map((e) => `
void ${className}::${e}()
{
\t// TODO: implement event logic
}
`).join("")}`;

  return { header, impl };
}

function exportJson(nodes: NENode[], connections: NEConnection[], vars: Variable[]): string {
  return JSON.stringify({
    version: "1.0",
    variables: vars.map((v) => ({ id: v.id, name: v.name, type: v.type, defaultValue: v.defaultValue, flags: v.flags })),
    nodes: nodes.map((n) => ({
      id: n.id, templateId: n.templateId, type: n.category,
      title: n.title, position: { x: Math.round(n.x), y: Math.round(n.y) },
      fieldValues: n.fieldValues,
    })),
    edges: connections.map((c) => ({
      source: c.fromNodeId, sourceHandle: c.fromPinId,
      target: c.toNodeId, targetHandle: c.toPinId,
    })),
  }, null, 2);
}

function exportPython(): string {
  return `# import_blueprint.py — Run via: Tools → Execute Python Script in Unreal Editor
import unreal, json, os

GRAPH_FILE = unreal.Paths.project_content_dir() + "Blueprints/blueprint_graph.json"
BLUEPRINT_PATH = "/Game/Blueprints/GeneratedBlueprint"

def create_blueprint_from_json():
    if not os.path.exists(GRAPH_FILE):
        unreal.log_error(f"File not found: {GRAPH_FILE}")
        return

    with open(GRAPH_FILE, "r") as f:
        graph = json.load(f)

    asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
    factory = unreal.BlueprintFactory()
    factory.set_editor_property("parent_class", unreal.Actor)

    bp = asset_tools.create_asset(
        "GeneratedBlueprint", "/Game/Blueprints",
        unreal.Blueprint, factory
    )
    if bp is None:
        unreal.log_error("Failed to create Blueprint asset.")
        return

    unreal.log(f"✅ Blueprint created: {BLUEPRINT_PATH}")

    for var in graph.get("variables", []):
        unreal.log(f"  Variable: {var['name']} ({var['type']}) = {var['defaultValue']}")

    for node in graph.get("nodes", []):
        pos = node.get("position", {})
        unreal.log(f"  Node [{node['templateId']}] '{node['title']}' @ ({pos.get('x',0)}, {pos.get('y',0)})")

    for edge in graph.get("edges", []):
        unreal.log(f"  Edge: {edge['source']}.{edge['sourceHandle']} → {edge['target']}.{edge['targetHandle']}")

    unreal.EditorAssetLibrary.save_asset(BLUEPRINT_PATH)
    unreal.log("✅ Done! Check Content Browser → /Game/Blueprints/")

create_blueprint_from_json()
`;
}

function exportBlueprintText(nodes: NENode[], connections: NEConnection[]): string {
  const lines: string[] = [
    "Begin Object Class=/Script/Engine.Blueprint Name=\"GeneratedBlueprint\"",
    "   BlueprintType=BPTYPE_Normal",
    "   ParentClass=Class'/Script/Engine.Actor'",
  ];

  nodes.forEach((n, i) => {
    const tmplMap: Record<string, string> = {
      event_beginplay: "K2Node_Event",
      event_tick: "K2Node_Event",
      branch: "K2Node_IfThenElse",
      sequence: "K2Node_ExecutionSequence",
      delay: "K2Node_Delay",
      math_add: "K2Node_CallFunction",
      math_sub: "K2Node_CallFunction",
      math_mul: "K2Node_CallFunction",
      print_string: "K2Node_CallFunction",
      cast_to: "K2Node_DynamicCast",
    };
    const k2Class = tmplMap[n.templateId] || "K2Node_CallFunction";
    lines.push(`   Begin Object Class=/Script/BlueprintGraph.${k2Class} Name="${k2Class}_${i}"`);
    if (n.templateId === "event_beginplay") {
      lines.push(`      EventReference=(MemberParent=Class'/Script/Engine.Actor',MemberName="ReceiveBeginPlay")`);
      lines.push(`      bOverrideFunction=True`);
    } else if (n.templateId === "event_tick") {
      lines.push(`      EventReference=(MemberParent=Class'/Script/Engine.Actor',MemberName="ReceiveTick")`);
      lines.push(`      bOverrideFunction=True`);
    }
    lines.push(`      NodePosX=${Math.round(n.x)}`);
    lines.push(`      NodePosY=${Math.round(n.y)}`);
    lines.push(`   End Object`);
  });

  lines.push("End Object");
  lines.push("");
  lines.push("// Paste the above into Unreal Engine → Blueprints → Right-click → Paste Here");
  return lines.join("\n");
}

// ─── Wire ─────────────────────────────────────────────────────────────────────

function Wire({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 2) return null;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: (x1 + x2) / 2 - len / 2,
        top: (y1 + y2) / 2 - 2.5,
        width: len,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: color,
        transform: [{ rotate: `${angle}deg` }],
        shadowColor: color,
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 2,
        opacity: 0.9,
      }}
    />
  );
}

// ─── NodeCard ─────────────────────────────────────────────────────────────────

interface NodeCardProps {
  node: NENode;
  pos: { x: number; y: number };
  selectedPin: string | null;
  connections: NEConnection[];
  onPinPress: (nodeId: string, pinId: string, side: "input" | "output") => void;
  onDragStart: (id: string) => void;
  onDragMove: (dx: number, dy: number) => void;
  onDragEnd: () => void;
  onDelete: (id: string) => void;
  onFieldChange: (id: string, field: string, val: string) => void;
  isNew?: boolean;
}

function NodeCard({
  node, pos, selectedPin, connections,
  onPinPress, onDragStart, onDragMove, onDragEnd, onDelete, onFieldChange, isNew,
}: NodeCardProps) {
  const dragging = useRef(false);
  const [headerColor, headerColor2] = CAT_COLORS[node.category];
  const fieldCount = (node.fields || []).length;

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
      onPanResponderGrant: () => { dragging.current = true; onDragStart(node.id); Haptics.selectionAsync(); },
      onPanResponderMove: (_, g) => { if (dragging.current) onDragMove(g.dx, g.dy); },
      onPanResponderRelease: () => { dragging.current = false; onDragEnd(); },
      onPanResponderTerminate: () => { dragging.current = false; onDragEnd(); },
    })
  ).current;

  const renderPin = (pin: Omit<Pin, "side">, side: "input" | "output", idx: number) => {
    const allOnSide = side === "input" ? node.inputs : node.outputs;
    const color = PIN_COLORS[pin.type];
    const key = `${node.id}__${side === "input" ? "IN" : "OUT"}__${pin.id}`;
    const isSelected = selectedPin === key;
    const connected = connections.some((c) =>
      side === "input"
        ? c.toNodeId === node.id && c.toPinId === pin.id
        : c.fromNodeId === node.id && c.fromPinId === pin.id
    );
    const isExec = pin.type === "exec";

    return (
      <Pressable
        key={pin.id}
        style={[
          s.pinRow,
          side === "output" && s.pinRowRight,
        ]}
        onPress={() => onPinPress(node.id, pin.id, side)}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        {side === "input" && (
          isExec ? (
            <View style={[s.execPin, { borderColor: "#fff", backgroundColor: connected ? "#fff" : "transparent" }]} />
          ) : (
            <View style={[s.pinDot, {
              borderColor: color,
              backgroundColor: connected || isSelected ? color : "transparent",
              transform: [{ scale: isSelected ? 1.4 : 1 }],
            }]} />
          )
        )}
        {pin.label !== "" && (
          <Text style={[s.pinLabel, { color: connected ? color : "#8A9BB5" }, side === "output" && { textAlign: "right" }]}>
            {pin.label}
          </Text>
        )}
        {side === "output" && (
          isExec ? (
            <View style={[s.execPin, { borderColor: "#fff", backgroundColor: connected ? "#fff" : "transparent" }]} />
          ) : (
            <View style={[s.pinDot, {
              borderColor: color,
              backgroundColor: connected || isSelected ? color : "transparent",
              transform: [{ scale: isSelected ? 1.4 : 1 }],
            }]} />
          )
        )}
      </Pressable>
    );
  };

  const numRows = Math.max(node.inputs.length, node.outputs.length);

  return (
    <Animated.View
      entering={isNew ? ZoomIn.duration(220) : undefined}
      style={[s.card, { left: pos.x, top: pos.y, width: NODE_W }]}
    >
      <LinearGradient colors={[headerColor, headerColor2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={s.cardHeader} {...pan.panHandlers}>
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle} numberOfLines={1}>{node.title}</Text>
          {node.subtitle ? <Text style={s.cardSub} numberOfLines={1}>{node.subtitle}</Text> : null}
        </View>
        <Text style={s.catBadge}>{node.category}</Text>
        <TouchableOpacity onPress={() => { onDelete(node.id); Haptics.selectionAsync(); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="x" size={12} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={s.cardBody}>
        {(node.fields || []).map((f) => (
          <View key={f.id} style={s.fieldRow}>
            <Text style={s.fieldLabel}>{f.label}</Text>
            <TextInput
              style={s.fieldInput}
              placeholder={f.placeholder}
              placeholderTextColor="#4A5A70"
              value={node.fieldValues[f.id] ?? ""}
              onChangeText={(t) => onFieldChange(node.id, f.id, t)}
              keyboardType={f.keyboard ?? "default"}
              maxLength={40}
            />
          </View>
        ))}

        <View style={s.pinsArea}>
          <View style={s.pinsCol}>
            {node.inputs.map((p, i) => renderPin(p, "input", i))}
          </View>
          <View style={[s.pinsCol, { alignItems: "flex-end" }]}>
            {node.outputs.map((p, i) => renderPin(p, "output", i))}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

// ─── Variable Panel ───────────────────────────────────────────────────────────

const VAR_TYPES: VarType[] = ["bool", "int32", "float", "FVector", "FRotator", "FString", "FName"];
let _vid = 1;
const vid = () => `v${_vid++}`;

interface VarPanelProps {
  variables: Variable[];
  onChange: (vars: Variable[]) => void;
  onAddGetNode: (v: Variable) => void;
  onAddSetNode: (v: Variable) => void;
  onClose: () => void;
}

function VariablePanel({ variables, onChange, onAddGetNode, onAddSetNode, onClose }: VarPanelProps) {
  const [editId, setEditId] = useState<string | null>(null);

  const addVar = () => {
    const newVar: Variable = {
      id: vid(), name: "NewVar", type: "float", defaultValue: "0.0",
      flags: { editAnywhere: true, blueprintReadWrite: true, blueprintReadOnly: false, exposeOnSpawn: false, transient: false, category: "Variables" },
    };
    onChange([...variables, newVar]);
    setEditId(newVar.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateVar = (id: string, patch: Partial<Variable>) =>
    onChange(variables.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const updateFlags = (id: string, patch: Partial<Variable["flags"]>) =>
    onChange(variables.map((v) => (v.id === id ? { ...v, flags: { ...v.flags, ...patch } } : v)));

  const deleteVar = (id: string) => {
    onChange(variables.filter((v) => v.id !== id));
    if (editId === id) setEditId(null);
    Haptics.selectionAsync();
  };

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.panelOverlay}>
        <View style={s.panel}>
          <LinearGradient colors={["#1E1B4B", "#312E81"]} style={s.panelHeader}>
            <Feather name="database" size={16} color="#fff" />
            <Text style={s.panelTitle}>Variables</Text>
            <TouchableOpacity style={s.panelAddBtn} onPress={addVar}>
              <Feather name="plus" size={14} color="#fff" />
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <Feather name="x" size={18} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </LinearGradient>

          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
            {variables.length === 0 && (
              <Text style={s.emptyText}>No variables yet. Tap Add to create one.</Text>
            )}
            {variables.map((v) => {
              const pinColor = PIN_COLORS[VAR_TYPE_PIN[v.type]];
              const isEditing = editId === v.id;
              return (
                <View key={v.id} style={s.varRow}>
                  <Pressable style={s.varRowHeader} onPress={() => setEditId(isEditing ? null : v.id)}>
                    <View style={[s.varTypeDot, { backgroundColor: pinColor }]} />
                    <Text style={s.varName} numberOfLines={1}>{v.name}</Text>
                    <Text style={s.varType}>{v.type}</Text>
                    <View style={s.varActions}>
                      <TouchableOpacity style={s.varNodeBtn} onPress={() => { onAddGetNode(v); onClose(); }}>
                        <Text style={s.varNodeBtnText}>GET</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.varNodeBtn, { backgroundColor: "#431407" }]} onPress={() => { onAddSetNode(v); onClose(); }}>
                        <Text style={s.varNodeBtnText}>SET</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteVar(v.id)}>
                        <Feather name="trash-2" size={14} color="#FF4757" />
                      </TouchableOpacity>
                    </View>
                  </Pressable>

                  {isEditing && (
                    <View style={s.varEditor}>
                      <Text style={s.varEditorLabel}>Name</Text>
                      <TextInput style={s.varEditorInput} value={v.name}
                        onChangeText={(t) => updateVar(v.id, { name: t })}
                        placeholder="VariableName" placeholderTextColor="#4A5A70" />

                      <Text style={s.varEditorLabel}>Type</Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                        {VAR_TYPES.map((t) => (
                          <TouchableOpacity key={t} style={[s.typePill, v.type === t && s.typePillActive]}
                            onPress={() => updateVar(v.id, { type: t })}>
                            <Text style={[s.typePillText, v.type === t && { color: "#fff" }]}>{t}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      <Text style={s.varEditorLabel}>Default Value</Text>
                      <TextInput style={s.varEditorInput} value={v.defaultValue}
                        onChangeText={(t) => updateVar(v.id, { defaultValue: t })}
                        placeholder={VAR_DEFAULT_CPP[v.type]} placeholderTextColor="#4A5A70" />

                      <Text style={s.varEditorLabel}>Category</Text>
                      <TextInput style={s.varEditorInput} value={v.flags.category}
                        onChangeText={(t) => updateFlags(v.id, { category: t })}
                        placeholder="Variables" placeholderTextColor="#4A5A70" />

                      <View style={s.flagsGrid}>
                        {([
                          ["editAnywhere", "EditAnywhere"],
                          ["blueprintReadWrite", "BP ReadWrite"],
                          ["blueprintReadOnly", "BP ReadOnly"],
                          ["exposeOnSpawn", "ExposeOnSpawn"],
                          ["transient", "Transient"],
                        ] as const).map(([key, label]) => (
                          <View key={key} style={s.flagRow}>
                            <Text style={s.flagLabel}>{label}</Text>
                            <Switch
                              value={v.flags[key]}
                              onValueChange={(val) => updateFlags(v.id, { [key]: val })}
                              trackColor={{ false: "#1E2D42", true: "#4338CA" }}
                              thumbColor={v.flags[key] ? "#818CF8" : "#4A5A70"}
                            />
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Export Modal ─────────────────────────────────────────────────────────────

type ExportTab = "cpp" | "json" | "blueprint";

interface ExportModalProps {
  nodes: NENode[];
  connections: NEConnection[];
  variables: Variable[];
  graphName: string;
  onClose: () => void;
}

function ExportModal({ nodes, connections, variables, graphName, onClose }: ExportModalProps) {
  const [tab, setTab] = useState<ExportTab>("cpp");
  const { header, impl } = exportCpp(nodes, variables, graphName);
  const jsonStr = exportJson(nodes, connections, variables);
  const pythonStr = exportPython();
  const bpText = exportBlueprintText(nodes, connections);

  const share = async (content: string, name: string) => {
    try {
      await Share.share({ title: name, message: content });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch { }
  };

  const tabs: { id: ExportTab; label: string; icon: any }[] = [
    { id: "cpp", label: "C++", icon: "code" },
    { id: "json", label: "JSON + Python", icon: "layers" },
    { id: "blueprint", label: "BP Text", icon: "file-text" },
  ];

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.exportOverlay}>
        <Animated.View entering={FadeInDown.duration(300)} style={s.exportCard}>
          <LinearGradient colors={["#0C4A6E", "#1E1B4B"]} style={s.exportHeader}>
            <Feather name="download" size={16} color="#fff" />
            <Text style={s.exportTitle}>Export for Unreal Engine 5</Text>
            <TouchableOpacity onPress={onClose}><Feather name="x" size={18} color="rgba(255,255,255,0.7)" /></TouchableOpacity>
          </LinearGradient>

          <View style={s.exportTabs}>
            {tabs.map((t) => (
              <TouchableOpacity key={t.id} style={[s.exportTab, tab === t.id && s.exportTabActive]}
                onPress={() => setTab(t.id)}>
                <Feather name={t.icon} size={13} color={tab === t.id ? "#60A5FA" : "#8A9BB5"} />
                <Text style={[s.exportTabText, tab === t.id && { color: "#60A5FA" }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={s.exportBody} showsVerticalScrollIndicator={false}>
            {tab === "cpp" && (
              <>
                <View style={s.exportSection}>
                  <View style={s.exportSectionHeader}>
                    <Text style={s.exportSectionTitle}>{graphName.replace(/\s+/g, "_")}.h</Text>
                    <TouchableOpacity style={s.shareBtn} onPress={() => share(header, `A${graphName}.h`)}>
                      <Feather name="share" size={13} color="#60A5FA" />
                      <Text style={s.shareBtnText}>Share .h</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={s.codeBlock}><Text style={s.codeText}>{header}</Text></View>
                  </ScrollView>
                </View>
                <View style={s.exportSection}>
                  <View style={s.exportSectionHeader}>
                    <Text style={s.exportSectionTitle}>{graphName.replace(/\s+/g, "_")}.cpp</Text>
                    <TouchableOpacity style={s.shareBtn} onPress={() => share(impl, `A${graphName}.cpp`)}>
                      <Feather name="share" size={13} color="#60A5FA" />
                      <Text style={s.shareBtnText}>Share .cpp</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={s.codeBlock}><Text style={s.codeText}>{impl}</Text></View>
                  </ScrollView>
                </View>
                <View style={s.instructions}>
                  <Text style={s.instrTitle}>How to use</Text>
                  <Text style={s.instrText}>{"1. Copy both files to Source/YourProject/\n2. Right-click project → Regenerate Visual Studio project files\n3. Build (Ctrl+Shift+B)\n4. The class appears in Unreal's Class Browser"}</Text>
                </View>
              </>
            )}
            {tab === "json" && (
              <>
                <View style={s.exportSection}>
                  <View style={s.exportSectionHeader}>
                    <Text style={s.exportSectionTitle}>blueprint_graph.json</Text>
                    <TouchableOpacity style={s.shareBtn} onPress={() => share(jsonStr, "blueprint_graph.json")}>
                      <Feather name="share" size={13} color="#60A5FA" />
                      <Text style={s.shareBtnText}>Share JSON</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={s.codeBlock}><Text style={s.codeText}>{jsonStr}</Text></View>
                  </ScrollView>
                </View>
                <View style={s.exportSection}>
                  <View style={s.exportSectionHeader}>
                    <Text style={s.exportSectionTitle}>import_blueprint.py</Text>
                    <TouchableOpacity style={s.shareBtn} onPress={() => share(pythonStr, "import_blueprint.py")}>
                      <Feather name="share" size={13} color="#60A5FA" />
                      <Text style={s.shareBtnText}>Share .py</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={s.codeBlock}><Text style={s.codeText}>{pythonStr}</Text></View>
                  </ScrollView>
                </View>
                <View style={s.instructions}>
                  <Text style={s.instrTitle}>How to use</Text>
                  <Text style={s.instrText}>{"1. Copy blueprint_graph.json to Content/Blueprints/\n2. Copy import_blueprint.py anywhere accessible\n3. Unreal Editor → Tools → Execute Python Script\n4. Select import_blueprint.py and Run\n5. Blueprint appears in /Game/Blueprints/"}</Text>
                </View>
              </>
            )}
            {tab === "blueprint" && (
              <>
                <View style={s.exportSection}>
                  <View style={s.exportSectionHeader}>
                    <Text style={s.exportSectionTitle}>Blueprint Text Format</Text>
                    <TouchableOpacity style={s.shareBtn} onPress={() => share(bpText, "blueprint.bp.txt")}>
                      <Feather name="share" size={13} color="#60A5FA" />
                      <Text style={s.shareBtnText}>Share .txt</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={s.codeBlock}><Text style={s.codeText}>{bpText}</Text></View>
                  </ScrollView>
                </View>
                <View style={s.instructions}>
                  <Text style={s.instrTitle}>How to use</Text>
                  <Text style={s.instrText}>{"1. Open any Blueprint in Unreal Editor\n2. Right-click on the graph canvas\n3. Select Paste\n4. Or: copy the text above, open Blueprint, Ctrl+V\n\nNote: Complex nodes may require manual reconnection."}</Text>
                </View>
              </>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Palette ──────────────────────────────────────────────────────────────────

interface PaletteProps {
  onAdd: (templateId: string) => void;
  onClose: () => void;
}

function Palette({ onAdd, onClose }: PaletteProps) {
  const [search, setSearch] = useState("");
  const [selCat, setSelCat] = useState<NodeCategory | "All">("All");

  const filtered = TEMPLATES.filter((t) =>
    (selCat === "All" || t.category === selCat) &&
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.paletteOverlay}>
        <View style={s.paletteCard}>
          <LinearGradient colors={["#0F172A", "#1E293B"]} style={s.paletteHeader}>
            <Feather name="grid" size={16} color="#60A5FA" />
            <Text style={s.paletteTitle}>Node Palette</Text>
            <TouchableOpacity onPress={onClose}><Feather name="x" size={18} color="rgba(255,255,255,0.6)" /></TouchableOpacity>
          </LinearGradient>

          <View style={s.paletteSearch}>
            <Feather name="search" size={14} color="#4A5A70" />
            <TextInput
              style={s.paletteSearchInput}
              placeholder="Search nodes..."
              placeholderTextColor="#4A5A70"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.catScroll}>
            {(["All", ...CATEGORIES] as const).map((c) => (
              <TouchableOpacity key={c} style={[s.catChip, selCat === c && s.catChipActive]} onPress={() => setSelCat(c)}>
                <Text style={[s.catChipText, selCat === c && { color: "#fff" }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={s.paletteList} keyboardShouldPersistTaps="handled">
            {filtered.map((t) => {
              const [hc, hc2] = CAT_COLORS[t.category];
              return (
                <TouchableOpacity key={t.templateId} style={s.paletteItem}
                  onPress={() => { onAdd(t.templateId); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                  <View style={[s.paletteItemDot, { backgroundColor: hc2 }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.paletteItemTitle}>{t.title}</Text>
                    {t.subtitle && <Text style={s.paletteItemSub}>{t.subtitle}</Text>}
                  </View>
                  <Text style={s.paletteItemCat}>{t.category}</Text>
                  <Feather name="plus" size={16} color="#4A5A70" />
                </TouchableOpacity>
              );
            })}
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const INITIAL_NODES: NENode[] = [
  { ...makeNode("event_beginplay", 30, 60) },
  { ...makeNode("print_string", 280, 50), fieldValues: { text: "Hello from UE5!", duration: "2.0" } },
  { ...makeNode("math_add", 280, 200) },
];
const INITIAL_CONNECTIONS: NEConnection[] = [
  { fromNodeId: INITIAL_NODES[0].id, fromPinId: "exec", toNodeId: INITIAL_NODES[1].id, toPinId: "exec" },
];

export default function NodeEditorV2() {
  const [nodes, setNodes] = useState<NENode[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<NEConnection[]>(INITIAL_CONNECTIONS);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [newNodeIds, setNewNodeIds] = useState<Set<string>>(new Set());
  const [showPalette, setShowPalette] = useState(false);
  const [showVars, setShowVars] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [graphName, setGraphName] = useState("MyGraph");
  const [zoom, setZoom] = useState(1);

  const nodePos = useRef<Record<string, { x: number; y: number }>>({});
  nodes.forEach((n) => { if (!nodePos.current[n.id]) nodePos.current[n.id] = { x: n.x, y: n.y }; });
  const [, tick] = useState(0);
  const dragOrigin = useRef<{ id: string; sx: number; sy: number } | null>(null);

  const canvasW = Math.max(...nodes.map((n) => (nodePos.current[n.id]?.x ?? n.x) + NODE_W + 100), SW * 2);
  const canvasH = Math.max(...nodes.map((n) => (nodePos.current[n.id]?.y ?? n.y) + 300), SH * 1.5);

  const onDragStart = useCallback((id: string) => {
    const p = nodePos.current[id];
    if (p) dragOrigin.current = { id, sx: p.x, sy: p.y };
    setIsDragging(true);
  }, []);

  const onDragMove = useCallback((dx: number, dy: number) => {
    if (!dragOrigin.current) return;
    const { id, sx, sy } = dragOrigin.current;
    nodePos.current[id] = { x: Math.max(0, sx + dx / zoom), y: Math.max(0, sy + dy / zoom) };
    tick((v) => v + 1);
  }, [zoom]);

  const onDragEnd = useCallback(() => { dragOrigin.current = null; setIsDragging(false); }, []);

  const onPinPress = useCallback(async (nodeId: string, pinId: string, side: "input" | "output") => {
    const key = `${nodeId}__${side === "input" ? "IN" : "OUT"}__${pinId}`;
    if (!selectedPin) { await Haptics.selectionAsync(); setSelectedPin(key); return; }
    if (selectedPin === key) { setSelectedPin(null); return; }

    const parse = (k: string) => {
      const [nid, dir, pid] = k.split("__");
      return { nodeId: nid, dir: dir as "IN" | "OUT", pinId: pid };
    };
    const from = parse(selectedPin);
    const to = { nodeId, dir: side === "input" ? "IN" as const : "OUT" as const, pinId };
    if (from.dir === to.dir) { setSelectedPin(key); return; }

    const outP = from.dir === "OUT" ? from : to;
    const inP = from.dir === "IN" ? from : to;

    const exists = connections.some((c) =>
      c.fromNodeId === outP.nodeId && c.fromPinId === outP.pinId &&
      c.toNodeId === inP.nodeId && c.toPinId === inP.pinId
    );
    if (exists) {
      await Haptics.selectionAsync();
      setConnections((p) => p.filter((c) => !(c.fromNodeId === outP.nodeId && c.fromPinId === outP.pinId && c.toNodeId === inP.nodeId && c.toPinId === inP.pinId)));
      setSelectedPin(null); return;
    }
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConnections((p) => [...p.filter((c) => !(c.toNodeId === inP.nodeId && c.toPinId === inP.pinId)),
      { fromNodeId: outP.nodeId, fromPinId: outP.pinId, toNodeId: inP.nodeId, toPinId: inP.pinId }]);
    setSelectedPin(null);
  }, [selectedPin, connections]);

  const onDelete = useCallback((id: string) => {
    delete nodePos.current[id];
    setNodes((p) => p.filter((n) => n.id !== id));
    setConnections((p) => p.filter((c) => c.fromNodeId !== id && c.toNodeId !== id));
    setSelectedPin(null);
  }, []);

  const onFieldChange = useCallback((id: string, field: string, val: string) =>
    setNodes((p) => p.map((n) => n.id === id ? { ...n, fieldValues: { ...n.fieldValues, [field]: val } } : n)), []);

  const addNode = (templateId: string) => {
    const nx = 40;
    const ny = Math.min(Math.max(...nodes.map((n) => (nodePos.current[n.id]?.y ?? n.y) + 140), 60), SH - 300);
    const n = makeNode(templateId, nx, ny);
    nodePos.current[n.id] = { x: nx, y: ny };
    setNodes((p) => [...p, n]);
    setNewNodeIds((p) => new Set([...p, n.id]));
    setShowPalette(false);
  };

  const addVarNode = (v: Variable, kind: "get" | "set") => {
    const pinType = VAR_TYPE_PIN[v.type];
    const tmplId = kind === "get" ? `__var_get_${v.id}` : `__var_set_${v.id}`;
    const nx = 40;
    const ny = Math.min(Math.max(...nodes.map((n) => (nodePos.current[n.id]?.y ?? n.y) + 140), 60), SH - 300);
    const n: NENode = {
      id: uid(), templateId: tmplId,
      title: kind === "get" ? `Get ${v.name}` : `Set ${v.name}`,
      category: "Variable",
      inputs: kind === "set" ? [{ id: "exec", label: "", type: "exec" }, { id: "val", label: v.name, type: pinType }] : [],
      outputs: kind === "set"
        ? [{ id: "exec", label: "", type: "exec" }, { id: "val", label: v.name, type: pinType }]
        : [{ id: "val", label: v.name, type: pinType }],
      x: nx, y: ny, fieldValues: {},
    };
    nodePos.current[n.id] = { x: nx, y: ny };
    setNodes((p) => [...p, n]);
    setNewNodeIds((p) => new Set([...p, n.id]));
  };

  const reset = () => {
    nodePos.current = {};
    INITIAL_NODES.forEach((n) => { nodePos.current[n.id] = { x: n.x, y: n.y }; });
    setNodes(INITIAL_NODES);
    setConnections(INITIAL_CONNECTIONS);
    setSelectedPin(null);
    setNewNodeIds(new Set());
    tick((v) => v + 1);
    Haptics.selectionAsync();
  };

  // Pin position for wire rendering
  const getPinAbsPos = (node: NENode, pinId: string, side: "input" | "output") => {
    const pos = nodePos.current[node.id] || { x: node.x, y: node.y };
    const pins = side === "input" ? node.inputs : node.outputs;
    const fieldCount = (node.fields || []).length;
    const idx = pins.findIndex((p) => p.id === pinId);
    if (idx < 0) return null;
    const y = pos.y + HEADER_H + fieldCount * 32 + 6 + idx * PIN_ROW_H + PIN_ROW_H / 2;
    const x = side === "output" ? pos.x + NODE_W : pos.x;
    return { x, y };
  };

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <Feather name="cpu" size={17} color="#60A5FA" />
          <TextInput
            style={s.graphNameInput}
            value={graphName}
            onChangeText={setGraphName}
            placeholder="Graph name"
            placeholderTextColor="#4A5A70"
          />
          <View style={s.vBadge}><Text style={s.vBadgeText}>UE5</Text></View>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.hBtn} onPress={() => setShowVars(true)}>
            <Feather name="database" size={15} color="#A78BFA" />
          </TouchableOpacity>
          <TouchableOpacity style={s.hBtn} onPress={reset}>
            <Feather name="refresh-ccw" size={15} color="#8A9BB5" />
          </TouchableOpacity>
          <TouchableOpacity style={[s.hBtn, { backgroundColor: "#0C4A6E" }]} onPress={() => setShowExport(true)}>
            <Feather name="download" size={15} color="#60A5FA" />
            <Text style={{ color: "#60A5FA", fontSize: 11, fontWeight: "700" }}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toolbar */}
      <View style={s.toolbar}>
        <TouchableOpacity style={s.addNodeBtn} onPress={() => setShowPalette(true)}>
          <Feather name="grid" size={13} color="#60A5FA" />
          <Text style={s.addNodeText}>Add Node</Text>
        </TouchableOpacity>
        <View style={s.zoomRow}>
          <TouchableOpacity style={s.zoomBtn} onPress={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(1)))}>
            <Feather name="minus" size={13} color="#8A9BB5" />
          </TouchableOpacity>
          <Text style={s.zoomLabel}>{Math.round(zoom * 100)}%</Text>
          <TouchableOpacity style={s.zoomBtn} onPress={() => setZoom((z) => Math.min(2, +(z + 0.1).toFixed(1)))}>
            <Feather name="plus" size={13} color="#8A9BB5" />
          </TouchableOpacity>
        </View>
        <Text style={s.nodeCount}>{nodes.length} nodes · {connections.length} wires</Text>
      </View>

      {selectedPin && (
        <Animated.View entering={FadeIn.duration(150)} style={s.pinHint}>
          <Feather name="radio" size={11} color="#60A5FA" />
          <Text style={s.pinHintText}>Pin selected — tap another pin to connect or disconnect</Text>
          <Pressable onPress={() => setSelectedPin(null)}><Feather name="x" size={13} color="#8A9BB5" /></Pressable>
        </Animated.View>
      )}

      {/* Canvas */}
      <View style={s.canvasWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          scrollEnabled={!isDragging && !selectedPin} nestedScrollEnabled>
          <ScrollView showsVerticalScrollIndicator={false}
            scrollEnabled={!isDragging && !selectedPin} nestedScrollEnabled>
            <View style={[s.canvas, { width: canvasW * zoom, height: canvasH * zoom }]}>
              <View style={{ transform: [{ scale: zoom }], transformOrigin: "top left" as any, width: canvasW, height: canvasH }}>
                {/* Grid */}
                {Array.from({ length: Math.ceil(canvasH / 40) }).map((_, row) =>
                  Array.from({ length: Math.ceil(canvasW / 40) }).map((__, col) => (
                    <View key={`${row}_${col}`} style={[s.gridDot, { left: col * 40 + 20, top: row * 40 + 20 }]} />
                  ))
                )}

                {/* Wires */}
                {connections.map((c, i) => {
                  const fn = nodes.find((n) => n.id === c.fromNodeId);
                  const tn = nodes.find((n) => n.id === c.toNodeId);
                  if (!fn || !tn) return null;
                  const fp = getPinAbsPos(fn, c.fromPinId, "output");
                  const tp = getPinAbsPos(tn, c.toPinId, "input");
                  if (!fp || !tp) return null;
                  const fromPin = fn.outputs.find((p) => p.id === c.fromPinId);
                  const color = PIN_COLORS[fromPin?.type ?? "exec"];
                  return <Wire key={i} x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y} color={color} />;
                })}

                {/* Nodes */}
                {nodes.map((node) => {
                  const pos = nodePos.current[node.id] || { x: node.x, y: node.y };
                  return (
                    <NodeCard
                      key={node.id}
                      node={node}
                      pos={pos}
                      selectedPin={selectedPin}
                      connections={connections}
                      onPinPress={onPinPress}
                      onDragStart={onDragStart}
                      onDragMove={onDragMove}
                      onDragEnd={onDragEnd}
                      onDelete={onDelete}
                      onFieldChange={onFieldChange}
                      isNew={newNodeIds.has(node.id)}
                    />
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </ScrollView>
        <View style={s.canvasHint}>
          <Feather name="move" size={10} color="#2A3A50" />
          <Text style={s.canvasHintText}>Drag nodes · tap pins to wire · pinch-zoom with buttons above</Text>
        </View>
      </View>

      {showPalette && <Palette onAdd={addNode} onClose={() => setShowPalette(false)} />}
      {showVars && (
        <VariablePanel
          variables={variables}
          onChange={setVariables}
          onAddGetNode={(v) => addVarNode(v, "get")}
          onAddSetNode={(v) => addVarNode(v, "set")}
          onClose={() => setShowVars(false)}
        />
      )}
      {showExport && (
        <ExportModal
          nodes={nodes}
          connections={connections}
          variables={variables}
          graphName={graphName}
          onClose={() => setShowExport(false)}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const C = {
  bg: "#080C12", bgS: "#0F1520", bgT: "#141C28",
  card: "#0D1420", border: "#1E2D42",
  text: "#FFFFFF", textS: "#8A9BB5", textT: "#4A5A70",
  tint: "#60A5FA", accent: "#A78BFA",
};

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 14, paddingTop: 50, paddingBottom: 8,
    backgroundColor: C.bgS, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  graphNameInput: { fontSize: 16, fontWeight: "700", color: C.text, flex: 1 },
  vBadge: { backgroundColor: "#1E3A5F", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: C.tint + "50" },
  vBadgeText: { fontSize: 10, fontWeight: "800", color: C.tint, letterSpacing: 1 },
  headerRight: { flexDirection: "row", gap: 6, alignItems: "center" },
  hBtn: {
    flexDirection: "row", alignItems: "center", gap: 4,
    height: 32, paddingHorizontal: 8, borderRadius: 7,
    backgroundColor: C.bgT, borderWidth: 1, borderColor: C.border,
  },
  toolbar: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 12, paddingVertical: 7,
    backgroundColor: C.bgT, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  addNodeBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7,
    backgroundColor: "#1E3A5F", borderWidth: 1, borderColor: C.tint + "40",
  },
  addNodeText: { fontSize: 12, fontWeight: "700", color: C.tint },
  zoomRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  zoomBtn: { width: 26, height: 26, borderRadius: 6, backgroundColor: C.bgS, borderWidth: 1, borderColor: C.border, alignItems: "center", justifyContent: "center" },
  zoomLabel: { fontSize: 11, color: C.textS, fontWeight: "600", minWidth: 32, textAlign: "center" },
  nodeCount: { fontSize: 11, color: C.textT, marginLeft: "auto" as any },
  pinHint: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: C.tint + "18", borderBottomWidth: 1, borderBottomColor: C.tint + "30",
  },
  pinHintText: { flex: 1, fontSize: 11, color: C.textS },
  canvasWrapper: { flex: 1 },
  canvas: { backgroundColor: "#050810" },
  gridDot: { position: "absolute", width: 2, height: 2, borderRadius: 1, backgroundColor: "#1E2D42" },
  canvasHint: {
    position: "absolute", bottom: 10, left: 0, right: 0,
    flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 5,
    pointerEvents: "none" as any,
  },
  canvasHintText: { fontSize: 10, color: "#1E2D42" },

  // Node card
  card: {
    position: "absolute", borderRadius: 8, overflow: "hidden",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "#0D1420",
    shadowColor: "#000", shadowOpacity: 0.6, shadowRadius: 12, elevation: 6,
  },
  cardHeader: {
    height: HEADER_H, flexDirection: "row", alignItems: "center",
    paddingHorizontal: 8, gap: 6,
  },
  cardTitle: { fontSize: 12, fontWeight: "800", color: "#fff", letterSpacing: 0.3 },
  cardSub: { fontSize: 9, color: "rgba(255,255,255,0.6)", marginTop: 1 },
  catBadge: { fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: 0.5 },
  cardBody: { paddingVertical: 4 },
  fieldRow: { paddingHorizontal: 10, marginVertical: 2 },
  fieldLabel: { fontSize: 9, color: C.textT, marginBottom: 2, letterSpacing: 0.3 },
  fieldInput: {
    backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 5,
    borderWidth: 1, borderColor: C.border, color: C.text,
    fontSize: 11, paddingHorizontal: 7, paddingVertical: 4,
  },
  pinsArea: { flexDirection: "row", justifyContent: "space-between", paddingTop: 4 },
  pinsCol: { flex: 1 },
  pinRow: { flexDirection: "row", alignItems: "center", height: PIN_ROW_H, paddingLeft: 0, gap: 5 },
  pinRowRight: { flexDirection: "row-reverse", gap: 5 },
  pinDot: { width: PIN_DOT, height: PIN_DOT, borderRadius: PIN_DOT / 2, borderWidth: 2, marginHorizontal: 4 },
  execPin: { width: 12, height: 12, transform: [{ rotate: "45deg" }], borderWidth: 2, marginHorizontal: 4 },
  pinLabel: { fontSize: 10, fontWeight: "600", color: C.textS },

  // Variable panel
  panelOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  panel: { backgroundColor: C.bgS, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: SH * 0.85, borderTopWidth: 1, borderTopColor: C.border },
  panelHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  panelTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: "#fff" },
  panelAddBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#4338CA", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  emptyText: { textAlign: "center", color: C.textT, marginTop: 40, fontSize: 13 },
  varRow: { borderBottomWidth: 1, borderBottomColor: C.border },
  varRowHeader: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14, paddingVertical: 10 },
  varTypeDot: { width: 10, height: 10, borderRadius: 5 },
  varName: { flex: 1, fontSize: 13, fontWeight: "600", color: C.text },
  varType: { fontSize: 11, color: C.textT, fontFamily: "monospace" as any },
  varActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  varNodeBtn: { backgroundColor: "#14532D", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 5 },
  varNodeBtnText: { fontSize: 10, fontWeight: "800", color: "#4ADE80", letterSpacing: 0.5 },
  varEditor: { paddingHorizontal: 14, paddingBottom: 12, backgroundColor: C.bg },
  varEditorLabel: { fontSize: 10, color: C.textT, marginBottom: 3, marginTop: 8, letterSpacing: 0.5, textTransform: "uppercase" as any },
  varEditorInput: { backgroundColor: C.bgT, borderRadius: 7, borderWidth: 1, borderColor: C.border, color: C.text, fontSize: 12, paddingHorizontal: 10, paddingVertical: 7 },
  typePill: { marginRight: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, backgroundColor: C.bgT, borderWidth: 1, borderColor: C.border },
  typePillActive: { backgroundColor: "#4338CA", borderColor: "#818CF8" },
  typePillText: { fontSize: 11, fontWeight: "600", color: C.textS },
  flagsGrid: { marginTop: 8 },
  flagRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.border },
  flagLabel: { fontSize: 12, color: C.textS },

  // Export modal
  exportOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  exportCard: { backgroundColor: C.bgS, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: SH * 0.92, borderTopWidth: 1, borderTopColor: C.border },
  exportHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  exportTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: "#fff" },
  exportTabs: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.border },
  exportTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 10 },
  exportTabActive: { borderBottomWidth: 2, borderBottomColor: C.tint },
  exportTabText: { fontSize: 12, fontWeight: "600", color: C.textS },
  exportBody: { flex: 1, padding: 12 },
  exportSection: { marginBottom: 14 },
  exportSectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  exportSectionTitle: { fontSize: 12, fontWeight: "700", color: C.textS, fontFamily: "monospace" as any },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 7, backgroundColor: "#1E3A5F" },
  shareBtnText: { fontSize: 11, fontWeight: "700", color: C.tint },
  codeBlock: { backgroundColor: "#030508", borderRadius: 8, padding: 10, borderWidth: 1, borderColor: C.border },
  codeText: { fontSize: 10, color: "#6EE7B7", fontFamily: "monospace" as any, lineHeight: 16 },
  instructions: { backgroundColor: "#0C1A2E", borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  instrTitle: { fontSize: 12, fontWeight: "700", color: C.tint, marginBottom: 6 },
  instrText: { fontSize: 12, color: C.textS, lineHeight: 19 },

  // Palette
  paletteOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" },
  paletteCard: { backgroundColor: C.bgS, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: SH * 0.88, borderTopWidth: 1, borderTopColor: C.border },
  paletteHeader: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  paletteTitle: { flex: 1, fontSize: 16, fontWeight: "700", color: "#fff" },
  paletteSearch: { flexDirection: "row", alignItems: "center", gap: 8, margin: 10, backgroundColor: C.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: C.border },
  paletteSearchInput: { flex: 1, fontSize: 13, color: C.text },
  catScroll: { paddingHorizontal: 10, marginBottom: 4, flexGrow: 0 },
  catChip: { marginRight: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.bgT, borderWidth: 1, borderColor: C.border },
  catChipActive: { backgroundColor: "#1E3A5F", borderColor: C.tint },
  catChipText: { fontSize: 12, fontWeight: "600", color: C.textS },
  paletteList: { flex: 1, paddingHorizontal: 8 },
  paletteItem: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 10, backgroundColor: C.bgT, marginBottom: 6, borderWidth: 1, borderColor: C.border },
  paletteItemDot: { width: 10, height: 10, borderRadius: 5 },
  paletteItemTitle: { fontSize: 13, fontWeight: "600", color: C.text },
  paletteItemSub: { fontSize: 10, color: C.textT, marginTop: 2 },
  paletteItemCat: { fontSize: 10, color: C.textT, marginRight: 4 },
});
