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
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";

import Colors from "@/constants/colors";
import { BuildChallenge, BuildConnection, BuildNode } from "@/data/curriculum";

const C = Colors.dark;
const { width: SCREEN_W } = Dimensions.get("window");

const PIN_TYPE_COLORS: Record<string, string> = {
  exec: "#FFFFFF",
  bool: "#CC0000",
  float: "#6ADE89",
  integer: "#5BC4FF",
  string: "#EF9A9A",
  object: "#00BCD4",
  vector: "#FFB74D",
};

const NODE_TYPE_COLORS: Record<string, string> = {
  event: "#B71C1C",
  function: "#1565C0",
  flow: "#4A148C",
  value: "#1B5E20",
  variable: "#E65100",
};

const NODE_W = 158;
const NODE_HEADER_H = 36;
const PIN_H = 28;
const PIN_DOT_SIZE = 12;

const NODE_PALETTE_TEMPLATES: Omit<BuildNode, "id" | "x" | "y">[] = [
  {
    title: "Print String",
    nodeType: "function",
    inputs: [
      { id: "exec_in", label: "Exec", type: "exec" },
      { id: "str_in", label: "In String", type: "string" },
    ],
    outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
  },
  {
    title: "Branch",
    nodeType: "flow",
    inputs: [
      { id: "exec_in", label: "Exec", type: "exec" },
      { id: "cond", label: "Condition", type: "bool" },
    ],
    outputs: [
      { id: "true_out", label: "True", type: "exec" },
      { id: "false_out", label: "False", type: "exec" },
    ],
  },
  {
    title: "Delay",
    subtitle: "1.0 sec",
    nodeType: "function",
    inputs: [
      { id: "exec_in", label: "Exec", type: "exec" },
      { id: "dur_in", label: "Duration", type: "float" },
    ],
    outputs: [{ id: "completed", label: "Completed", type: "exec" }],
  },
  {
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
  },
  {
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
  },
  {
    title: "Event BeginPlay",
    nodeType: "event",
    inputs: [],
    outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
  },
  {
    title: "Event On Hit",
    nodeType: "event",
    inputs: [],
    outputs: [
      { id: "exec_out", label: "Exec", type: "exec" },
      { id: "hit_out", label: "Hit Result", type: "object" },
      { id: "loc_out", label: "Hit Location", type: "vector" },
    ],
  },
  {
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
  },
  {
    title: "Float <= Float",
    subtitle: "Comparison",
    nodeType: "value",
    inputs: [
      { id: "a_in", label: "A", type: "float" },
      { id: "b_in", label: "B", type: "float" },
    ],
    outputs: [{ id: "bool_out", label: "Return", type: "bool" }],
  },
  {
    title: "Add Movement Input",
    nodeType: "function",
    inputs: [
      { id: "exec_in", label: "Exec", type: "exec" },
      { id: "dir_in", label: "World Direction", type: "vector" },
      { id: "scale_in", label: "Scale Value", type: "float" },
    ],
    outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
  },
  {
    title: "Play Sound at Location",
    nodeType: "function",
    inputs: [
      { id: "exec_in", label: "Exec", type: "exec" },
      { id: "sound_in", label: "Sound", type: "object" },
      { id: "loc_in", label: "Location", type: "vector" },
    ],
    outputs: [{ id: "exec_out", label: "Exec", type: "exec" }],
  },
  {
    title: "Set Variable",
    subtitle: "Variable",
    nodeType: "variable",
    inputs: [
      { id: "exec_in", label: "Exec", type: "exec" },
      { id: "val_in", label: "Value", type: "float" },
    ],
    outputs: [
      { id: "exec_out", label: "Exec", type: "exec" },
      { id: "val_out", label: "Value", type: "float" },
    ],
  },
];

function getPinPos(node: BuildNode, nodePos: { x: number; y: number }, pinId: string, side: "input" | "output") {
  const pins = side === "input" ? node.inputs : node.outputs;
  const idx = pins.findIndex((p) => p.id === pinId);
  if (idx < 0) return null;
  const x = side === "output" ? nodePos.x + NODE_W : nodePos.x;
  const y = nodePos.y + NODE_HEADER_H + idx * PIN_H + PIN_H / 2;
  return { x, y };
}

interface WireProps {
  x1: number; y1: number; x2: number; y2: number; color: string;
}

function Wire({ x1, y1, x2, y2, color }: WireProps) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.sqrt(dx * dx + dy * dy);
  if (length < 1) return null;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: cx - length / 2,
        top: cy - 2.5,
        width: length,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: color,
        transform: [{ rotate: `${angle}deg` }],
        opacity: 0.9,
        shadowColor: color,
        shadowOpacity: 0.7,
        shadowRadius: 6,
        elevation: 2,
      }}
    />
  );
}

interface PinDotProps {
  pinId: string;
  type: string;
  label: string;
  side: "input" | "output";
  selected: boolean;
  connected: boolean;
  onPress: (pinId: string) => void;
}

function PinDot({ pinId, type, label, side, selected, connected, onPress }: PinDotProps) {
  const color = PIN_TYPE_COLORS[type] || C.tint;
  const isExec = type === "exec";
  return (
    <Pressable
      style={[styles.pinRow, side === "output" && styles.pinRowRight]}
      onPress={() => onPress(pinId)}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
    >
      {side === "input" && (
        <View
          style={[
            styles.pinDot,
            {
              borderColor: color,
              backgroundColor: connected ? color : "transparent",
              transform: [{ scale: selected ? 1.5 : 1 }],
              borderWidth: selected ? 3 : 2,
            },
            isExec && styles.pinDotExec,
          ]}
        />
      )}
      <Text
        style={[
          styles.pinLabel,
          { color: selected ? color : connected ? color + "DD" : C.textSecondary },
          side === "output" && { textAlign: "right" },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
      {side === "output" && (
        <View
          style={[
            styles.pinDot,
            {
              borderColor: color,
              backgroundColor: connected ? color : "transparent",
              transform: [{ scale: selected ? 1.5 : 1 }],
              borderWidth: selected ? 3 : 2,
            },
            isExec && styles.pinDotExec,
          ]}
        />
      )}
    </Pressable>
  );
}

interface NodeCardProps {
  node: BuildNode;
  nodePos: { x: number; y: number };
  selectedPin: string | null;
  connections: BuildConnection[];
  onPinPress: (nodeId: string, pinId: string, side: "input" | "output") => void;
  onDragStart: (nodeId: string) => void;
  onDragMove: (dx: number, dy: number) => void;
  onDragEnd: () => void;
  isNew?: boolean;
}

function NodeCard({
  node, nodePos, selectedPin, connections,
  onPinPress, onDragStart, onDragMove, onDragEnd, isNew,
}: NodeCardProps) {
  const headerColor = NODE_TYPE_COLORS[node.nodeType] || C.card;
  const isDraggingThis = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 3 || Math.abs(g.dy) > 3,
      onPanResponderGrant: () => {
        isDraggingThis.current = true;
        onDragStart(node.id);
        Haptics.selectionAsync();
      },
      onPanResponderMove: (_, g) => {
        if (isDraggingThis.current) {
          onDragMove(g.dx, g.dy);
        }
      },
      onPanResponderRelease: () => {
        isDraggingThis.current = false;
        onDragEnd();
      },
      onPanResponderTerminate: () => {
        isDraggingThis.current = false;
        onDragEnd();
      },
    })
  ).current;

  return (
    <Animated.View
      entering={isNew ? ZoomIn.duration(250) : undefined}
      style={[
        styles.nodeCard,
        {
          left: nodePos.x,
          top: nodePos.y,
          width: NODE_W,
          shadowColor: headerColor,
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 5,
        },
      ]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.nodeHeader, { backgroundColor: headerColor }]}>
        <View style={styles.nodeHeaderRow}>
          <Text style={styles.nodeTitle} numberOfLines={1}>{node.title}</Text>
          <View style={styles.dragHandle}>
            <Feather name="menu" size={10} color="rgba(255,255,255,0.5)" />
          </View>
        </View>
        {node.subtitle && (
          <Text style={styles.nodeSubtitle} numberOfLines={1}>{node.subtitle}</Text>
        )}
      </View>
      <View style={styles.nodePins}>
        <View style={styles.pinsCol}>
          {node.inputs.map((pin) => {
            const connected = connections.some(
              (c) => c.toNodeId === node.id && c.toPinId === pin.id
            );
            const selected = selectedPin === `${node.id}__IN__${pin.id}`;
            return (
              <PinDot
                key={pin.id}
                pinId={`${node.id}__IN__${pin.id}`}
                type={pin.type}
                label={pin.label}
                side="input"
                selected={selected}
                connected={connected}
                onPress={() => onPinPress(node.id, pin.id, "input")}
              />
            );
          })}
        </View>
        <View style={styles.pinsCol}>
          {node.outputs.map((pin) => {
            const connected = connections.some(
              (c) => c.fromNodeId === node.id && c.fromPinId === pin.id
            );
            const selected = selectedPin === `${node.id}__OUT__${pin.id}`;
            return (
              <PinDot
                key={pin.id}
                pinId={`${node.id}__OUT__${pin.id}`}
                type={pin.type}
                label={pin.label}
                side="output"
                selected={selected}
                connected={connected}
                onPress={() => onPinPress(node.id, pin.id, "output")}
              />
            );
          })}
        </View>
      </View>
    </Animated.View>
  );
}

interface Props {
  challenge: BuildChallenge;
  modColor?: string;
  onComplete?: (connections: BuildConnection[]) => void;
}

type CheckState = "idle" | "success" | "fail";

let nodeIdCounter = 1000;

export default function BlueprintBuilder({ challenge, modColor = C.tint, onComplete }: Props) {
  const [connections, setConnections] = useState<BuildConnection[]>([]);
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [checkState, setCheckState] = useState<CheckState>("idle");
  const [hintStep, setHintStep] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  const [allNodes, setAllNodes] = useState<BuildNode[]>(challenge.nodes);
  const dragOrigin = useRef<{ nodeId: string; startX: number; startY: number } | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [newNodeIds, setNewNodeIds] = useState<Set<string>>(new Set());

  const nodePositions = useRef<Record<string, { x: number; y: number }>>({});
  allNodes.forEach((n) => {
    if (!nodePositions.current[n.id]) {
      nodePositions.current[n.id] = { x: n.x, y: n.y };
    }
  });

  const [, forceUpdate] = useState(0);

  const hints: string[] = Array.isArray((challenge as any).hints)
    ? (challenge as any).hints
    : [challenge.hint];

  const canvasH = Math.max(
    ...allNodes.map((n) => {
      const pos = nodePositions.current[n.id] || { x: n.x, y: n.y };
      return pos.y + NODE_HEADER_H + Math.max(n.inputs.length, n.outputs.length) * PIN_H + 60;
    }),
    300
  );
  const canvasW = Math.max(
    ...allNodes.map((n) => {
      const pos = nodePositions.current[n.id] || { x: n.x, y: n.y };
      return pos.x + NODE_W + 60;
    }),
    SCREEN_W - 40
  );

  const handleDragStart = useCallback((nodeId: string) => {
    const pos = nodePositions.current[nodeId];
    if (!pos) return;
    dragOrigin.current = { nodeId, startX: pos.x, startY: pos.y };
    setDraggingNodeId(nodeId);
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
    setDraggingNodeId(null);
    setIsDragging(false);
  }, []);

  const handlePinPress = useCallback(
    async (nodeId: string, pinId: string, side: "input" | "output") => {
      const key = `${nodeId}__${side === "input" ? "IN" : "OUT"}__${pinId}`;

      if (!selectedPin) {
        await Haptics.selectionAsync();
        setSelectedPin(key);
        setCheckState("idle");
        return;
      }
      if (selectedPin === key) {
        setSelectedPin(null);
        return;
      }

      const parsePin = (k: string) => {
        const parts = k.split("__");
        return { nodeId: parts[0], dir: parts[1] as "IN" | "OUT", pinId: parts[2] };
      };

      const from = parsePin(selectedPin);
      const to = { nodeId, dir: side === "input" ? ("IN" as const) : ("OUT" as const), pinId };

      if (from.dir === to.dir) {
        setSelectedPin(key);
        return;
      }

      const outPin = from.dir === "OUT" ? from : to;
      const inPin = from.dir === "IN" ? from : to;

      const alreadyExists = connections.some(
        (c) =>
          c.fromNodeId === outPin.nodeId &&
          c.fromPinId === outPin.pinId &&
          c.toNodeId === inPin.nodeId &&
          c.toPinId === inPin.pinId
      );

      if (alreadyExists) {
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
        ...prev.filter(
          (c) => !(c.toNodeId === inPin.nodeId && c.toPinId === inPin.pinId)
        ),
        {
          fromNodeId: outPin.nodeId,
          fromPinId: outPin.pinId,
          toNodeId: inPin.nodeId,
          toPinId: inPin.pinId,
        },
      ]);
      setSelectedPin(null);
      setCheckState("idle");
    },
    [selectedPin, connections]
  );

  const handleCheck = async () => {
    const { solution } = challenge;
    const allCorrect = solution.every((sol) =>
      connections.some(
        (c) =>
          c.fromNodeId === sol.fromNodeId &&
          c.fromPinId === sol.fromPinId &&
          c.toNodeId === sol.toNodeId &&
          c.toPinId === sol.toPinId
      )
    );
    if (allCorrect && connections.length >= solution.length) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCheckState("success");
      onComplete?.(connections);
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setCheckState("fail");
      onComplete?.(connections);
    }
  };

  const handleReset = async () => {
    await Haptics.selectionAsync();
    setConnections([]);
    setSelectedPin(null);
    setCheckState("idle");
    setHintStep(0);
    const fresh: Record<string, { x: number; y: number }> = {};
    challenge.nodes.forEach((n) => { fresh[n.id] = { x: n.x, y: n.y }; });
    nodePositions.current = fresh;
    setAllNodes(challenge.nodes);
    setNewNodeIds(new Set());
    forceUpdate((v) => v + 1);
  };

  const handleAddNode = (template: Omit<BuildNode, "id" | "x" | "y">) => {
    const newId = `added_${nodeIdCounter++}`;
    const centerX = 40;
    const centerY = Math.max(...allNodes.map((n) => {
      const p = nodePositions.current[n.id] || { y: n.y };
      return p.y;
    })) + 80;
    const newNode: BuildNode = { ...template, id: newId, x: centerX, y: Math.min(centerY, 300) };
    nodePositions.current[newId] = { x: centerX, y: Math.min(centerY, 300) };
    setAllNodes((prev) => [...prev, newNode]);
    setNewNodeIds((prev) => new Set([...prev, newId]));
    setShowPalette(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  return (
    <View style={styles.container}>
      <View style={styles.instructionCard}>
        <View style={styles.instructionHeader}>
          <Feather name="cpu" size={16} color={modColor} />
          <Text style={[styles.instructionLabel, { color: modColor }]}>Задание</Text>
        </View>
        <Text style={styles.instructionText}>{challenge.instruction}</Text>
      </View>

      {selectedPin && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.selectedHint}>
          <Feather name="radio" size={12} color={C.tint} />
          <Text style={styles.selectedHintText}>
            Пин выбран — нажмите на другой пин для соединения
          </Text>
          <Pressable onPress={() => setSelectedPin(null)}>
            <Feather name="x" size={14} color={C.textSecondary} />
          </Pressable>
        </Animated.View>
      )}

      <View style={styles.canvasWrapper}>
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
                const fromNode = allNodes.find((n) => n.id === conn.fromNodeId);
                const toNode = allNodes.find((n) => n.id === conn.toNodeId);
                if (!fromNode || !toNode) return null;
                const fromPos = nodePositions.current[fromNode.id] || { x: fromNode.x, y: fromNode.y };
                const toPos = nodePositions.current[toNode.id] || { x: toNode.x, y: toNode.y };
                const fromPosPin = getPinPos(fromNode, fromPos, conn.fromPinId, "output");
                const toPosPin = getPinPos(toNode, toPos, conn.toPinId, "input");
                if (!fromPosPin || !toPosPin) return null;
                const fromPin = fromNode.outputs.find((p) => p.id === conn.fromPinId);
                const wireColor = PIN_TYPE_COLORS[fromPin?.type || "exec"] || C.tint;
                return (
                  <Wire
                    key={i}
                    x1={fromPosPin.x}
                    y1={fromPosPin.y}
                    x2={toPosPin.x}
                    y2={toPosPin.y}
                    color={wireColor}
                  />
                );
              })}
              {allNodes.map((node) => {
                const pos = nodePositions.current[node.id] || { x: node.x, y: node.y };
                return (
                  <NodeCard
                    key={node.id}
                    node={node}
                    nodePos={pos}
                    selectedPin={selectedPin}
                    connections={connections}
                    onPinPress={handlePinPress}
                    onDragStart={handleDragStart}
                    onDragMove={handleDragMove}
                    onDragEnd={handleDragEnd}
                    isNew={newNodeIds.has(node.id)}
                  />
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>

        <View style={styles.canvasLegend}>
          <Feather name="move" size={11} color={C.textTertiary} />
          <Text style={styles.legendText}>Перетаскивайте ноды</Text>
        </View>
      </View>

      {checkState === "success" && (
        <Animated.View entering={ZoomIn.duration(350)} style={styles.resultSuccess}>
          <LinearGradient colors={[C.success + "30", "transparent"]} style={StyleSheet.absoluteFill} />
          <Feather name="check-circle" size={22} color={C.success} />
          <View>
            <Text style={styles.resultTitle}>Правильно!</Text>
            <Text style={styles.resultSub}>Blueprint построен верно</Text>
          </View>
        </Animated.View>
      )}

      {checkState === "fail" && (
        <Animated.View entering={FadeIn.duration(250)} style={styles.resultFail}>
          <Feather name="alert-circle" size={20} color={C.error} />
          <View>
            <Text style={styles.resultFailTitle}>Не совсем верно</Text>
            <Text style={styles.resultFailSub}>Проверьте соединения и попробуйте снова</Text>
          </View>
        </Animated.View>
      )}

      <View style={styles.controls}>
        <Pressable style={styles.addNodeBtn} onPress={() => setShowPalette(true)}>
          <Feather name="plus" size={15} color={C.tint} />
          <Text style={[styles.addNodeBtnText, { color: C.tint }]}>Добавить</Text>
        </Pressable>
        <Pressable
          style={styles.hintBtn}
          onPress={() => {
            setShowHint((v) => !v);
            if (!showHint) setHintStep(0);
          }}
        >
          <Feather name="help-circle" size={15} color={C.textSecondary} />
          <Text style={styles.hintBtnText}>Подсказка</Text>
        </Pressable>
        <Pressable style={styles.resetBtn} onPress={handleReset}>
          <Feather name="refresh-cw" size={15} color={C.textSecondary} />
        </Pressable>
        <Pressable
          style={[styles.checkBtn, { backgroundColor: modColor }]}
          onPress={handleCheck}
        >
          <Feather name="check" size={15} color={C.background} />
          <Text style={styles.checkBtnText}>Проверить</Text>
        </Pressable>
      </View>

      {showHint && (
        <Animated.View entering={FadeInDown.duration(250)} style={styles.hintCard}>
          <View style={styles.hintHeader}>
            <Feather name="info" size={14} color={C.warning} />
            <Text style={styles.hintLabel}>
              Подсказка {hints.length > 1 ? `${hintStep + 1}/${hints.length}` : ""}
            </Text>
            {hints.length > 1 && (
              <View style={styles.hintNav}>
                <Pressable
                  style={[styles.hintNavBtn, hintStep === 0 && { opacity: 0.3 }]}
                  onPress={() => setHintStep((s) => Math.max(0, s - 1))}
                >
                  <Feather name="chevron-left" size={14} color={C.warning} />
                </Pressable>
                <Pressable
                  style={[styles.hintNavBtn, hintStep === hints.length - 1 && { opacity: 0.3 }]}
                  onPress={() => setHintStep((s) => Math.min(hints.length - 1, s + 1))}
                >
                  <Feather name="chevron-right" size={14} color={C.warning} />
                </Pressable>
              </View>
            )}
          </View>
          <Text style={styles.hintText}>{hints[hintStep]}</Text>
        </Animated.View>
      )}

      <View style={styles.typeLegend}>
        <Text style={styles.typeLegendTitle}>Типы пинов:</Text>
        <View style={styles.typeLegendRow}>
          {Object.entries(PIN_TYPE_COLORS).map(([type, color]) => (
            <View key={type} style={styles.typeLegendItem}>
              <View style={[styles.typeDot, { backgroundColor: color }]} />
              <Text style={styles.typeLabel}>{type}</Text>
            </View>
          ))}
        </View>
      </View>

      <Modal visible={showPalette} transparent animationType="slide" onRequestClose={() => setShowPalette(false)}>
        <Pressable style={styles.paletteOverlay} onPress={() => setShowPalette(false)}>
          <Pressable style={styles.paletteSheet} onPress={() => {}}>
            <View style={styles.paletteHandle} />
            <Text style={styles.paletteTitle}>Добавить ноду</Text>
            <Text style={styles.paletteSub}>Выберите тип ноды для добавления на холст</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.paletteList}>
              {NODE_PALETTE_TEMPLATES.map((tmpl, idx) => {
                const headerColor = NODE_TYPE_COLORS[tmpl.nodeType] || C.card;
                return (
                  <Pressable
                    key={idx}
                    style={({ pressed }) => [styles.paletteItem, pressed && { opacity: 0.75 }]}
                    onPress={() => handleAddNode(tmpl)}
                  >
                    <View style={[styles.paletteItemDot, { backgroundColor: headerColor }]} />
                    <View style={styles.paletteItemText}>
                      <Text style={styles.paletteItemTitle}>{tmpl.title}</Text>
                      {tmpl.subtitle && (
                        <Text style={styles.paletteItemSub}>{tmpl.subtitle}</Text>
                      )}
                      <Text style={styles.paletteItemMeta}>
                        {tmpl.inputs.length} вх. · {tmpl.outputs.length} вых. · {tmpl.nodeType}
                      </Text>
                    </View>
                    <Feather name="plus-circle" size={20} color={C.tint} />
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  instructionCard: {
    backgroundColor: C.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  instructionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  instructionLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13 },
  instructionText: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: C.text,
    lineHeight: 21,
  },
  selectedHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.tint + "22",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.tint + "44",
  },
  selectedHintText: {
    flex: 1,
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.tint,
  },
  canvasWrapper: {
    backgroundColor: "#050A10",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cardBorder,
    height: 280,
    marginBottom: 12,
    overflow: "hidden",
  },
  canvasLegend: {
    position: "absolute",
    bottom: 8,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    opacity: 0.5,
  },
  legendText: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: C.textTertiary,
  },
  nodeCard: {
    position: "absolute",
    backgroundColor: "#0D1520",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E2D40",
    overflow: "hidden",
    minWidth: NODE_W,
  },
  nodeHeader: {
    minHeight: NODE_HEADER_H,
    paddingHorizontal: 10,
    justifyContent: "center",
    paddingVertical: 4,
  },
  nodeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  nodeTitle: { fontFamily: "Inter_700Bold", fontSize: 11, color: "#FFFFFF", flex: 1 },
  dragHandle: { opacity: 0.6, paddingLeft: 4 },
  nodeSubtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 9,
    color: "rgba(255,255,255,0.7)",
    marginTop: 1,
  },
  nodePins: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  pinsCol: { flex: 1 },
  pinRow: {
    flexDirection: "row",
    alignItems: "center",
    height: PIN_H,
    paddingHorizontal: 6,
    gap: 5,
  },
  pinRowRight: { justifyContent: "flex-end" },
  pinDot: {
    width: PIN_DOT_SIZE,
    height: PIN_DOT_SIZE,
    borderRadius: PIN_DOT_SIZE / 2,
    borderWidth: 2,
  },
  pinDotExec: { borderRadius: 2, width: 10, height: 10 },
  pinLabel: { fontFamily: "Inter_400Regular", fontSize: 9, flex: 1 },
  controls: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  addNodeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.tint + "15",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.tint + "44",
  },
  addNodeBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  hintBtnText: { fontFamily: "Inter_500Medium", fontSize: 13, color: C.textSecondary },
  resetBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.card,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  checkBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
  },
  checkBtnText: { fontFamily: "Inter_700Bold", fontSize: 14, color: C.background },
  resultSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.success + "22",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.success + "55",
    overflow: "hidden",
  },
  resultTitle: { fontFamily: "Inter_700Bold", fontSize: 15, color: C.success },
  resultSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textSecondary },
  resultFail: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.error + "22",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.error + "55",
  },
  resultFailTitle: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: C.error },
  resultFailSub: { fontFamily: "Inter_400Regular", fontSize: 12, color: C.textSecondary },
  hintCard: {
    backgroundColor: C.warning + "18",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.warning + "44",
    gap: 8,
  },
  hintHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  hintLabel: { flex: 1, fontFamily: "Inter_600SemiBold", fontSize: 12, color: C.warning },
  hintNav: { flexDirection: "row", gap: 2 },
  hintNavBtn: {
    padding: 2,
    borderRadius: 6,
    backgroundColor: C.warning + "22",
  },
  hintText: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.text,
    lineHeight: 20,
  },
  typeLegend: {
    backgroundColor: C.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  typeLegendTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    color: C.textSecondary,
    marginBottom: 8,
  },
  typeLegendRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeLegendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  typeLabel: { fontFamily: "Inter_400Regular", fontSize: 10, color: C.textSecondary },
  paletteOverlay: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  paletteSheet: {
    backgroundColor: C.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "75%",
    borderWidth: 1,
    borderColor: C.cardBorder,
  },
  paletteHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.cardBorder,
    alignSelf: "center",
    marginBottom: 16,
  },
  paletteTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: C.text,
    marginBottom: 4,
  },
  paletteSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: C.textSecondary,
    marginBottom: 16,
  },
  paletteList: { flex: 1 },
  paletteItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.separator,
  },
  paletteItemDot: {
    width: 10,
    height: 36,
    borderRadius: 5,
  },
  paletteItemText: { flex: 1 },
  paletteItemTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: C.text,
    marginBottom: 2,
  },
  paletteItemSub: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: C.textSecondary,
  },
  paletteItemMeta: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: C.textTertiary,
    marginTop: 2,
  },
});
