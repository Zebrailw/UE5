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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";

import Colors from "@/constants/colors";
import { useTheme } from "@/context/ThemeContext";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

const C = Colors.dark;

const NODE_W = 180;
const NODE_HEADER_H = 38;
const PIN_H = 30;
const PIN_DOT = 14;

const PIN_COLORS: Record<string, string> = {
  value: "#6ADE89",
  inputA: "#5BC4FF",
  inputB: "#FFB74D",
  result: "#FF6B35",
};

const NODE_HEADER_COLORS: Record<string, [string, string]> = {
  input: ["#1B5E20", "#2E7D32"],
  math: ["#0D47A1", "#1565C0"],
  output: ["#4A148C", "#6A1B9A"],
};

const MATH_OPS = ["+", "-", "×", "÷"] as const;
type MathOp = (typeof MATH_OPS)[number];

interface Pin {
  id: string;
  label: string;
  side: "input" | "output";
}

interface NENode {
  id: string;
  type: "input" | "math" | "output";
  x: number;
  y: number;
  varName?: string;
  varValue?: string;
  operation?: MathOp;
  outName?: string;
}

interface Connection {
  fromNodeId: string;
  fromPinId: string;
  toNodeId: string;
  toPinId: string;
}

function getNodePins(node: NENode): { inputs: Pin[]; outputs: Pin[] } {
  if (node.type === "input") {
    return { inputs: [], outputs: [{ id: "value", label: "Value", side: "output" }] };
  }
  if (node.type === "math") {
    return {
      inputs: [
        { id: "inputA", label: "A", side: "input" },
        { id: "inputB", label: "B", side: "input" },
      ],
      outputs: [{ id: "result", label: "Result", side: "output" }],
    };
  }
  return { inputs: [{ id: "value", label: "Value", side: "input" }], outputs: [] };
}

function getPinPos(
  nodePos: { x: number; y: number },
  pins: Pin[],
  pinId: string,
  side: "input" | "output",
  numInputs: number
) {
  const list = pins.filter((p) => p.side === side);
  const idx = list.findIndex((p) => p.id === pinId);
  if (idx < 0) return null;
  const totalPins = Math.max(numInputs, 1);
  const bodyH = totalPins * PIN_H;
  const x = side === "output" ? nodePos.x + NODE_W : nodePos.x;
  const y = nodePos.y + NODE_HEADER_H + idx * PIN_H + PIN_H / 2;
  return { x, y };
}

interface WireProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  selected?: boolean;
}

function Wire({ x1, y1, x2, y2, color, selected }: WireProps) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 2) return null;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: cx - length / 2,
        top: cy - (selected ? 3.5 : 2.5),
        width: length,
        height: selected ? 7 : 5,
        borderRadius: 3.5,
        backgroundColor: color,
        transform: [{ rotate: `${angle}deg` }],
        opacity: selected ? 1 : 0.85,
        shadowColor: color,
        shadowOpacity: 0.8,
        shadowRadius: selected ? 10 : 6,
        elevation: 3,
      }}
    />
  );
}

interface NodeBodyProps {
  node: NENode;
  pos: { x: number; y: number };
  selectedPin: string | null;
  connections: Connection[];
  onPinPress: (nodeId: string, pinId: string, side: "input" | "output") => void;
  onDragStart: (nodeId: string) => void;
  onDragMove: (dx: number, dy: number) => void;
  onDragEnd: () => void;
  onDelete: (nodeId: string) => void;
  onUpdate: (nodeId: string, patch: Partial<NENode>) => void;
  isNew?: boolean;
}

function NodeBody({
  node, pos, selectedPin, connections,
  onPinPress, onDragStart, onDragMove, onDragEnd, onDelete, onUpdate, isNew,
}: NodeBodyProps) {
  const { inputs, outputs } = getNodePins(node);
  const allPins = [...inputs, ...outputs];
  const headerColors = NODE_HEADER_COLORS[node.type];
  const numRows = Math.max(inputs.length, outputs.length, 1);
  const isDraggingThis = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        isDraggingThis.current = true;
        onDragStart(node.id);
        Haptics.selectionAsync();
      },
      onPanResponderMove: (_, g) => {
        if (isDraggingThis.current) onDragMove(g.dx, g.dy);
      },
      onPanResponderRelease: () => { isDraggingThis.current = false; onDragEnd(); },
      onPanResponderTerminate: () => { isDraggingThis.current = false; onDragEnd(); },
    })
  ).current;

  const bodyH = numRows * PIN_H + 8;

  const typeLabel =
    node.type === "input" ? "INPUT" : node.type === "math" ? "MATH" : "OUTPUT";

  return (
    <Animated.View
      entering={isNew ? ZoomIn.duration(220) : undefined}
      style={[styles.nodeCard, { left: pos.x, top: pos.y, width: NODE_W }]}
    >
      <LinearGradient
        colors={headerColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.nodeHeader}
        {...panResponder.panHandlers}
      >
        <Text style={styles.nodeTypeTag}>{typeLabel}</Text>
        <TouchableOpacity
          onPress={() => { onDelete(node.id); Haptics.selectionAsync(); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteBtn}
        >
          <Feather name="x" size={12} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={[styles.nodeBody, { minHeight: bodyH }]}>
        {node.type === "input" && (
          <View style={styles.nodeFields}>
            <TextInput
              style={styles.fieldInput}
              placeholder="Var name"
              placeholderTextColor={C.textTertiary}
              value={node.varName ?? ""}
              onChangeText={(t) => onUpdate(node.id, { varName: t })}
              maxLength={16}
            />
            <TextInput
              style={[styles.fieldInput, { marginTop: 4 }]}
              placeholder="Value (e.g. 10.0)"
              placeholderTextColor={C.textTertiary}
              value={node.varValue ?? ""}
              onChangeText={(t) => onUpdate(node.id, { varValue: t })}
              keyboardType="decimal-pad"
              maxLength={12}
            />
          </View>
        )}

        {node.type === "math" && (
          <View style={styles.opRow}>
            {MATH_OPS.map((op) => (
              <TouchableOpacity
                key={op}
                style={[
                  styles.opBtn,
                  node.operation === op && styles.opBtnActive,
                ]}
                onPress={() => { onUpdate(node.id, { operation: op }); Haptics.selectionAsync(); }}
              >
                <Text style={[styles.opBtnText, node.operation === op && styles.opBtnTextActive]}>
                  {op}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {node.type === "output" && (
          <View style={styles.nodeFields}>
            <TextInput
              style={styles.fieldInput}
              placeholder="Output name"
              placeholderTextColor={C.textTertiary}
              value={node.outName ?? ""}
              onChangeText={(t) => onUpdate(node.id, { outName: t })}
              maxLength={16}
            />
          </View>
        )}

        <View style={styles.pinsContainer}>
          <View style={styles.pinsLeft}>
            {inputs.map((pin) => {
              const connected = connections.some(
                (c) => c.toNodeId === node.id && c.toPinId === pin.id
              );
              const key = `${node.id}__IN__${pin.id}`;
              const isSelected = selectedPin === key;
              const dotColor = PIN_COLORS[pin.id] || C.tint;
              return (
                <Pressable
                  key={pin.id}
                  style={styles.pinRow}
                  onPress={() => onPinPress(node.id, pin.id, "input")}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                >
                  <View
                    style={[
                      styles.pinDot,
                      {
                        borderColor: dotColor,
                        backgroundColor: connected || isSelected ? dotColor : "transparent",
                        transform: [{ scale: isSelected ? 1.4 : 1 }],
                      },
                    ]}
                  />
                  <Text style={[styles.pinLabel, { color: connected ? dotColor : C.textSecondary }]}>
                    {pin.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.pinsRight}>
            {outputs.map((pin) => {
              const connected = connections.some(
                (c) => c.fromNodeId === node.id && c.fromPinId === pin.id
              );
              const key = `${node.id}__OUT__${pin.id}`;
              const isSelected = selectedPin === key;
              const dotColor = PIN_COLORS[pin.id] || C.tint;
              return (
                <Pressable
                  key={pin.id}
                  style={[styles.pinRow, styles.pinRowRight]}
                  onPress={() => onPinPress(node.id, pin.id, "output")}
                  hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                >
                  <Text style={[styles.pinLabel, { color: connected ? dotColor : C.textSecondary, textAlign: "right" }]}>
                    {pin.label}
                  </Text>
                  <View
                    style={[
                      styles.pinDot,
                      {
                        borderColor: dotColor,
                        backgroundColor: connected || isSelected ? dotColor : "transparent",
                        transform: [{ scale: isSelected ? 1.4 : 1 }],
                      },
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

let idCounter = 1;
const uid = () => `node_${idCounter++}`;

const INITIAL_NODES: NENode[] = [
  { id: "node_1", type: "input", x: 30, y: 80, varName: "MyVar", varValue: "10.0" },
  { id: "node_2", type: "math", x: 260, y: 70, operation: "+" },
  { id: "node_3", type: "output", x: 490, y: 80, outName: "Result" },
];
const INITIAL_CONNECTIONS: Connection[] = [
  { fromNodeId: "node_1", fromPinId: "value", toNodeId: "node_2", toPinId: "inputA" },
  { fromNodeId: "node_2", fromPinId: "result", toNodeId: "node_3", toPinId: "value" },
];

const UNREAL_INSTRUCTIONS = `# Unreal Engine Integration Guide

## Step 1 — Copy your JSON file to your project

Place the exported \`unreal_blueprint_graph.json\` file in:
  \`/YourProject/Content/\`

## Step 2 — Python Script (Editor Utility)

Open: Tools → Execute Python Script

\`\`\`python
import unreal, json, os

path = unreal.Paths.project_content_dir() + "unreal_blueprint_graph.json"
with open(path, "r") as f:
    graph = json.load(f)

for node in graph["nodes"]:
    ntype = node["type"]
    pos   = node.get("position", {"x": 0, "y": 0})
    data  = node.get("data", {})
    unreal.log(f"[{ntype}] {data} @ ({pos['x']}, {pos['y']})")

# Use unreal.EditorAssetLibrary and BlueprintEditorLibrary
# to programmatically create Blueprint nodes from the graph.
\`\`\`

## Step 3 — Blueprint (ReadFile + ParseJSON)

1. Create an Editor Utility Widget
2. Add a "Read String From File" node → feed in the file path
3. Connect to "JSON String to Object"
4. Iterate the "nodes" array with "Get Array Element"
5. Use "Get Object Field" to read id, type, position, data

## Edges

Each edge in the JSON maps to a Blueprint wire:
  source → target  (via sourceHandle → targetHandle)

Use these as references to connect your Blueprint nodes logically.
`;

export default function NodeEditorScreen() {
  const { colors: C2 } = useTheme();

  const [nodes, setNodes] = useState<NENode[]>(INITIAL_NODES);
  const [connections, setConnections] = useState<Connection[]>(INITIAL_CONNECTIONS);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [newNodeIds, setNewNodeIds] = useState<Set<string>>(new Set());
  const [showPalette, setShowPalette] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [exportDone, setExportDone] = useState(false);

  const nodePositions = useRef<Record<string, { x: number; y: number }>>({});
  nodes.forEach((n) => {
    if (!nodePositions.current[n.id]) {
      nodePositions.current[n.id] = { x: n.x, y: n.y };
    }
  });
  const [, forceUpdate] = useState(0);
  const dragOrigin = useRef<{ nodeId: string; startX: number; startY: number } | null>(null);

  const canvasW = Math.max(
    ...nodes.map((n) => {
      const pos = nodePositions.current[n.id] || { x: n.x, y: n.y };
      return pos.x + NODE_W + 80;
    }),
    SCREEN_W - 32
  );
  const canvasH = Math.max(
    ...nodes.map((n) => {
      const pos = nodePositions.current[n.id] || { x: n.x, y: n.y };
      return pos.y + 200;
    }),
    400
  );

  const handleDragStart = useCallback((nodeId: string) => {
    const pos = nodePositions.current[nodeId];
    if (!pos) return;
    dragOrigin.current = { nodeId, startX: pos.x, startY: pos.y };
    setIsDragging(true);
  }, []);

  const handleDragMove = useCallback((dx: number, dy: number) => {
    if (!dragOrigin.current) return;
    const { nodeId, startX, startY } = dragOrigin.current;
    nodePositions.current[nodeId] = {
      x: Math.max(0, startX + dx),
      y: Math.max(0, startY + dy),
    };
    forceUpdate((v) => v + 1);
  }, []);

  const handleDragEnd = useCallback(() => {
    dragOrigin.current = null;
    setIsDragging(false);
  }, []);

  const handlePinPress = useCallback(
    async (nodeId: string, pinId: string, side: "input" | "output") => {
      const key = `${nodeId}__${side === "input" ? "IN" : "OUT"}__${pinId}`;

      if (!selectedPin) {
        await Haptics.selectionAsync();
        setSelectedPin(key);
        return;
      }
      if (selectedPin === key) {
        setSelectedPin(null);
        return;
      }

      const parsePinKey = (k: string) => {
        const parts = k.split("__");
        return { nodeId: parts[0], dir: parts[1] as "IN" | "OUT", pinId: parts[2] };
      };

      const from = parsePinKey(selectedPin);
      const to = { nodeId, dir: side === "input" ? ("IN" as const) : ("OUT" as const), pinId };

      if (from.dir === to.dir) {
        setSelectedPin(key);
        return;
      }

      const outPin = from.dir === "OUT" ? from : to;
      const inPin = from.dir === "IN" ? from : to;

      const exists = connections.some(
        (c) =>
          c.fromNodeId === outPin.nodeId &&
          c.fromPinId === outPin.pinId &&
          c.toNodeId === inPin.nodeId &&
          c.toPinId === inPin.pinId
      );

      if (exists) {
        await Haptics.selectionAsync();
        setConnections((prev) =>
          prev.filter(
            (c) =>
              !(
                c.fromNodeId === outPin.nodeId &&
                c.fromPinId === outPin.pinId &&
                c.toNodeId === inPin.nodeId &&
                c.toPinId === inPin.pinId
              )
          )
        );
        setSelectedPin(null);
        return;
      }

      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setConnections((prev) => [
        ...prev.filter((c) => !(c.toNodeId === inPin.nodeId && c.toPinId === inPin.pinId)),
        {
          fromNodeId: outPin.nodeId,
          fromPinId: outPin.pinId,
          toNodeId: inPin.nodeId,
          toPinId: inPin.pinId,
        },
      ]);
      setSelectedPin(null);
    },
    [selectedPin, connections]
  );

  const handleDelete = useCallback((nodeId: string) => {
    delete nodePositions.current[nodeId];
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnections((prev) =>
      prev.filter((c) => c.fromNodeId !== nodeId && c.toNodeId !== nodeId)
    );
    setSelectedPin(null);
  }, []);

  const handleUpdate = useCallback((nodeId: string, patch: Partial<NENode>) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, ...patch } : n)));
  }, []);

  const addNode = (type: NENode["type"]) => {
    const newId = uid();
    const maxY = Math.max(
      ...nodes.map((n) => (nodePositions.current[n.id]?.y ?? n.y) + 160),
      60
    );
    const defaults: Partial<NENode> =
      type === "input"
        ? { varName: "NewVar", varValue: "0.0" }
        : type === "math"
        ? { operation: "+" }
        : { outName: "Output" };
    const newNode: NENode = { id: newId, type, x: 40, y: Math.min(maxY, SCREEN_H - 200), ...defaults };
    nodePositions.current[newId] = { x: newNode.x, y: newNode.y };
    setNodes((prev) => [...prev, newNode]);
    setNewNodeIds((prev) => new Set([...prev, newId]));
    setShowPalette(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleReset = () => {
    nodePositions.current = {};
    INITIAL_NODES.forEach((n) => { nodePositions.current[n.id] = { x: n.x, y: n.y }; });
    setNodes(INITIAL_NODES);
    setConnections(INITIAL_CONNECTIONS);
    setSelectedPin(null);
    setNewNodeIds(new Set());
    forceUpdate((v) => v + 1);
    Haptics.selectionAsync();
  };

  const handleExport = async () => {
    const graphNodes = nodes.map((n) => {
      const pos = nodePositions.current[n.id] || { x: n.x, y: n.y };
      const data: Record<string, unknown> = {};
      if (n.type === "input") {
        data.name = n.varName || "Var";
        data.value = parseFloat(n.varValue || "0") || 0;
      } else if (n.type === "math") {
        const opMap: Record<string, string> = { "+": "add", "-": "subtract", "×": "multiply", "÷": "divide" };
        data.operation = opMap[n.operation || "+"] || "add";
      } else {
        data.name = n.outName || "Output";
      }
      return { id: n.id, type: n.type, position: { x: Math.round(pos.x), y: Math.round(pos.y) }, data };
    });

    const graphEdges = connections.map((c) => ({
      source: c.fromNodeId,
      target: c.toNodeId,
      sourceHandle: c.fromPinId,
      targetHandle: c.toPinId,
    }));

    const json = JSON.stringify({ version: "1.0", nodes: graphNodes, edges: graphEdges }, null, 2);

    try {
      await Share.share({
        title: "unreal_blueprint_graph.json",
        message: json,
      });
      setExportDone(true);
      setShowGuide(true);
      setTimeout(() => setExportDone(false), 3000);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="cpu" size={18} color={C.tint} />
          <Text style={styles.headerTitle}>Node Editor</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>UE5</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.hBtn} onPress={() => setShowGuide(true)}>
            <Feather name="info" size={16} color={C.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.hBtn} onPress={handleReset}>
            <Feather name="refresh-ccw" size={16} color={C.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity
          style={[styles.toolBtn, styles.toolBtnGreen]}
          onPress={() => addNode("input")}
        >
          <Feather name="box" size={13} color="#6ADE89" />
          <Text style={[styles.toolBtnText, { color: "#6ADE89" }]}>+ Input</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolBtn, styles.toolBtnBlue]}
          onPress={() => addNode("math")}
        >
          <Feather name="zap" size={13} color="#5BC4FF" />
          <Text style={[styles.toolBtnText, { color: "#5BC4FF" }]}>+ Math</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toolBtn, styles.toolBtnPurple]}
          onPress={() => addNode("output")}
        >
          <Feather name="log-out" size={13} color="#CE93D8" />
          <Text style={[styles.toolBtnText, { color: "#CE93D8" }]}>+ Output</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <TouchableOpacity
          style={[styles.exportBtn, exportDone && styles.exportBtnDone]}
          onPress={handleExport}
        >
          <Feather name={exportDone ? "check" : "download"} size={14} color="#fff" />
          <Text style={styles.exportBtnText}>
            {exportDone ? "Exported!" : "Export to Unreal"}
          </Text>
        </TouchableOpacity>
      </View>

      {selectedPin && (
        <Animated.View entering={FadeIn.duration(180)} style={styles.pinHint}>
          <Feather name="radio" size={11} color={C.tint} />
          <Text style={styles.pinHintText}>Pin selected — tap another pin to connect</Text>
          <Pressable onPress={() => setSelectedPin(null)}>
            <Feather name="x" size={13} color={C.textSecondary} />
          </Pressable>
        </Animated.View>
      )}

      <View style={styles.canvas}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!isDragging && !selectedPin}
          nestedScrollEnabled
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            scrollEnabled={!isDragging && !selectedPin}
            nestedScrollEnabled
          >
            <View style={{ width: canvasW, height: canvasH }}>
              {connections.map((conn, i) => {
                const fromNode = nodes.find((n) => n.id === conn.fromNodeId);
                const toNode = nodes.find((n) => n.id === conn.toNodeId);
                if (!fromNode || !toNode) return null;
                const fromPos = nodePositions.current[fromNode.id] || { x: fromNode.x, y: fromNode.y };
                const toPos = nodePositions.current[toNode.id] || { x: toNode.x, y: toNode.y };
                const { inputs: fi, outputs: fo } = getNodePins(fromNode);
                const { inputs: ti } = getNodePins(toNode);
                const fromPinPos = getPinPos(fromPos, [...fi, ...fo], conn.fromPinId, "output", Math.max(fi.length, fo.length));
                const toPinPos = getPinPos(toPos, [...ti], conn.toPinId, "input", ti.length);
                if (!fromPinPos || !toPinPos) return null;
                const wireColor = PIN_COLORS[conn.fromPinId] || C.tint;
                return (
                  <Wire
                    key={i}
                    x1={fromPinPos.x}
                    y1={fromPinPos.y}
                    x2={toPinPos.x}
                    y2={toPinPos.y}
                    color={wireColor}
                  />
                );
              })}
              {nodes.map((node) => {
                const pos = nodePositions.current[node.id] || { x: node.x, y: node.y };
                return (
                  <NodeBody
                    key={node.id}
                    node={node}
                    pos={pos}
                    selectedPin={selectedPin}
                    connections={connections}
                    onPinPress={handlePinPress}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                    isNew={newNodeIds.has(node.id)}
                  />
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>
        <View style={styles.canvasHint}>
          <Feather name="move" size={10} color={C.textTertiary} />
          <Text style={styles.canvasHintText}>Drag nodes · tap pins to connect · tap wire ends to disconnect</Text>
        </View>
      </View>

      <Modal visible={showGuide} transparent animationType="fade" onRequestClose={() => setShowGuide(false)}>
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.duration(300)} style={styles.modalCard}>
            <LinearGradient
              colors={["#0D47A1", "#4A148C"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.modalHeader}
            >
              <Feather name="cpu" size={18} color="#fff" />
              <Text style={styles.modalHeaderText}>Unreal Engine Integration</Text>
              <TouchableOpacity onPress={() => setShowGuide(false)} style={styles.modalClose}>
                <Feather name="x" size={18} color="rgba(255,255,255,0.8)" />
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>Step 1 — Place JSON in project</Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>/YourProject/Content/unreal_blueprint_graph.json</Text>
                </View>
              </View>
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>Step 2 — Python Script (Editor Utility)</Text>
                <Text style={styles.guideNote}>Tools → Execute Python Script</Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>{`import unreal, json\n\npath = unreal.Paths.project_content_dir() \\\n  + "unreal_blueprint_graph.json"\n\nwith open(path, "r") as f:\n    graph = json.load(f)\n\nfor node in graph["nodes"]:\n    ntype = node["type"]\n    data  = node.get("data", {})\n    pos   = node.get("position", {})\n    unreal.log(f"[{ntype}] {data}")\n\n# Use BlueprintEditorLibrary to\n# create nodes from the graph data.`}</Text>
                </View>
              </View>
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>Step 3 — Blueprint (no code)</Text>
                <Text style={styles.guideBody}>
                  {`1. Create an Editor Utility Widget\n2. Add "Read String From File" → pass the file path\n3. Connect to "JSON String to Object"\n4. Use "Get Array Element" on the "nodes" array\n5. Use "Get Object Field" to read id, type, position, data\n6. Each edge in "edges" maps to a Blueprint wire connection (source → target)`}
                </Text>
              </View>
              <View style={styles.guideSection}>
                <Text style={styles.guideSectionTitle}>JSON Structure</Text>
                <View style={styles.codeBlock}>
                  <Text style={styles.codeText}>{`{\n  "version": "1.0",\n  "nodes": [\n    {\n      "id": "node_1",\n      "type": "input",\n      "position": { "x": 30, "y": 80 },\n      "data": { "name": "MyVar", "value": 10.0 }\n    }\n  ],\n  "edges": [\n    {\n      "source": "node_1",\n      "target": "node_2",\n      "sourceHandle": "value",\n      "targetHandle": "inputA"\n    }\n  ]\n}`}</Text>
                </View>
              </View>
            </ScrollView>
            <TouchableOpacity style={styles.modalActionBtn} onPress={() => setShowGuide(false)}>
              <Text style={styles.modalActionText}>Got it</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
    backgroundColor: C.backgroundSecondary,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    letterSpacing: 0.5,
  },
  versionBadge: {
    backgroundColor: C.tint + "25",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: C.tint + "50",
  },
  versionText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.tint,
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  hBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: C.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
    backgroundColor: C.backgroundTertiary,
    borderBottomWidth: 1,
    borderBottomColor: C.cardBorder,
  },
  toolBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    borderWidth: 1,
  },
  toolBtnGreen: {
    backgroundColor: "#1B5E2020",
    borderColor: "#6ADE8940",
  },
  toolBtnBlue: {
    backgroundColor: "#0D47A120",
    borderColor: "#5BC4FF40",
  },
  toolBtnPurple: {
    backgroundColor: "#4A148C20",
    borderColor: "#CE93D840",
  },
  toolBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: "#0D47A1",
  },
  exportBtnDone: {
    backgroundColor: "#1B5E20",
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  pinHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: C.tint + "18",
    borderBottomWidth: 1,
    borderBottomColor: C.tint + "30",
  },
  pinHintText: {
    flex: 1,
    fontSize: 12,
    color: C.textSecondary,
  },
  canvas: {
    flex: 1,
    backgroundColor: "#080C12",
  },
  canvasHint: {
    position: "absolute",
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    pointerEvents: "none",
  },
  canvasHintText: {
    fontSize: 10,
    color: C.textTertiary,
  },
  nodeCard: {
    position: "absolute",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "#0F1520",
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 6,
  },
  nodeHeader: {
    height: NODE_HEADER_H,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    justifyContent: "space-between",
  },
  nodeTypeTag: {
    fontSize: 11,
    fontWeight: "800",
    color: "rgba(255,255,255,0.9)",
    letterSpacing: 1.5,
  },
  deleteBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  nodeBody: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  nodeFields: {
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    color: C.text,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontFamily: "monospace" as any,
  },
  opRow: {
    flexDirection: "row",
    paddingHorizontal: 8,
    gap: 4,
    marginBottom: 4,
  },
  opBtn: {
    flex: 1,
    height: 30,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  opBtnActive: {
    backgroundColor: "#1565C0",
    borderColor: "#5BC4FF",
  },
  opBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: C.textSecondary,
  },
  opBtnTextActive: {
    color: "#fff",
  },
  pinsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 2,
  },
  pinsLeft: {
    flex: 1,
  },
  pinsRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  pinRow: {
    flexDirection: "row",
    alignItems: "center",
    height: PIN_H,
    paddingLeft: 0,
    gap: 5,
  },
  pinRowRight: {
    flexDirection: "row-reverse",
    paddingRight: 0,
    gap: 5,
  },
  pinDot: {
    width: PIN_DOT,
    height: PIN_DOT,
    borderRadius: PIN_DOT / 2,
    borderWidth: 2,
  },
  pinLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: C.backgroundSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_H * 0.85,
    borderTopWidth: 1,
    borderColor: C.cardBorder,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeaderText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  modalClose: {
    padding: 2,
  },
  modalBody: {
    padding: 16,
  },
  guideSection: {
    marginBottom: 20,
  },
  guideSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.tint,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  guideNote: {
    fontSize: 11,
    color: C.textSecondary,
    marginBottom: 6,
    fontStyle: "italic",
  },
  guideBody: {
    fontSize: 13,
    color: C.textSecondary,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: "#060A10",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  codeText: {
    fontSize: 11,
    color: "#A8D8A8",
    fontFamily: "monospace" as any,
    lineHeight: 17,
  },
  modalActionBtn: {
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: C.tint,
    alignItems: "center",
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});
